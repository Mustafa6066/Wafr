import { Coins } from "lucide-react";
import { useState, useEffect, createContext, useContext, useCallback, lazy, Suspense } from "react";
import { CURRENCIES, FREE_LIMITS, ACHIEVEMENTS, LEVELS, CATEGORIES, THEME } from "./constants.js";
import {
  useAuthStore, useProfileStore, useSubscriptionStore, useExpenseStore,
  useGoalStore, useBudgetStore, useRecurringStore, useTransactionInboxStore,
  useGamificationStore, useAIChatStore, useDebtStore, useSettingsStore, useBillSplitStore,
} from "./store/index.js";
import { useAuth } from "./auth/AuthProvider.jsx";
import { useI18n } from "./i18n/i18nProvider.jsx";
import { PaywallModal, Toast, GlobalStyles } from "./Shared.jsx";

// Lazy-load heavy screens
const LoginScreen = lazy(() => import("./auth/LoginScreen.jsx"));
const Onboarding = lazy(() => import("./Onboarding.jsx"));
const Dashboard = lazy(() => import("./Dashboard.jsx"));

// ─── App Context: bridge for existing components that still call useApp() ───
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ─── Loading Spinner ───
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(160deg, ${THEME.bg} 0%, ${THEME.bgSecondary} 50%, ${THEME.bgTertiary} 100%)`,
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20,
        background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
        boxShadow: `0 12px 40px ${THEME.accentGlow}`,
        animation: "pulse 2s ease-in-out infinite",
      }}><Coins size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
      <p style={{ color: THEME.white50, fontSize: 14, fontFamily: THEME.font }}>Loading Wafr...</p>
    </div>
  );
}

export default function WafrApp() {
  const { user, loading: authLoading } = useAuth();
  const { t, locale } = useI18n();

  // ── Zustand Stores ──
  const profile = useProfileStore(s => s.profile);
  const updateProfile = useProfileStore(s => s.setProfile);  // setProfile handles both functions and plain objects

  const subscription = useSubscriptionStore(s => s.subscription);
  const setSubscription = useSubscriptionStore(s => s.setSubscription);

  const expenses = useExpenseStore(s => s.expenses);
  const zustandAddExpense = useExpenseStore(s => s.addExpense);
  const zustandDeleteExpense = useExpenseStore(s => s.deleteExpense);

  const goals = useGoalStore(s => s.goals);
  const zustandAddGoal = useGoalStore(s => s.addGoal);
  const zustandUpdateGoal = useGoalStore(s => s.updateGoal);
  const zustandDeleteGoal = useGoalStore(s => s.deleteGoal);

  const budgets = useBudgetStore(s => s.budgets);
  const setBudgets = useBudgetStore(s => s.setBudgets);

  const recurring = useRecurringStore(s => s.recurring);
  const setRecurring = useRecurringStore(s => s.setRecurring);

  const inbox = useTransactionInboxStore(s => s.inbox);
  const addToInbox = useTransactionInboxStore(s => s.addToInbox);
  const approveTransaction = useTransactionInboxStore(s => s.approveTransaction);
  const rejectTransaction = useTransactionInboxStore(s => s.rejectTransaction);

  const gamification = useGamificationStore(s => s);
  const aiChat = useAIChatStore(s => s);

  const debts = useDebtStore(s => s.debts);
  const addDebt = useDebtStore(s => s.addDebt);
  const updateDebt = useDebtStore(s => s.updateDebt);
  const deleteDebtFn = useDebtStore(s => s.deleteDebt);

  const settings = useSettingsStore(s => s.settings);
  const setSettings = useSettingsStore(s => s.setSettings);

  const billSplits = useBillSplitStore(s => s.splits);
  const addSplit = useBillSplitStore(s => s.addSplit);
  const updateSplit = useBillSplitStore(s => s.updateSplit);
  const deleteSplit = useBillSplitStore(s => s.deleteSplit);

  // ── Transient State ──
  const [showPaywall, setShowPaywall] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // ── Derived State ──
  const isDemo = !user && localStorage.getItem("wafrDemoMode") === "true";
  const isAuthenticated = !!user || isDemo;
  const hasOnboarded = profile.country && profile.income;

  const isPremium = (() => {
    if (subscription?.plan && subscription.plan !== "free") return true;
    if (subscription?.status === "active") return true;
    if (subscription?.status === "trialing") {
      return new Date(subscription.trial_end || subscription.trialEnd) > new Date();
    }
    return false;
  })();

  const curr = CURRENCIES[profile.currency] || CURRENCIES.EGP;

  // Current month expenses
  const now = new Date();
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalSpent = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const budget = profile.income || 10000;

  // Points & Level (legacy compat + Zustand data)
  const challengeLog = {
    completed: gamification.challengeLog?.completed || {},
    streak: gamification.challengeLog?.streak || 0,
    lastDate: gamification.challengeLog?.lastDate || null,
    totalCompleted: gamification.challengeLog?.totalCompleted || 0,
    points: gamification.points || 0,
  };
  const unlockedAchievements = gamification.achievements || [];
  const totalPoints = challengeLog.points + (unlockedAchievements.length * 50);
  const currentLevel = [...LEVELS].reverse().find(l => totalPoints >= l.minPoints) || LEVELS[0];

  // AI compat
  const aiChatHistory = aiChat.messages || [];
  const aiMessageCount = aiChat.messageCount || { date: null, count: 0 };

  // ── Toast Helper ──
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  }, []);

  // ── Expense CRUD (with paywall + achievements) ──
  const addExpense = useCallback((expense) => {
    if (!isPremium && currentMonthExpenses.length >= FREE_LIMITS.maxExpenses) {
      setShowPaywall(true);
      return false;
    }
    zustandAddExpense(expense);
    showToast(`Expense added: ${curr.symbol} ${Number(expense.amount).toLocaleString()}`);
    setTimeout(() => checkAchievements({ totalExpenses: expenses.length + 1 }), 50);
    return true;
  }, [isPremium, currentMonthExpenses.length, expenses.length, curr.symbol]);

  const deleteExpense = useCallback((id) => {
    zustandDeleteExpense(id);
    showToast("Expense deleted", "info");
  }, []);

  // ── Goals CRUD ──
  const addGoal = useCallback((goal) => {
    if (!isPremium && goals.length >= FREE_LIMITS.maxGoals) {
      setShowPaywall(true);
      return false;
    }
    zustandAddGoal(goal);
    showToast(`Goal created: ${goal.name}`);
    setTimeout(() => checkAchievements({ totalGoals: goals.length + 1 }), 50);
    return true;
  }, [isPremium, goals.length]);

  const addToGoal = useCallback((goalId, amount) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const newSaved = Math.min(goal.saved + Number(amount), goal.target);
    const progress = Math.round((newSaved / goal.target) * 100);
    if (progress >= 100 && Math.round((goal.saved / goal.target) * 100) < 100) {
      showToast(`Goal completed: ${goal.name}! `, "success");
    }
    zustandUpdateGoal({ ...goal, saved: newSaved });
  }, [goals]);

  const deleteGoal = useCallback((id) => {
    zustandDeleteGoal(id);
    showToast("Goal deleted", "info");
  }, []);

  // ── Challenge Completion ──
  const completeChallenge = useCallback((challengeId, reward) => {
    gamification.completeChallenge(challengeId, reward);
    showToast(`Challenge complete! +${reward} points `);
  }, []);

  // ── AI Message Counter ──
  const canSendAiMessage = useCallback(() => {
    if (isPremium) return true;
    const today = new Date().toDateString();
    if (aiMessageCount.date !== today) return true;
    return aiMessageCount.count < FREE_LIMITS.maxAiMessages;
  }, [isPremium, aiMessageCount]);

  const incrementAiCount = useCallback(() => {
    if (aiChat.incrementMessageCount) aiChat.incrementMessageCount();
  }, []);

  // ── Subscription ──
  const subscribe = useCallback((plan) => {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    setSubscription({
      plan,
      status: "trialing",
      startDate: new Date().toISOString(),
      trialEnd: trialEnd.toISOString(),
      trial_end: trialEnd.toISOString(),
    });
    setShowPaywall(false);
    showToast("Welcome to Wafr Pro! ");
  }, []);

  const cancelSubscription = useCallback(() => {
    setSubscription({ plan: "free", status: "canceled", startDate: null, trialEnd: null });
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

    ACHIEVEMENTS.forEach(a => {
      if (!unlockedAchievements.includes(a.id) && a.condition(fullStats)) {
        gamification.addAchievement(a.id);
        gamification.addPoints(50);
        showToast(`Achievement unlocked: ${a.name}!`);
      }
    });
  }, [expenses.length, goals, challengeLog, budgets, aiChatHistory, unlockedAchievements]);

  // Check achievements on data changes
  useEffect(() => {
    if (hasOnboarded) checkAchievements();
  }, [expenses.length, goals.length, challengeLog.streak, challengeLog.totalCompleted]);

  // ── Data Export ──
  const exportData = useCallback(() => {
    if (!isPremium) { setShowPaywall(true); return; }
    const data = {
      profile, expenses, goals, budgets, recurring, debts, billSplits,
      gamification: { points: totalPoints, achievements: unlockedAchievements },
      settings, exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wafr-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully!");
  }, [isPremium, profile, expenses, goals, budgets, recurring, debts, billSplits, settings]);

  // ── Reset Data ──
  const resetAllData = useCallback(() => {
    useExpenseStore.getState().clearExpenses();
    useGoalStore.getState().clearGoals();
    useBudgetStore.getState().clearBudgets();
    useRecurringStore.getState().clearRecurring();
    useDebtStore.getState().clearDebts();
    useBillSplitStore.getState().clearSplits();
    useGamificationStore.getState().reset();
    useAIChatStore.getState().clearMessages();
    showToast("All data cleared", "warning");
  }, []);

  // ── Context Value (legacy bridge — same shape as before) ──
  const ctx = {
    // Profile
    profile, setProfile: updateProfile, curr, isPremium,
    // Expenses
    expenses, currentMonthExpenses, totalSpent, budget,
    addExpense, deleteExpense,
    // Goals
    goals, addGoal, addToGoal, deleteGoal,
    // Budgets
    budgets, setBudgets,
    // Recurring
    recurring, setRecurring,
    // Inbox (new)
    inbox, addToInbox, approveTransaction, rejectTransaction,
    // Challenges
    challengeLog, completeChallenge,
    // AI
    aiChatHistory, setAiChatHistory: aiChat.setMessages || (() => {}),
    canSendAiMessage, incrementAiCount, aiMessageCount,
    // Achievements
    unlockedAchievements, totalPoints, currentLevel,
    // Subscription
    subscription, subscribe, cancelSubscription,
    showPaywall: () => setShowPaywall(true),
    // Debts (new)
    debts, addDebt, updateDebt, deleteDebt: deleteDebtFn,
    // Bill Splits (new)
    billSplits, addSplit, updateSplit, deleteSplit,
    // Settings
    settings, setSettings,
    // Utilities
    showToast, exportData, resetAllData,
    // i18n
    locale,
  };

  // ── Auth loading ──
  if (authLoading && !isDemo) {
    return <LoadingScreen />;
  }

  // ── Render ──
  return (
    <AppContext.Provider value={ctx}>
      <div style={{
        minHeight: "100vh", maxWidth: 480, margin: "0 auto",
        background: `linear-gradient(160deg, ${THEME.bg} 0%, ${THEME.bgSecondary} 40%, ${THEME.bgTertiary} 100%)`,
        position: "relative",
      }}>
        <Suspense fallback={<LoadingScreen />}>
          {!isAuthenticated ? (
            <LoginScreen />
          ) : !hasOnboarded ? (
            <Onboarding onComplete={() => updateProfile({ onboarded: true, country: profile.country || "EG" })} />
          ) : (
            <Dashboard />
          )}
        </Suspense>
      </div>

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
