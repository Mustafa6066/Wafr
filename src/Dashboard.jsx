import { FileText, Home, Bot, Inbox, Target, Zap, Briefcase, BarChart3, Trophy, Camera, RefreshCw, TrendingUp, HeartPulse, Users, PiggyBank, Moon, Smartphone, Eye, LineChart, CircleDashed, ShieldAlert, Swords, CalendarDays, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { useState, lazy, Suspense } from "react";
import { useApp } from "./WafrApp.jsx";
import { CATEGORIES, DAILY_CHALLENGES, THEME, FREE_LIMITS } from "./constants.js";
import { SectionHeader, ProBadge, PremiumGate } from "./Shared.jsx";
import { simulateNotification, DEMO_NOTIFICATIONS } from "./services/notificationParser.js";
import { parsePaymentText, getSupportedPlatforms } from "./services/smartCapture.js";
import { useTransactionInboxStore, useSettingsStore, usePrivacyStore } from "./store/index.js";

// Core screens
import AICoach from "./AICoach.jsx";
import SavingsGoals from "./SavingsGoals.jsx";
import BudgetPlanner from "./BudgetPlanner.jsx";
import Insights from "./Insights.jsx";
import Achievements from "./Achievements.jsx";
import Settings from "./Settings.jsx";

// New feature screens (lazy loaded)
const TransactionInbox = lazy(() => import("./features/TransactionInbox.jsx"));
const ReceiptScanner = lazy(() => import("./features/ReceiptScanner.jsx"));
const RecurringTracker = lazy(() => import("./features/RecurringTracker.jsx"));
const CashFlow = lazy(() => import("./features/CashFlow.jsx"));
const HealthScore = lazy(() => import("./features/HealthScore.jsx"));
const BillSplit = lazy(() => import("./features/BillSplit.jsx"));
const DebtTracker = lazy(() => import("./features/DebtTracker.jsx"));
const SavingsPots = lazy(() => import("./features/SavingsPots.jsx"));
const ZakatCalculator = lazy(() => import("./features/ZakatCalculator.jsx"));
const FamilyHub = lazy(() => import("./features/FamilyHub.jsx"));
const ShockScreen = lazy(() => import("./features/ShockScreen.jsx"));
const WealthSimulator = lazy(() => import("./features/WealthSimulator.jsx"));
const GameyyaOptimizer = lazy(() => import("./features/GameyyaOptimizer.jsx"));
const SubscriptionVampire = lazy(() => import("./features/SubscriptionVampire.jsx"));
const SavingsChallenges = lazy(() => import("./features/SavingsChallenges.jsx"));
const SmartCalendar = lazy(() => import("./features/SmartCalendar.jsx"));
const ShareCapture = lazy(() => import("./features/ShareCapture.jsx"));

// Mini loading for lazy components
function LazyFallback() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{ color: THEME.white50, fontSize: 14, fontFamily: THEME.font }}>Loading...</div>
    </div>
  );
}

export default function Dashboard() {
  const { profile, curr, isPremium, currentMonthExpenses, totalSpent, budget,
    addExpense, deleteExpense, challengeLog, completeChallenge, currentLevel, showPaywall,
    inbox } = useApp();

  const [tab, setTab] = useState("home");
  const [showAddModal, setShowAddModal] = useState(false);

  const remaining = budget - totalSpent;
  const pct = Math.min((totalSpent / budget) * 100, 100);
  const todayChallenge = DAILY_CHALLENGES[new Date().getDay() % DAILY_CHALLENGES.length];
  const todayDone = challengeLog.completed[new Date().toDateString()];

  // Inbox badge count
  const inboxPending = (inbox || []).filter(t => t.status === "pending").length;

  // 5 bottom tabs
  const tabs = [
    { id: "home", icon: <Home size={22} />, label: "Home" },
    { id: "ai", icon: <Bot size={22} />, label: "AI Coach" },
    { id: "inbox", icon: <Inbox size={22} />, label: "Inbox", badge: inboxPending },
    { id: "goals", icon: <Target size={22} />, label: "Goals" },
    { id: "more", icon: <Zap size={22} />, label: "More" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: THEME.font, paddingBottom: 90,
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: THEME.white50, fontSize: 14, margin: 0 }}>
              {getGreeting()} {profile.name ? profile.name : ""} 
            </p>
            <h1 style={{ fontFamily: THEME.fontSerif, fontSize: 24, color: THEME.white, margin: "4px 0 0", fontWeight: 800 }}>
              {tab === "home" ? "Your Savings" : tab === "more" ? "Features" : tab === "inbox" ? "Transaction Inbox" : ""}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isPremium && (
              <div style={{
                background: "linear-gradient(135deg, #FFD700, #FFB648)",
                color: THEME.bg, fontSize: 9, fontWeight: 800, padding: "4px 10px",
                borderRadius: 8, fontFamily: THEME.font,
              }}>PRO</div>
            )}
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>
              {currentLevel.icon}
            </div>
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <Suspense fallback={<LazyFallback />}>
        {tab === "home" && (
          <HomeTab
            curr={curr} remaining={remaining} totalSpent={totalSpent} budget={budget} pct={pct}
            profile={profile} isPremium={isPremium}
            expenses={currentMonthExpenses} onAddExpense={() => setShowAddModal(true)}
            deleteExpense={deleteExpense}
            todayChallenge={todayChallenge} todayDone={todayDone}
            challengeLog={challengeLog} completeChallenge={completeChallenge}
            showPaywall={showPaywall} inboxPending={inboxPending}
            onGoToInbox={() => setTab("inbox")}
          />
        )}
        {tab === "ai" && <AICoach />}
        {tab === "inbox" && <TransactionInbox />}
        {tab === "goals" && <SavingsGoals />}
        {tab === "more" && <MoreScreen setTab={setTab} isPremium={isPremium} showPaywall={showPaywall} />}
        {/* Sub-screens accessible from More */}
        {tab === "budget" && <BudgetPlanner />}
        {tab === "insights" && <Insights />}
        {tab === "achievements" && <Achievements />}
        {tab === "settings" && <Settings />}
        {tab === "receipt" && <ReceiptScanner />}
        {tab === "recurring" && <RecurringTracker />}
        {tab === "cashflow" && <CashFlow />}
        {tab === "health" && <HealthScore />}
        {tab === "split" && <BillSplit />}
        {tab === "debt" && <DebtTracker />}
        {tab === "pots" && <SavingsPots />}
        {tab === "zakat" && <ZakatCalculator />}
        {tab === "family" && <FamilyHub />}
        {tab === "shock" && <ShockScreen />}
        {tab === "wealth" && <WealthSimulator />}
        {tab === "gameyya" && <GameyyaOptimizer />}
        {tab === "vampire" && <SubscriptionVampire />}
        {tab === "challenges" && <SavingsChallenges />}
        {tab === "calendar" && <SmartCalendar />}
        {tab === "capture" && <ShareCapture />}
      </Suspense>

      {/* Add Expense Modal */}
      {showAddModal && (
        <AddExpenseModal curr={curr} onClose={() => setShowAddModal(false)} onAdd={(e) => { addExpense(e); setShowAddModal(false); }} />
      )}

      {/* Back button for sub-screens */}
      {!["home", "ai", "inbox", "goals", "more"].includes(tab) && (
        <button onClick={() => setTab("more")} style={{
          position: "fixed", top: 20, left: 20, zIndex: 200,
          background: THEME.cardBg, border: `1px solid ${THEME.cardBorder}`,
          borderRadius: 12, padding: "8px 14px", cursor: "pointer",
          color: THEME.white, fontSize: 13, fontWeight: 600, fontFamily: THEME.font,
          backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          ← Back
        </button>
      )}

      {/* Bottom Navigation */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(10,22,40,0.97)", backdropFilter: "blur(20px)",
        borderTop: `1px solid ${THEME.cardBorder}`,
        display: "flex", justifyContent: "space-around",
        padding: "8px 0 18px", zIndex: 100,
      }}>
        {tabs.map((t) => {
          const isActive = t.id === tab || (t.id === "more" && !["home", "ai", "inbox", "goals"].includes(tab));
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "4px 10px", minWidth: 0, position: "relative",
            }}>
              <span style={{
                fontSize: 20, filter: isActive ? "none" : "grayscale(0.5) opacity(0.4)",
                transition: "all 0.2s ease",
              }}>{t.icon}</span>
              <span style={{
                color: isActive ? THEME.accent : THEME.white30,
                fontSize: 10, fontWeight: 600, fontFamily: THEME.font,
              }}>{t.label}</span>
              {t.badge > 0 && (
                <div style={{
                  position: "absolute", top: -2, right: 2, minWidth: 16, height: 16,
                  borderRadius: 8, background: THEME.red, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: "#fff", fontFamily: THEME.font,
                  padding: "0 4px",
                }}>{t.badge > 99 ? "99+" : t.badge}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── MORE SCREEN (Feature Hub) ───
function MoreScreen({ setTab, isPremium, showPaywall }) {
  const features = [
    { id: "budget", icon: <Briefcase size={28} />, name: "Budget Planner", desc: "Set spending limits", free: true },
    { id: "insights", icon: <BarChart3 size={28} />, name: "Analytics", desc: "Spending insights", free: true },
    { id: "achievements", icon: <Trophy size={28} />, name: "Achievements", desc: "Badges & rewards", free: true },
    { id: "receipt", icon: <Camera size={28} />, name: "Receipt Scanner", desc: "OCR auto-tracking", pro: true },
    { id: "recurring", icon: <RefreshCw size={28} />, name: "Subscriptions", desc: "Recurring tracker", pro: true },
    { id: "cashflow", icon: <TrendingUp size={28} />, name: "Cash Flow", desc: "30-day projection", pro: true },
    { id: "health", icon: <HeartPulse size={28} />, name: "Health Score", desc: "Financial fitness", pro: true },
    { id: "split", icon: <Users size={28} />, name: "Bill Split", desc: "Split with friends", pro: true },
    { id: "debt", icon: <Target size={28} />, name: "Debt Payoff", desc: "Avalanche & snowball", pro: true },
    { id: "pots", icon: <PiggyBank size={28} />, name: "Savings Pots", desc: "Named buckets", pro: true },
    { id: "zakat", icon: <Moon size={28} />, name: "Zakat Calculator", desc: "Islamic obligation", free: true },
    { id: "family", icon: <Users size={28} />, name: "Family Hub", desc: "Family budgets", pro: true },
    { id: "capture", icon: <Smartphone size={28} />, name: "Smart Capture", desc: "Share & scan payments", free: true },
    { id: "shock", icon: <Eye size={28} />, name: "Money Mirror", desc: "Spending shock screen", pro: true },
    { id: "wealth", icon: <LineChart size={28} />, name: "Wealth Simulator", desc: "What-if projections", pro: true },
    { id: "gameyya", icon: <CircleDashed size={28} />, name: "Gameyya", desc: "Money circle optimizer", pro: true },
    { id: "vampire", icon: <ShieldAlert size={28} />, name: "Sub Detector", desc: "Kill unused subs", pro: true },
    { id: "challenges", icon: <Swords size={28} />, name: "Challenges", desc: "Social savings", free: true },
    { id: "calendar", icon: <CalendarDays size={28} />, name: "Smart Calendar", desc: "Seasonal intelligence", pro: true },
    { id: "settings", icon: <SettingsIcon size={28} />, name: "Settings", desc: "Profile & preferences", free: true },
  ];

  return (
    <div style={{ padding: "16px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {features.map(f => {
          const locked = f.pro && !isPremium;
          return (
            <button key={f.id} onClick={() => locked ? showPaywall() : setTab(f.id)} style={{
              background: THEME.cardBg, border: `1px solid ${THEME.cardBorder}`,
              borderRadius: 18, padding: "18px 14px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
              position: "relative", overflow: "hidden",
              opacity: locked ? 0.6 : 1,
            }}>
              {locked && (
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  background: "linear-gradient(135deg, #FFD700, #FFB648)",
                  color: THEME.bg, fontSize: 8, fontWeight: 800, padding: "2px 6px",
                  borderRadius: 6, fontFamily: THEME.font,
                }}>PRO</div>
              )}
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <div>
                <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font, textAlign: "left" }}>
                  {f.name}
                </p>
                <p style={{ color: THEME.white40, fontSize: 11, margin: "2px 0 0", fontFamily: THEME.font, textAlign: "left" }}>
                  {f.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── HOME TAB ───
function HomeTab({ curr, remaining, totalSpent, budget, pct, profile, isPremium,
  expenses, onAddExpense, deleteExpense, todayChallenge, todayDone,
  challengeLog, completeChallenge, showPaywall, inboxPending, onGoToInbox }) {

  const [expandedExpense, setExpandedExpense] = useState(null);
  const [showPasteSMS, setShowPasteSMS] = useState(false);
  const [smsText, setSmsText] = useState("");
  const [pasteResult, setPasteResult] = useState(null);

  const autoTrackEnabled = useSettingsStore(s => s.settings.autoTrackingEnabled);
  const privacyStats = usePrivacyStore(s => s.stats);
  const addPending = useTransactionInboxStore(s => s.addPending);
  const addAuditEntry = usePrivacyStore(s => s.addAuditEntry);

  const handlePasteSMS = () => {
    if (!smsText.trim()) return;
    // Try SmartCapture first (supports InstaPay, Fawry, Vodafone Cash, etc.)
    const smart = parsePaymentText(smsText.trim(), "paste");
    if (smart.blocked) {
      addAuditEntry({ type: "blocked", source: "paste", platform: null, timestamp: Date.now() });
      setPasteResult({ success: false, msg: " OTP/verification message — blocked for your safety" });
    } else if (smart.success) {
      addPending(smart.transaction);
      addAuditEntry({ type: "parsed", source: "paste", platform: smart.platform?.name || null, timestamp: Date.now() });
      setPasteResult({ success: true, msg: `${smart.transaction.currency} ${smart.transaction.parsedAmount.toLocaleString()} from ${smart.platform?.name || smart.transaction.bank}` });
    } else {
      // Fall back to existing SMS parser
      const result = simulateNotification(smsText.trim(), "");
      addAuditEntry(result.audit);
      if (result.result === "parsed" && result.transaction) {
        addPending(result.transaction);
        setPasteResult({ success: true, msg: `${result.transaction.currency} ${result.transaction.parsedAmount} detected from ${result.transaction.parsedMerchant || result.transaction.bank}` });
      } else {
        setPasteResult({ success: false, msg: "No transaction found. Try pasting a bank/payment notification." });
      }
    }
    setSmsText("");
    setTimeout(() => setPasteResult(null), 4000);
  };

  return (
    <div style={{ padding: "0 24px" }}>
      {/* Balance Card */}
      <div style={{
        background: `linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,184,148,0.06))`,
        borderRadius: 24, padding: "28px 24px", margin: "20px 0 16px",
        border: `1px solid rgba(0,212,170,0.15)`, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -30, right: -30, width: 120, height: 120,
          borderRadius: "50%", background: `radial-gradient(circle, rgba(0,212,170,0.15), transparent)`,
        }} />
        <p style={{ color: THEME.white50, fontSize: 13, margin: "0 0 6px", fontWeight: 600 }}>Monthly Budget</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ color: remaining >= 0 ? THEME.white : THEME.red, fontSize: 36, fontWeight: 800 }}>
            {curr.symbol} {Math.abs(remaining).toLocaleString()}
          </span>
          <span style={{ color: THEME.white40, fontSize: 14 }}>{remaining >= 0 ? "remaining" : "over budget!"}</span>
        </div>

        <div style={{ height: 8, borderRadius: 4, background: THEME.white10, marginTop: 16, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4,
            background: pct > 80 ? `linear-gradient(90deg, ${THEME.red}, ${THEME.redLight})`
              : pct > 50 ? `linear-gradient(90deg, ${THEME.orange}, ${THEME.orangeLight})`
              : `linear-gradient(90deg, ${THEME.accent}, ${THEME.accentDark})`,
            width: `${Math.min(pct, 100)}%`, transition: "width 1s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ color: THEME.white40, fontSize: 12 }}>{curr.symbol} {totalSpent.toLocaleString()} spent</span>
          <span style={{ color: THEME.white40, fontSize: 12 }}>{curr.symbol} {budget.toLocaleString()} budget</span>
        </div>
      </div>

      {/* Inbox Alert */}
      {inboxPending > 0 && (
        <button onClick={onGoToInbox} style={{
          width: "100%", background: "linear-gradient(135deg, rgba(108,92,231,0.15), rgba(108,92,231,0.06))",
          border: "1px solid rgba(108,92,231,0.25)", borderRadius: 16, padding: "14px 18px",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 12,
        }}>
          <span style={{ marginRight: 8, color: THEME.accent }}><Inbox size={24} /></span>
          <div style={{ flex: 1, textAlign: "left" }}>
            <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
              {inboxPending} new transaction{inboxPending !== 1 ? "s" : ""} detected
            </p>
            <p style={{ color: THEME.white40, fontSize: 11, margin: "2px 0 0", fontFamily: THEME.font }}>
              Tap to review & approve
            </p>
          </div>
          <span style={{ color: THEME.white30, fontSize: 18 }}>→</span>
        </button>
      )}

      {/* Privacy Shield — shows when auto-tracking is active */}
      {autoTrackEnabled && privacyStats.total > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(0,212,170,0.08), rgba(0,184,148,0.04))",
          borderRadius: 14, padding: "10px 14px", marginBottom: 12,
          border: "1px solid rgba(0,212,170,0.1)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ marginRight: 8, color: THEME.accent }}><ShieldCheck size={20} /></span>
          <p style={{ color: THEME.white40, fontSize: 11, margin: 0, fontFamily: THEME.font, flex: 1 }}>
            <span style={{ color: THEME.accent, fontWeight: 700 }}>{privacyStats.blocked}</span> OTPs blocked · <span style={{ color: THEME.accent, fontWeight: 700 }}>{privacyStats.parsed}</span> transactions auto-detected · All on-device
          </p>
        </div>
      )}

      {/* Paste SMS Quick Entry — Layer 5 manual fallback */}
      <button onClick={() => setShowPasteSMS(!showPasteSMS)} style={{
        width: "100%", background: showPasteSMS ? "rgba(0,212,170,0.08)" : THEME.cardBg,
        border: `1px solid ${showPasteSMS ? "rgba(0,212,170,0.15)" : THEME.cardBorder}`,
        borderRadius: 14, padding: "12px 16px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 10, marginBottom: showPasteSMS ? 0 : 12,
        borderBottomLeftRadius: showPasteSMS ? 0 : 14,
        borderBottomRightRadius: showPasteSMS ? 0 : 14,
      }}>
        <span style={{ marginRight: 8, color: THEME.white50 }}><Smartphone size={20} /></span>
        <p style={{ color: THEME.white70, fontSize: 13, fontWeight: 600, margin: 0, fontFamily: THEME.font, flex: 1, textAlign: "left" }}>
          Paste any payment message to auto-detect
        </p>
        <span style={{ color: THEME.white30, fontSize: 12, transition: "transform 0.2s", transform: showPasteSMS ? "rotate(180deg)" : "none" }}>▼</span>
      </button>

      {showPasteSMS && (
        <div style={{
          background: THEME.cardBg, borderRadius: "0 0 14px 14px", padding: "12px 16px 16px",
          border: `1px solid ${THEME.cardBorder}`, borderTop: "none", marginBottom: 12,
        }}>
          <textarea
            value={smsText}
            onChange={e => setSmsText(e.target.value)}
            placeholder="Paste any payment message here...&#10;InstaPay, Fawry, Vodafone Cash, bank SMS&#10;مثال: تم سحب 500.00 جنيه من حسابك ببنك مصر"
            style={{
              width: "100%", background: THEME.white04, border: `1px solid ${THEME.white10}`,
              borderRadius: 10, padding: "10px 12px", color: THEME.white, fontSize: 13,
              outline: "none", fontFamily: THEME.font, minHeight: 60, resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={handlePasteSMS} disabled={!smsText.trim()} style={{
              flex: 1, background: smsText.trim() ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : THEME.white10,
              color: smsText.trim() ? THEME.bg : THEME.white30, border: "none", borderRadius: 10,
              padding: "10px", fontSize: 13, fontWeight: 700, cursor: smsText.trim() ? "pointer" : "default",
              fontFamily: THEME.font,
            }}>Detect Transaction</button>
          </div>
          {pasteResult && (
            <div style={{
              marginTop: 8, padding: "8px 12px", borderRadius: 8,
              background: pasteResult.success ? "rgba(0,212,170,0.1)" : "rgba(255,107,107,0.1)",
              border: `1px solid ${pasteResult.success ? "rgba(0,212,170,0.2)" : "rgba(255,107,107,0.2)"}`,
            }}>
              <p style={{
                color: pasteResult.success ? THEME.accent : THEME.red,
                fontSize: 12, fontWeight: 600, margin: 0, fontFamily: THEME.font,
              }}>
                {pasteResult.success ? " " : ""}{pasteResult.msg}
              </p>
            </div>
          )}
          <p style={{ color: THEME.white20, fontSize: 10, margin: "8px 0 0", fontFamily: THEME.font, textAlign: "center" }}>
             Processed on-device only — OTPs auto-blocked
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: THEME.cardBg, borderRadius: 18, padding: "16px", border: `1px solid ${THEME.cardBorder}` }}>
          <p style={{ color: THEME.white40, fontSize: 11, margin: "0 0 4px", fontWeight: 600 }}>Savings Goal</p>
          <p style={{ color: THEME.accent, fontSize: 20, fontWeight: 800, margin: 0 }}>
            {curr.symbol} {Math.floor(budget * 0.2).toLocaleString()}
          </p>
          <p style={{ color: THEME.white30, fontSize: 10, margin: "2px 0 0" }}>20% of income</p>
        </div>
        <div style={{ background: THEME.cardBg, borderRadius: 18, padding: "16px", border: `1px solid ${THEME.cardBorder}` }}>
          <p style={{ color: THEME.white40, fontSize: 11, margin: "0 0 4px", fontWeight: 600 }}>Streak </p>
          <p style={{ color: THEME.orange, fontSize: 20, fontWeight: 800, margin: 0 }}>
            {challengeLog.streak} Day{challengeLog.streak !== 1 ? "s" : ""}
          </p>
          <p style={{ color: THEME.white30, fontSize: 10, margin: "2px 0 0" }}>
            {challengeLog.streak >= 7 ? "Amazing!" : challengeLog.streak >= 3 ? "Keep it up!" : "Start a streak!"}
          </p>
        </div>
      </div>

      {/* Daily Challenge */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,182,72,0.12), rgba(255,153,0,0.06))",
        borderRadius: 20, padding: "18px", marginBottom: 16,
        border: "1px solid rgba(255,182,72,0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: THEME.orange, fontSize: 11, fontWeight: 700, margin: "0 0 4px" }}>TODAY'S CHALLENGE</p>
            <p style={{ color: THEME.white, fontSize: 16, fontWeight: 700, margin: "0 0 2px" }}>
              {todayChallenge.icon} {todayChallenge.challenge}
            </p>
            <p style={{ color: THEME.white50, fontSize: 12, margin: 0 }}>{todayChallenge.desc}</p>
            <p style={{ color: THEME.orange, fontSize: 11, fontWeight: 600, margin: "4px 0 0" }}>
              +{todayChallenge.reward} points
            </p>
          </div>
          <button
            onClick={() => !todayDone && completeChallenge(todayChallenge.id, todayChallenge.reward)}
            disabled={!!todayDone}
            style={{
              background: todayDone ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : "rgba(255,182,72,0.2)",
              border: "none", borderRadius: 14, width: 50, height: 50,
              fontSize: 22, cursor: todayDone ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginLeft: 12,
            }}>
            {todayDone ? "" : ""}
          </button>
        </div>
      </div>

      {/* Recent Expenses */}
      <SectionHeader title="Recent Expenses" action="+ Add" onAction={onAddExpense} />

      {expenses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}><FileText size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
          <p style={{ color: THEME.white50, fontSize: 14, margin: 0, fontFamily: THEME.font }}>
            No expenses yet. Start tracking!
          </p>
        </div>
      ) : (
        expenses.slice(0, 8).map((exp) => {
          const cat = CATEGORIES.find(c => c.id === exp.category) || CATEGORIES[CATEGORIES.length - 1];
          const date = new Date(exp.date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
          const dateLabel = isToday ? "Today" : isYesterday ? "Yesterday" : date.toLocaleDateString();

          return (
            <div key={exp.id}
              onClick={() => setExpandedExpense(expandedExpense === exp.id ? null : exp.id)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0", borderBottom: `1px solid ${THEME.white04}`, cursor: "pointer",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${cat.color}20`, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                }}>{cat.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: THEME.white, fontSize: 14, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {exp.name}
                  </p>
                  <p style={{ color: THEME.white30, fontSize: 11, margin: 0 }}>
                    {dateLabel}
                    {exp.source && <span style={{ color: THEME.white20, marginLeft: 6 }}>
                      {exp.source === "sms" ? "" : exp.source === "receipt" ? "" : ""} auto
                    </span>}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ color: THEME.redLight, fontSize: 15, fontWeight: 700 }}>
                  -{curr.symbol} {exp.amount.toLocaleString()}
                </span>
                {expandedExpense === exp.id && (
                  <button onClick={(e) => { e.stopPropagation(); deleteExpense(exp.id); }}
                    style={{
                      background: "rgba(255,107,107,0.15)", border: "none", borderRadius: 8,
                      padding: "4px 8px", cursor: "pointer", color: THEME.red, fontSize: 11,
                      fontWeight: 600, fontFamily: THEME.font,
                    }}>Delete</button>
                )}
              </div>
            </div>
          );
        })
      )}

      {!isPremium && expenses.length >= 10 && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <button onClick={showPaywall} style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,182,72,0.08))",
            border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: "10px 20px",
            color: THEME.gold, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
          }}>
             Upgrade for unlimited tracking
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Add Expense Modal ───
function AddExpenseModal({ curr, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const valid = name.trim() && amount && Number(amount) > 0;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)", zIndex: 200,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: `linear-gradient(180deg, ${THEME.bgTertiary}, ${THEME.bg})`,
        borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 440,
        padding: "28px 24px 40px", border: `1px solid ${THEME.cardBorder}`, borderBottom: "none",
        maxHeight: "85vh", overflowY: "auto",
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: THEME.white10, margin: "0 auto 20px" }} />
        <h3 style={{ color: THEME.white, fontSize: 22, fontWeight: 700, margin: "0 0 20px", fontFamily: THEME.font }}>
          Add Expense
        </h3>

        <input value={name} onChange={e => setName(e.target.value)} placeholder="What did you spend on?"
          style={{
            width: "100%", background: THEME.white06, border: `1px solid ${THEME.white10}`,
            borderRadius: 14, padding: "14px 16px", color: THEME.white, fontSize: 15,
            outline: "none", marginBottom: 12, fontFamily: THEME.font, boxSizing: "border-box",
          }} />

        <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder={`Amount (${curr.symbol})`} inputMode="decimal"
          style={{
            width: "100%", background: THEME.white06, border: `1px solid ${THEME.white10}`,
            borderRadius: 14, padding: "14px 16px", color: THEME.white, fontSize: 15,
            outline: "none", marginBottom: 16, fontFamily: THEME.font, boxSizing: "border-box",
          }} />

        <p style={{ color: THEME.white50, fontSize: 13, fontWeight: 600, margin: "0 0 10px", fontFamily: THEME.font }}>
          Category
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {CATEGORIES.filter(c => c.id !== "savings").map((cat) => (
            <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
              background: category === cat.id ? "rgba(0,212,170,0.2)" : THEME.white04,
              border: category === cat.id ? `1.5px solid ${THEME.accent}` : `1.5px solid rgba(255,255,255,0.08)`,
              borderRadius: 10, padding: "8px 12px", cursor: "pointer",
              fontSize: 12, color: category === cat.id ? THEME.accent : THEME.white50,
              fontFamily: THEME.font, fontWeight: 600,
            }}>{cat.icon} {cat.name}</button>
          ))}
        </div>

        <button
          onClick={() => valid && onAdd({ name: name.trim(), category, amount })}
          disabled={!valid}
          style={{
            width: "100%",
            background: valid ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : THEME.white10,
            color: valid ? THEME.bg : THEME.white30,
            border: "none", borderRadius: 16, padding: "18px",
            fontSize: 17, fontWeight: 700, cursor: valid ? "pointer" : "default",
            fontFamily: THEME.font,
          }}>Add Expense</button>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
