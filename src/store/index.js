// ─── Zustand Store — Central state management with offline-first sync ───
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Auth Store ───
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      clear: () => set({ user: null, session: null, loading: false }),
    }),
    { name: 'wafr-auth', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Profile Store ───
export const useProfileStore = create(
  persist(
    (set) => ({
      profile: {
        country: '', currency: 'EGP', income: 0, topSpend: [],
        avgWaste: 3000, name: '', onboarded: false,
      },
      setProfile: (updates) => set((state) => ({
        profile: typeof updates === 'function' ? updates(state.profile) : { ...state.profile, ...updates },
      })),
      resetProfile: () => set({
        profile: { country: '', currency: 'EGP', income: 0, topSpend: [], avgWaste: 3000, name: '', onboarded: false },
      }),
    }),
    { name: 'wafr-profile', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Subscription Store ───
export const useSubscriptionStore = create(
  persist(
    (set, get) => ({
      subscription: { plan: 'free', status: 'active', startDate: null, trialEnd: null, stripeCustomerId: null },
      isPremium: false,

      setSubscription: (sub) => {
        const merged = { ...get().subscription, ...sub };
        set({
          subscription: merged,
          isPremium: merged.plan !== 'free' && merged.status !== 'expired' && merged.status !== 'canceled',
        });
      },

      subscribe: (plan) => {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7); // 7-day trial
        set({
          subscription: {
            plan,
            status: 'trialing',
            startDate: new Date().toISOString(),
            trialEnd: trialEnd.toISOString(),
            stripeCustomerId: null,
          },
          isPremium: true,
        });
      },

      cancelSubscription: () => {
        set({
          subscription: { plan: 'free', status: 'active', startDate: null, trialEnd: null, stripeCustomerId: null },
          isPremium: false,
        });
      },
    }),
    { name: 'wafr-subscription', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Expense Store ───
export const useExpenseStore = create(
  persist(
    (set, get) => ({
      expenses: [],
      
      addExpense: (expense) => {
        const newExp = {
          id: expense.id || crypto.randomUUID(),
          date: expense.date || new Date().toISOString(),
          name: expense.name,
          amount: Number(expense.amount),
          category: expense.category || 'other',
          merchant: expense.merchant || null,
          source: expense.source || 'manual',
          autoDetected: expense.autoDetected || false,
          confidence: expense.confidence || 1.0,
          receiptUrl: expense.receiptUrl || null,
          notes: expense.notes || '',
          recurringId: expense.recurringId || null,
        };
        set((state) => ({ expenses: [newExp, ...state.expenses] }));
        return newExp;
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map(e => e.id === id ? { ...e, ...updates } : e),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) }));
      },

      getCurrentMonthExpenses: () => {
        const now = new Date();
        return get().expenses.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
      },

      getTotalSpent: () => {
        const now = new Date();
        return get().expenses
          .filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          })
          .reduce((s, e) => s + e.amount, 0);
      },

      getExpensesByCategory: (period = 'month') => {
        const now = new Date();
        let filtered = get().expenses;
        if (period === 'month') {
          filtered = filtered.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          });
        } else if (period === 'week') {
          const weekAgo = new Date(now - 7 * 86400000);
          filtered = filtered.filter(e => new Date(e.date) >= weekAgo);
        }
        const byCategory = {};
        filtered.forEach(e => {
          byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        });
        return byCategory;
      },

      clearExpenses: () => set({ expenses: [] }),
    }),
    { name: 'wafr-expenses', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Goals Store ───
export const useGoalStore = create(
  persist(
    (set, get) => ({
      goals: [],

      addGoal: (goal) => {
        const newGoal = {
          id: goal.id || crypto.randomUUID(),
          name: goal.name,
          target: Number(goal.target),
          saved: 0,
          deadline: goal.deadline || null,
          icon: goal.icon || '',
          color: goal.color || '#00D4AA',
          autoSaveEnabled: goal.autoSaveEnabled || false,
          autoSaveAmount: goal.autoSaveAmount || 0,
          autoSaveFrequency: goal.autoSaveFrequency || 'monthly',
          createdAt: new Date().toISOString(),
          completedAt: null,
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
        return newGoal;
      },

      addToGoal: (goalId, amount) => {
        let completed = false;
        set((state) => ({
          goals: state.goals.map(g => {
            if (g.id !== goalId) return g;
            const newSaved = Math.min(g.saved + Number(amount), g.target);
            if (newSaved >= g.target && g.saved < g.target) completed = true;
            return {
              ...g,
              saved: newSaved,
              completedAt: newSaved >= g.target ? new Date().toISOString() : null,
            };
          }),
        }));
        return completed;
      },

      deleteGoal: (id) => {
        set((state) => ({ goals: state.goals.filter(g => g.id !== id) }));
      },

      getTotalSaved: () => get().goals.reduce((s, g) => s + g.saved, 0),

      getMaxProgress: () => {
        const goals = get().goals;
        if (goals.length === 0) return 0;
        return Math.max(...goals.map(g => g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0));
      },

      clearGoals: () => set({ goals: [] }),
    }),
    { name: 'wafr-goals', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Budget Store ───
export const useBudgetStore = create(
  persist(
    (set, get) => ({
      budgets: {},
      setBudget: (category, amount) => {
        set((state) => ({
          budgets: { ...state.budgets, [category]: Number(amount) },
        }));
      },
      removeBudget: (category) => {
        set((state) => {
          const next = { ...state.budgets };
          delete next[category];
          return { budgets: next };
        });
      },
      applyTemplate: (budgets) => set({ budgets }),
      clearBudgets: () => set({ budgets: {} }),
    }),
    { name: 'wafr-budgets', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Recurring Expenses Store ───
export const useRecurringStore = create(
  persist(
    (set, get) => ({
      recurring: [],

      addRecurring: (item) => {
        const newItem = {
          id: item.id || crypto.randomUUID(),
          name: item.name,
          amount: Number(item.amount),
          category: item.category || 'bills',
          frequency: item.frequency || 'monthly',
          nextDue: item.nextDue || null,
          lastCharged: item.lastCharged || null,
          autoDetected: item.autoDetected || false,
          merchant: item.merchant || null,
          isActive: true,
          notifyBeforeDays: item.notifyBeforeDays || 1,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ recurring: [...state.recurring, newItem] }));
        return newItem;
      },

      updateRecurring: (id, updates) => {
        set((state) => ({
          recurring: state.recurring.map(r => r.id === id ? { ...r, ...updates } : r),
        }));
      },

      deleteRecurring: (id) => {
        set((state) => ({ recurring: state.recurring.filter(r => r.id !== id) }));
      },

      getActiveRecurring: () => get().recurring.filter(r => r.isActive),

      getMonthlyTotal: () => {
        return get().recurring.filter(r => r.isActive).reduce((total, r) => {
          switch (r.frequency) {
            case 'daily': return total + r.amount * 30;
            case 'weekly': return total + r.amount * 4.33;
            case 'biweekly': return total + r.amount * 2.17;
            case 'monthly': return total + r.amount;
            case 'quarterly': return total + r.amount / 3;
            case 'yearly': return total + r.amount / 12;
            default: return total + r.amount;
          }
        }, 0);
      },

      getUpcoming: (days = 7) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + days);
        return get().recurring.filter(r => {
          if (!r.isActive || !r.nextDue) return false;
          return new Date(r.nextDue) <= cutoff;
        });
      },

      setRecurring: (recurring) => set({ recurring }),

      clearRecurring: () => set({ recurring: [] }),
    }),
    { name: 'wafr-recurring', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Transaction Inbox Store (auto-detected transactions) ───
export const useTransactionInboxStore = create(
  persist(
    (set, get) => ({
      pendingTransactions: [],

      addPending: (tx) => {
        const newTx = {
          id: tx.id || crypto.randomUUID(),
          source: tx.source,
          rawText: tx.rawText || '',
          parsedAmount: tx.parsedAmount,
          parsedMerchant: tx.parsedMerchant || '',
          parsedDate: tx.parsedDate || new Date().toISOString(),
          categorySuggestion: tx.categorySuggestion || 'other',
          confidence: tx.confidence || 0.5,
          processed: false,
          approved: null,
          imageUrl: tx.imageUrl || null,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ pendingTransactions: [newTx, ...state.pendingTransactions] }));
        return newTx;
      },

      approvePending: (id) => {
        set((state) => ({
          pendingTransactions: state.pendingTransactions.map(tx =>
            tx.id === id ? { ...tx, processed: true, approved: true } : tx
          ),
        }));
      },

      dismissPending: (id) => {
        set((state) => ({
          pendingTransactions: state.pendingTransactions.map(tx =>
            tx.id === id ? { ...tx, processed: true, approved: false } : tx
          ),
        }));
      },

      getUnprocessed: () => get().pendingTransactions.filter(tx => !tx.processed),
      getUnprocessedCount: () => get().pendingTransactions.filter(tx => !tx.processed).length,
      clearInbox: () => set({ pendingTransactions: [] }),
    }),
    { name: 'wafr-tx-inbox', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Gamification Store ───
export const useGamificationStore = create(
  persist(
    (set, get) => ({
      challengeLog: {
        completed: {}, streak: 0, lastDate: null, totalCompleted: 0, points: 0,
      },
      unlockedAchievements: [],

      completeChallenge: (challengeId, reward) => {
        const today = new Date().toDateString();
        set((state) => {
          const prev = state.challengeLog;
          const wasYesterday = prev.lastDate === new Date(Date.now() - 86400000).toDateString();
          const isToday = prev.lastDate === today;
          return {
            challengeLog: {
              completed: { ...prev.completed, [today]: challengeId },
              streak: isToday ? prev.streak : (wasYesterday ? prev.streak + 1 : 1),
              lastDate: today,
              totalCompleted: prev.totalCompleted + (isToday ? 0 : 1),
              points: prev.points + reward,
            },
          };
        });
      },

      unlockAchievement: (achievementId) => {
        set((state) => {
          if (state.unlockedAchievements.includes(achievementId)) return state;
          return { unlockedAchievements: [...state.unlockedAchievements, achievementId] };
        });
      },

      getTotalPoints: () => {
        const state = get();
        return state.challengeLog.points + (state.unlockedAchievements.length * 50);
      },

      resetGamification: () => set({
        challengeLog: { completed: {}, streak: 0, lastDate: null, totalCompleted: 0, points: 0 },
        unlockedAchievements: [],
      }),
    }),
    { name: 'wafr-gamification', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── AI Chat Store ───
export const useAIChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      chatHistory: [], // legacy alias
      messageCount: { date: null, count: 0 },

      addMessage: (message) => {
        const newMsg = {
          id: crypto.randomUUID(),
          role: message.role,
          text: message.text,
          metadata: message.metadata || {},
          time: Date.now(),
        };
        set((state) => ({
          messages: [...state.messages, newMsg],
          chatHistory: [...state.messages, newMsg], // keep in sync
        }));
      },

      setMessages: (messages) => set({ messages, chatHistory: messages }),

      canSendMessage: (isPremium) => {
        if (isPremium) return true;
        const today = new Date().toDateString();
        const { messageCount } = get();
        if (messageCount.date !== today) return true;
        return messageCount.count < 5; // Free: 5 messages/day
      },

      incrementCount: () => {
        const today = new Date().toDateString();
        set((state) => ({
          messageCount: {
            date: today,
            count: state.messageCount.date === today ? state.messageCount.count + 1 : 1,
          },
        }));
      },

      incrementMessageCount: () => {
        const today = new Date().toDateString();
        set((state) => ({
          messageCount: {
            date: today,
            count: state.messageCount.date === today ? state.messageCount.count + 1 : 1,
          },
        }));
      },

      clearMessages: () => set({ messages: [], chatHistory: [] }),
      clearChat: () => set({ messages: [], chatHistory: [] }),
    }),
    { name: 'wafr-ai-chat', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Debt Store ───
export const useDebtStore = create(
  persist(
    (set, get) => ({
      debts: [],

      addDebt: (debt) => {
        const newDebt = {
          id: debt.id || crypto.randomUUID(),
          name: debt.name,
          type: debt.type || 'loan',
          totalAmount: Number(debt.totalAmount),
          remainingAmount: Number(debt.remainingAmount || debt.totalAmount),
          interestRate: Number(debt.interestRate || 0),
          minimumPayment: Number(debt.minimumPayment || 0),
          dueDate: debt.dueDate || null,
          lender: debt.lender || '',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ debts: [...state.debts, newDebt] }));
        return newDebt;
      },

      makePayment: (debtId, amount) => {
        set((state) => ({
          debts: state.debts.map(d => {
            if (d.id !== debtId) return d;
            return { ...d, remainingAmount: Math.max(0, d.remainingAmount - Number(amount)) };
          }),
        }));
      },

      deleteDebt: (id) => {
        set((state) => ({ debts: state.debts.filter(d => d.id !== id) }));
      },

      getTotalDebt: () => get().debts.reduce((s, d) => s + d.remainingAmount, 0),
      getTotalMinPayment: () => get().debts.reduce((s, d) => s + d.minimumPayment, 0),
      clearDebts: () => set({ debts: [] }),
    }),
    { name: 'wafr-debts', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Settings Store ───
export const useSettingsStore = create(
  persist(
    (set) => ({
      settings: {
        language: 'en',
        notifications: true,
        budgetResetDay: 1,
        theme: 'dark',
        smsParsingEnabled: false,
        receiptScanningEnabled: false,
        roundUpEnabled: false,
        roundUpGoalId: null,
        // Privacy & Auto-Tracking (Layer 1-5 Architecture)
        autoTrackingEnabled: false,          // OFF by default — user must opt-in
        notificationListenerEnabled: false,  // NotificationListener permission
        onDeviceOnly: true,                  // All processing on-device (always true for V1)
        showAuditLog: true,                  // Show privacy audit in settings
        autoApproveHighConfidence: false,     // Auto-approve transactions with >90% confidence
        privacyModeEnabled: false,           // Extra privacy: no analytics, no crash reports
        openBankingConnected: false,         // Layer 4: Open Banking API connected
        trustedSendersCustom: [],            // User-added trusted sender IDs
      },
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },
      resetSettings: () => set({
        settings: {
          language: 'en', notifications: true, budgetResetDay: 1, theme: 'dark',
          smsParsingEnabled: false, receiptScanningEnabled: false,
          roundUpEnabled: false, roundUpGoalId: null,
          autoTrackingEnabled: false, notificationListenerEnabled: false,
          onDeviceOnly: true, showAuditLog: true, autoApproveHighConfidence: false,
          privacyModeEnabled: false, openBankingConnected: false, trustedSendersCustom: [],
        },
      }),
    }),
    { name: 'wafr-settings', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Privacy Audit Store ───
export const usePrivacyStore = create(
  persist(
    (set, get) => ({
      auditLog: [],
      stats: { blocked: 0, ignored: 0, parsed: 0, total: 0 },
      trustScreenSeen: false,

      addAuditEntry: (entry) => {
        set((state) => {
          const newLog = [{
            timestamp: entry.timestamp || Date.now(),
            sender: entry.sender || 'unknown',
            action: entry.action,
            reason: entry.reason,
          }, ...state.auditLog].slice(0, 200);
          const newStats = { ...state.stats, total: state.stats.total + 1 };
          if (entry.action === 'blocked') newStats.blocked++;
          else if (entry.action === 'ignored') newStats.ignored++;
          else if (entry.action === 'parsed') newStats.parsed++;
          return { auditLog: newLog, stats: newStats };
        });
      },

      markTrustScreenSeen: () => set({ trustScreenSeen: true }),

      clearAuditLog: () => set({
        auditLog: [],
        stats: { blocked: 0, ignored: 0, parsed: 0, total: 0 },
      }),

      getRecentAudit: (count = 20) => get().auditLog.slice(0, count),
    }),
    { name: 'wafr-privacy', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Bill Split Store ───
export const useBillSplitStore = create(
  persist(
    (set, get) => ({
      splits: [],

      createSplit: (split) => {
        const newSplit = {
          id: split.id || crypto.randomUUID(),
          title: split.title,
          totalAmount: Number(split.totalAmount),
          currency: split.currency || 'EGP',
          expenseId: split.expenseId || null,
          participants: (split.participants || []).map(p => ({
            id: crypto.randomUUID(),
            name: p.name,
            phone: p.phone || '',
            amount: Number(p.amount),
            isPaid: false,
            paidAt: null,
          })),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ splits: [newSplit, ...state.splits] }));
        return newSplit;
      },

      markPaid: (splitId, participantId) => {
        set((state) => ({
          splits: state.splits.map(s => {
            if (s.id !== splitId) return s;
            return {
              ...s,
              participants: s.participants.map(p =>
                p.id === participantId ? { ...p, isPaid: true, paidAt: new Date().toISOString() } : p
              ),
            };
          }),
        }));
      },

      deleteSplit: (id) => {
        set((state) => ({ splits: state.splits.filter(s => s.id !== id) }));
      },

      getActiveCount: () => get().splits.filter(s =>
        s.participants.some(p => !p.isPaid)
      ).length,

      clearSplits: () => set({ splits: [] }),
    }),
    { name: 'wafr-splits', storage: createJSONStorage(() => localStorage) }
  )
);
