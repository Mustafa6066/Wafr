import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { CURRENCIES, FREE_LIMITS, ACHIEVEMENTS, LEVELS, CATEGORIES } from "./constants.js";
import { useLocalStorage } from "./useLocalStorage.js";
import { PaywallModal, Toast, GlobalStyles } from "./Shared.jsx";
import Onboarding from "./Onboarding.jsx";
import Dashboard from "./Dashboard.jsx";

// ─── App Context: shared state across all components ───
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export default function WafrApp() {
  // ── Persisted State ──
  const [profile, setProfile] = useLocalStorage("wafr_profile", {
    country: "", currency: "EGP", income: 0, topSpend: [], avgWaste: 3000, name: "",
  });
  const [onboarded, setOnboarded] = useLocalStorage("wafr_onboarded", false);
  const [subscription, setSubscription] = useLocalStorage("wafr_subscription", {
    plan: "free", startDate: null, trialEnd: null,
  });
  const [expenses, setExpenses] = useLocalStorage("wafr_expenses", []);
  const [goals, setGoals] = useLocalStorage("wafr_goals", []);
  const [budgets, setBudgets] = useLocalStorage("wafr_budgets", {});
  const [recurring, setRecurring] = useLocalStorage("wafr_recurring", []);
  const [challengeLog, setChallengeLog] = useLocalStorage("wafr_challenges", {
    completed: {}, streak: 0, lastDate: null, totalCompleted: 0, points: 0,
  });
  const [aiChatHistory, setAiChatHistory] = useLocalStorage("wafr_ai_chat", []);
  const [aiMessageCount, setAiMessageCount] = useLocalStorage("wafr_ai_count", { date: null, count: 0 });
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage("wafr_achievements", []);
  const [settings, setSettings] = useLocalStorage("wafr_settings", {
    language: "en", notifications: true, budgetResetDay: 1,
  });

  // ── Transient State ──
  const [showPaywall, setShowPaywall] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // ── Derived State ──
  const isPremium = subscription.plan !== "free";
  const curr = CURRENCIES[profile.currency] || CURRENCIES.EGP;

  // Current month expenses
  const now = new Date();
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalSpent = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const budget = profile.income || 10000;

  // Points & Level
  const totalPoints = challengeLog.points + (unlockedAchievements.length * 50);
  const currentLevel = [...LEVELS].reverse().find(l => totalPoints >= l.minPoints) || LEVELS[0];

  // ── Toast Helper ──
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  }, []);

  // ── Expense CRUD ──
  const addExpense = useCallback((expense) => {
    const newExp = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...expense,
      amount: Number(expense.amount),
    };

    // Free tier limit check
    if (!isPremium && currentMonthExpenses.length >= FREE_LIMITS.maxExpenses) {
      setShowPaywall(true);
      return false;
    }

    setExpenses(prev => [newExp, ...prev]);
    showToast(`Expense added: ${curr.symbol} ${Number(expense.amount).toLocaleString()}`);
    checkAchievements({ totalExpenses: expenses.length + 1 });
    return true;
  }, [isPremium, currentMonthExpenses.length, expenses.length, curr.symbol]);

  const deleteExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast("Expense deleted", "info");
  }, []);

  // ── Goals CRUD ──
  const addGoal = useCallback((goal) => {
    if (!isPremium && goals.length >= FREE_LIMITS.maxGoals) {
      setShowPaywall(true);
      return false;
    }
    const newGoal = { id: Date.now(), saved: 0, createdAt: new Date().toISOString(), ...goal };
    setGoals(prev => [...prev, newGoal]);
    showToast(`Goal created: ${goal.name}`);
    checkAchievements({ totalGoals: goals.length + 1 });
    return true;
  }, [isPremium, goals.length]);

  const addToGoal = useCallback((goalId, amount) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newSaved = Math.min(g.saved + Number(amount), g.target);
      const progress = Math.round((newSaved / g.target) * 100);
      if (progress >= 100 && Math.round((g.saved / g.target) * 100) < 100) {
        showToast(`Goal completed: ${g.name}! 🎉`, "success");
      }
      return { ...g, saved: newSaved };
    }));
  }, []);

  const deleteGoal = useCallback((id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    showToast("Goal deleted", "info");
  }, []);

  // ── Challenge Completion ──
  const completeChallenge = useCallback((challengeId, reward) => {
    const today = new Date().toDateString();
    setChallengeLog(prev => {
      const wasYesterday = prev.lastDate === new Date(Date.now() - 86400000).toDateString();
      const isToday = prev.lastDate === today;
      return {
        completed: { ...prev.completed, [today]: challengeId },
        streak: isToday ? prev.streak : (wasYesterday ? prev.streak + 1 : 1),
        lastDate: today,
        totalCompleted: prev.totalCompleted + (isToday ? 0 : 1),
        points: prev.points + reward,
      };
    });
    showToast(`Challenge complete! +${reward} points 🎯`);
  }, []);

  // ── AI Message Counter ──
  const canSendAiMessage = useCallback(() => {
    if (isPremium) return true;
    const today = new Date().toDateString();
    if (aiMessageCount.date !== today) return true;
    return aiMessageCount.count < FREE_LIMITS.maxAiMessages;
  }, [isPremium, aiMessageCount]);

  const incrementAiCount = useCallback(() => {
    const today = new Date().toDateString();
    setAiMessageCount(prev => ({
      date: today,
      count: prev.date === today ? prev.count + 1 : 1,
    }));
  }, []);

  // ── Subscription ──
  const subscribe = useCallback((plan) => {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 3);
    setSubscription({ plan, startDate: new Date().toISOString(), trialEnd: trialEnd.toISOString() });
    setShowPaywall(false);
    showToast("Welcome to Wafr Pro! 🎉");
  }, []);

  const cancelSubscription = useCallback(() => {
    setSubscription({ plan: "free", startDate: null, trialEnd: null });
    showToast("Subscription cancelled", "info");
  }, []);

  // ── Achievement Checker ──
  const checkAchievements = useCallback((stats = {}) => {
    const maxGoalProgress = goals.length > 0
      ? Math.max(...goals.map(g => g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0))
      : 0;
    const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
    const fullStats = {
      totalExpenses: expenses.length,
      totalGoals: goals.length,
      maxGoalProgress,
      totalSaved,
      streak: challengeLog.streak,
      hasBudget: Object.keys(budgets).length > 0,
      monthsUnderBudget: 0,
      aiChats: aiChatHistory.filter(m => m.role === "user").length,
      challengesCompleted: challengeLog.totalCompleted,
      ...stats,
    };

    const newUnlocks = [];
    ACHIEVEMENTS.forEach(a => {
      if (!unlockedAchievements.includes(a.id) && a.condition(fullStats)) {
        newUnlocks.push(a.id);
      }
    });

    if (newUnlocks.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newUnlocks]);
      const achievement = ACHIEVEMENTS.find(a => a.id === newUnlocks[0]);
      if (achievement) showToast(`Achievement unlocked: ${achievement.icon} ${achievement.name}!`);
    }
  }, [expenses.length, goals, challengeLog, budgets, aiChatHistory, unlockedAchievements]);

  // Check achievements on mount and data changes
  useEffect(() => {
    if (onboarded) checkAchievements();
  }, [expenses.length, goals.length, challengeLog.streak, challengeLog.totalCompleted]);

  // ── Data Export ──
  const exportData = useCallback(() => {
    if (!isPremium) { setShowPaywall(true); return; }
    const data = { profile, expenses, goals, budgets, recurring, challengeLog, settings, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wafr-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully!");
  }, [isPremium, profile, expenses, goals, budgets, recurring, challengeLog, settings]);

  // ── Reset Data ──
  const resetAllData = useCallback(() => {
    setExpenses([]);
    setGoals([]);
    setBudgets({});
    setRecurring([]);
    setChallengeLog({ completed: {}, streak: 0, lastDate: null, totalCompleted: 0, points: 0 });
    setAiChatHistory([]);
    setAiMessageCount({ date: null, count: 0 });
    setUnlockedAchievements([]);
    showToast("All data cleared", "warning");
  }, []);

  // ── Context Value ──
  const ctx = {
    // Profile
    profile, setProfile, curr, isPremium,
    // Expenses
    expenses, currentMonthExpenses, totalSpent, budget,
    addExpense, deleteExpense,
    // Goals
    goals, addGoal, addToGoal, deleteGoal,
    // Budgets
    budgets, setBudgets,
    // Recurring
    recurring, setRecurring,
    // Challenges
    challengeLog, completeChallenge,
    // AI
    aiChatHistory, setAiChatHistory, canSendAiMessage, incrementAiCount, aiMessageCount,
    // Achievements
    unlockedAchievements, totalPoints, currentLevel,
    // Subscription
    subscription, subscribe, cancelSubscription,
    showPaywall: () => setShowPaywall(true),
    // Settings
    settings, setSettings,
    // Utilities
    showToast, exportData, resetAllData,
  };

  // ── Render ──
  if (!onboarded) {
    return (
      <AppContext.Provider value={ctx}>
        <Onboarding onComplete={() => setOnboarded(true)} />
        <GlobalStyles />
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={ctx}>
      <Dashboard />
      <PaywallModal
        show={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={subscribe}
        currency={profile.currency}
      />
      <Toast {...toast} />
      <GlobalStyles />
    </AppContext.Provider>
  );
}
