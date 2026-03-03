import { FileText, Home, Bot, Inbox, Target, Zap, Briefcase, BarChart3, Trophy, Camera, RefreshCw, TrendingUp, HeartPulse, Users, PiggyBank, Moon, Smartphone, Eye, LineChart, CircleDashed, ShieldAlert, Swords, CalendarDays, Settings as SettingsIcon, ShieldCheck, Wallet, ArrowUpRight, Bell, ChevronRight, Sparkles, Send } from "lucide-react";
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
      {/* Header — Premium */}
      <div style={{ padding: "16px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: THEME.white40, fontSize: 13, margin: 0, fontFamily: THEME.font, fontWeight: 500 }}>
              {getGreeting()}
            </p>
            <h1 style={{ fontFamily: THEME.font, fontSize: 22, color: THEME.white, margin: "2px 0 0", fontWeight: 800, letterSpacing: "-0.3px" }}>
              {profile.name || "Wafr"}
              {isPremium && <span style={{
                background: "linear-gradient(135deg, #FFD700, #FFB648)",
                color: THEME.bg, fontSize: 9, fontWeight: 800, padding: "3px 8px",
                borderRadius: 6, fontFamily: THEME.font, marginLeft: 8, verticalAlign: "middle",
                display: "inline-block",
              }}>PRO</span>}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setTab("inbox")} style={{
              width: 42, height: 42, borderRadius: 14, background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)", display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative",
            }}>
              <Bell size={18} color="rgba(255,255,255,0.5)" />
              {inboxPending > 0 && <div style={{
                position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 4,
                background: THEME.red, border: `2px solid ${THEME.bg}`,
              }} />}
            </button>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,212,170,0.2)",
            }}>
              <span style={{ color: THEME.bg, fontSize: 16, fontWeight: 800, fontFamily: THEME.font }}>
                {(profile.name || "W").charAt(0).toUpperCase()}
              </span>
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
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: "10px 16px", cursor: "pointer",
          color: THEME.white, fontSize: 13, fontWeight: 600, fontFamily: THEME.font,
          backdropFilter: "blur(16px)",
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          ← Back
        </button>
      )}

      {/* Bottom Navigation — Premium */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(8,18,32,0.98)", backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "4px 0 20px", zIndex: 100,
      }}>
        {tabs.map((t) => {
          const isActive = t.id === tab || (t.id === "more" && !["home", "ai", "inbox", "goals"].includes(tab));
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "6px 16px", minWidth: 0, position: "relative",
              transition: "all 0.2s ease",
            }}>
              {isActive && <div style={{
                position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)",
                width: 24, height: 3, borderRadius: 2, background: THEME.accent,
              }} />}
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: isActive ? "rgba(0,212,170,0.12)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease",
              }}>
                <span style={{ color: isActive ? THEME.accent : THEME.white30, display: "flex" }}>{t.icon}</span>
              </div>
              <span style={{
                color: isActive ? THEME.accent : THEME.white30,
                fontSize: 10, fontWeight: isActive ? 700 : 500, fontFamily: THEME.font,
                transition: "all 0.2s ease",
              }}>{t.label}</span>
              {t.badge > 0 && (
                <div style={{
                  position: "absolute", top: 2, right: 4, minWidth: 18, height: 18,
                  borderRadius: 9, background: THEME.red, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: "#fff", fontFamily: THEME.font,
                  padding: "0 4px", boxShadow: "0 2px 8px rgba(255,107,107,0.4)",
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
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: "20px 16px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10,
              position: "relative", overflow: "hidden",
              opacity: locked ? 0.55 : 1,
              transition: "all 0.2s ease",
            }}>
              {locked && (
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  background: "linear-gradient(135deg, #FFD700, #FFB648)",
                  color: THEME.bg, fontSize: 8, fontWeight: 800, padding: "3px 8px",
                  borderRadius: 6, fontFamily: THEME.font, letterSpacing: "0.3px",
                }}>PRO</div>
              )}
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: locked ? "rgba(255,255,255,0.06)" : "rgba(0,212,170,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: locked ? THEME.white30 : THEME.accent, display: "flex" }}>{f.icon}</span>
              </div>
              <div>
                <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font, textAlign: "left" }}>
                  {f.name}
                </p>
                <p style={{ color: THEME.white30, fontSize: 11, margin: "3px 0 0", fontFamily: THEME.font, textAlign: "left" }}>
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

// ─── SPENDING CHART ───
function SpendingChart({ expenses, curr }) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const dayTotal = expenses
      .filter(e => new Date(e.date).toDateString() === dayStr)
      .reduce((s, e) => s + e.amount, 0);
    days.push({ date: d, total: dayTotal, label: d.toLocaleDateString("en", { weekday: "short" }) });
  }

  const maxVal = Math.max(...days.map(d => d.total), 1);
  const w = 320, h = 150, px = 24, py = 18;
  const chartW = w - px * 2, chartH = h - py * 2 - 12;

  const points = days.map((d, i) => ({
    x: px + (i / (days.length - 1)) * chartW,
    y: py + chartH - (d.total / maxVal) * chartH,
  }));

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
    const cp2x = points[i].x - (points[i].x - points[i - 1].x) / 3;
    path += ` C ${cp1x} ${points[i - 1].y}, ${cp2x} ${points[i].y}, ${points[i].x} ${points[i].y}`;
  }
  const fillPath = path + ` L ${points[points.length - 1].x} ${h - 14} L ${points[0].x} ${h - 14} Z`;

  const weekTotal = days.reduce((s, d) => s + d.total, 0);

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "20px",
      marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <p style={{ color: THEME.white, fontSize: 16, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
            Spending Insights
          </p>
          <p style={{ color: THEME.white40, fontSize: 12, margin: "2px 0 0", fontFamily: THEME.font }}>
            {curr.symbol} {weekTotal.toLocaleString()} this week
          </p>
        </div>
        <div style={{
          background: "rgba(0,212,170,0.1)", borderRadius: 10, padding: "5px 14px",
          border: "1px solid rgba(0,212,170,0.15)",
        }}>
          <span style={{ color: THEME.accent, fontSize: 12, fontWeight: 600, fontFamily: THEME.font }}>7 Days</span>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
        <defs>
          <linearGradient id="chartGradFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00D4AA" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chartGradLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00D4AA" />
            <stop offset="50%" stopColor="#4AE8C4" />
            <stop offset="100%" stopColor="#00D4AA" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <line key={i} x1={px} y1={py + chartH * (1 - v)} x2={w - px} y2={py + chartH * (1 - v)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        <path d={fillPath} fill="url(#chartGradFill)" />
        <path d={path} fill="none" stroke="url(#chartGradLine)" strokeWidth="2.5" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={THEME.bg} stroke="#00D4AA" strokeWidth="2" />
            {days[i].total > 0 && (
              <text x={p.x} y={p.y - 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8"
                fontFamily="DM Sans, sans-serif">
                {curr.symbol}{days[i].total >= 1000
                  ? (days[i].total / 1000).toFixed(1) + "k"
                  : days[i].total.toLocaleString()}
              </text>
            )}
            <text x={p.x} y={h - 2} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9"
              fontFamily="DM Sans, sans-serif">{days[i].label}</text>
          </g>
        ))}
      </svg>
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
      {/* Balance Card — Premium Green Gradient */}
      <div style={{
        background: "linear-gradient(145deg, #1E6B45 0%, #134D32 50%, #0A3521 100%)",
        borderRadius: 24, padding: "24px", margin: "16px 0 20px",
        position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,100,60,0.25)",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -70, left: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", top: 20, right: 25, width: 60, height: 60, borderRadius: "50%", background: "rgba(0,212,170,0.08)" }} />

        {/* Wallet icon + label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, position: "relative" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}>
            <Wallet size={18} color="#fff" />
          </div>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 500, fontFamily: THEME.font }}>Total Balance</span>
        </div>

        {/* Balance amount */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", marginBottom: 4 }}>
          <span style={{ color: "#fff", fontSize: 36, fontWeight: 800, fontFamily: THEME.font, letterSpacing: "-0.5px" }}>
            {curr.symbol} {remaining >= 0 ? remaining.toLocaleString() : "0"}
          </span>
          <div style={{
            display: "flex", alignItems: "center", gap: 3,
            background: remaining >= 0 ? "rgba(0,212,170,0.2)" : "rgba(255,107,107,0.2)",
            borderRadius: 8, padding: "4px 10px",
          }}>
            <ArrowUpRight size={13} color={remaining >= 0 ? "#4AE8C4" : "#FF8E8E"} />
            <span style={{ color: remaining >= 0 ? "#4AE8C4" : "#FF8E8E", fontSize: 12, fontWeight: 700, fontFamily: THEME.font }}>
              {budget > 0 ? Math.round(((budget - totalSpent) / budget) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Budget progress */}
        <div style={{ position: "relative", marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: THEME.font }}>
              Spent {curr.symbol} {totalSpent.toLocaleString()}
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: THEME.font }}>
              Budget {curr.symbol} {budget.toLocaleString()}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              background: pct > 80 ? "linear-gradient(90deg, #FF6B6B, #FF8E8E)"
                : pct > 50 ? "linear-gradient(90deg, #FFB648, #FFD93D)"
                : "linear-gradient(90deg, #4AE8C4, #00D4AA)",
              width: `${Math.min(pct, 100)}%`, transition: "width 1s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Spending Insights Chart */}
      <SpendingChart expenses={expenses} curr={curr} />

      {/* Inbox Alert — Compact */}
      {inboxPending > 0 && (
        <button onClick={onGoToInbox} style={{
          width: "100%", background: "linear-gradient(135deg, rgba(0,212,170,0.08), rgba(108,92,231,0.06))",
          border: "1px solid rgba(0,212,170,0.12)", borderRadius: 16, padding: "14px 18px",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: "rgba(0,212,170,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Inbox size={18} color={THEME.accent} />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
              {inboxPending} transaction{inboxPending !== 1 ? "s" : ""} to review
            </p>
            <p style={{ color: THEME.white40, fontSize: 11, margin: "2px 0 0", fontFamily: THEME.font }}>
              Tap to approve or dismiss
            </p>
          </div>
          <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
        </button>
      )}

      {/* Privacy Shield — Compact pill */}
      {autoTrackEnabled && privacyStats.total > 0 && (
        <div style={{
          background: "rgba(0,212,170,0.06)", borderRadius: 12, padding: "10px 14px",
          marginBottom: 14, border: "1px solid rgba(0,212,170,0.08)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <ShieldCheck size={16} color={THEME.accent} />
          <p style={{ color: THEME.white40, fontSize: 11, margin: 0, fontFamily: THEME.font, flex: 1 }}>
            <span style={{ color: THEME.accent, fontWeight: 700 }}>{privacyStats.blocked}</span> blocked  ·  <span style={{ color: THEME.accent, fontWeight: 700 }}>{privacyStats.parsed}</span> auto-detected
          </p>
        </div>
      )}

      {/* Paste SMS — Compact toggle */}
      <button onClick={() => setShowPasteSMS(!showPasteSMS)} style={{
        width: "100%", background: showPasteSMS ? "rgba(0,212,170,0.06)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${showPasteSMS ? "rgba(0,212,170,0.12)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: showPasteSMS ? "14px 14px 0 0" : 14, padding: "12px 16px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 10, marginBottom: showPasteSMS ? 0 : 14,
      }}>
        <Smartphone size={16} color="rgba(255,255,255,0.4)" />
        <p style={{ color: THEME.white50, fontSize: 13, fontWeight: 500, margin: 0, fontFamily: THEME.font, flex: 1, textAlign: "left" }}>
          Paste payment message
        </p>
        <span style={{ color: THEME.white30, fontSize: 10, transition: "transform 0.2s", transform: showPasteSMS ? "rotate(180deg)" : "none" }}>▼</span>
      </button>

      {showPasteSMS && (
        <div style={{
          background: "rgba(255,255,255,0.04)", borderRadius: "0 0 14px 14px", padding: "12px 16px 16px",
          border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", marginBottom: 14,
        }}>
          <textarea
            value={smsText}
            onChange={e => setSmsText(e.target.value)}
            placeholder="Paste any payment message here..."
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "10px 12px", color: THEME.white, fontSize: 13,
              outline: "none", fontFamily: THEME.font, minHeight: 56, resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <button onClick={handlePasteSMS} disabled={!smsText.trim()} style={{
            width: "100%", marginTop: 8,
            background: smsText.trim() ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : "rgba(255,255,255,0.06)",
            color: smsText.trim() ? THEME.bg : THEME.white30, border: "none", borderRadius: 10,
            padding: "10px", fontSize: 13, fontWeight: 700, cursor: smsText.trim() ? "pointer" : "default",
            fontFamily: THEME.font,
          }}>Detect Transaction</button>
          {pasteResult && (
            <div style={{
              marginTop: 8, padding: "8px 12px", borderRadius: 8,
              background: pasteResult.success ? "rgba(0,212,170,0.1)" : "rgba(255,107,107,0.1)",
              border: `1px solid ${pasteResult.success ? "rgba(0,212,170,0.2)" : "rgba(255,107,107,0.2)"}`,
            }}>
              <p style={{
                color: pasteResult.success ? THEME.accent : THEME.red,
                fontSize: 12, fontWeight: 600, margin: 0, fontFamily: THEME.font,
              }}>{pasteResult.msg}</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats — Premium 2-column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{
          background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "18px",
          border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -15, right: -15, width: 50, height: 50, borderRadius: "50%", background: "rgba(0,212,170,0.06)" }} />
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: "rgba(0,212,170,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10,
          }}>
            <Target size={16} color={THEME.accent} />
          </div>
          <p style={{ color: THEME.white40, fontSize: 11, margin: "0 0 4px", fontWeight: 500, fontFamily: THEME.font }}>Savings Goal</p>
          <p style={{ color: THEME.accent, fontSize: 22, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
            {curr.symbol} {Math.floor(budget * 0.2).toLocaleString()}
          </p>
          <p style={{ color: THEME.white20, fontSize: 10, margin: "4px 0 0", fontFamily: THEME.font }}>20% of income</p>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "18px",
          border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -15, right: -15, width: 50, height: 50, borderRadius: "50%", background: "rgba(255,182,72,0.06)" }} />
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: "rgba(255,182,72,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10,
          }}>
            <Zap size={16} color={THEME.orange} />
          </div>
          <p style={{ color: THEME.white40, fontSize: 11, margin: "0 0 4px", fontWeight: 500, fontFamily: THEME.font }}>Streak</p>
          <p style={{ color: THEME.orange, fontSize: 22, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
            {challengeLog.streak} Day{challengeLog.streak !== 1 ? "s" : ""}
          </p>
          <p style={{ color: THEME.white20, fontSize: 10, margin: "4px 0 0", fontFamily: THEME.font }}>
            {challengeLog.streak >= 7 ? "Amazing streak!" : challengeLog.streak >= 3 ? "Keep going!" : "Start today!"}
          </p>
        </div>
      </div>

      {/* Daily Challenge — Premium */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,182,72,0.08), rgba(255,153,0,0.04))",
        borderRadius: 20, padding: "18px", marginBottom: 20,
        border: "1px solid rgba(255,182,72,0.1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Sparkles size={14} color={THEME.orange} />
              <p style={{ color: THEME.orange, fontSize: 10, fontWeight: 700, margin: 0, fontFamily: THEME.font, letterSpacing: "0.5px" }}>
                TODAY'S CHALLENGE
              </p>
            </div>
            <p style={{ color: THEME.white, fontSize: 15, fontWeight: 700, margin: "0 0 4px", fontFamily: THEME.font }}>
              {todayChallenge.icon} {todayChallenge.challenge}
            </p>
            <p style={{ color: THEME.white40, fontSize: 12, margin: 0, fontFamily: THEME.font }}>{todayChallenge.desc}</p>
            <p style={{ color: THEME.orange, fontSize: 11, fontWeight: 600, margin: "6px 0 0", fontFamily: THEME.font }}>
              +{todayChallenge.reward} pts
            </p>
          </div>
          <button
            onClick={() => !todayDone && completeChallenge(todayChallenge.id, todayChallenge.reward)}
            disabled={!!todayDone}
            style={{
              background: todayDone
                ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`
                : "rgba(255,182,72,0.15)",
              border: todayDone ? "none" : "1px solid rgba(255,182,72,0.2)",
              borderRadius: 14, width: 48, height: 48,
              cursor: todayDone ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginLeft: 12,
              transition: "all 0.2s ease",
            }}>
            {todayDone
              ? <ShieldCheck size={22} color={THEME.bg} />
              : <Target size={22} color={THEME.orange} />}
          </button>
        </div>
      </div>

      {/* Recent Expenses — Premium List */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ color: THEME.white, fontSize: 16, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>Recent Expenses</p>
        <button onClick={onAddExpense} style={{
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
          border: "none", borderRadius: 10, padding: "7px 16px",
          color: THEME.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
          boxShadow: "0 4px 12px rgba(0,212,170,0.2)",
        }}>+ Add</button>
      </div>

      {expenses.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "40px 16px",
          background: "rgba(255,255,255,0.03)", borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "rgba(0,212,170,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
          }}>
            <FileText size={24} color={THEME.accent} />
          </div>
          <p style={{ color: THEME.white50, fontSize: 14, margin: 0, fontFamily: THEME.font }}>
            No expenses yet. Start tracking!
          </p>
        </div>
      ) : (
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 20, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          {expenses.slice(0, 8).map((exp, idx) => {
            const cat = CATEGORIES.find(c => c.id === exp.category) || CATEGORIES[CATEGORIES.length - 1];
            const date = new Date(exp.date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
            const dateLabel = isToday ? "Today" : isYesterday ? "Yesterday" : date.toLocaleDateString();

            return (
              <div key={exp.id}
                onClick={() => setExpandedExpense(expandedExpense === exp.id ? null : exp.id)}
                style={{
                  display: "flex", alignItems: "center", padding: "14px 18px",
                  borderBottom: idx < Math.min(expenses.length, 8) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  cursor: "pointer", transition: "background 0.2s ease",
                }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: `${cat.color}15`, display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                  marginRight: 14,
                }}>
                  <span style={{ color: cat.color, fontSize: 20 }}>{cat.icon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    color: THEME.white, fontSize: 14, fontWeight: 600, margin: 0,
                    fontFamily: THEME.font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {exp.name}
                  </p>
                  <p style={{ color: THEME.white30, fontSize: 11, margin: "3px 0 0", fontFamily: THEME.font }}>
                    {cat.nameAr} · {dateLabel}
                    {exp.source && <span style={{ color: THEME.white20, marginLeft: 6 }}>auto</span>}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ color: THEME.accent, fontSize: 15, fontWeight: 700, fontFamily: THEME.font }}>
                    -{curr.symbol} {exp.amount.toLocaleString()}
                  </span>
                  {expandedExpense === exp.id && (
                    <button onClick={(e) => { e.stopPropagation(); deleteExpense(exp.id); }}
                      style={{
                        background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.2)",
                        borderRadius: 8, padding: "4px 10px", cursor: "pointer",
                        color: THEME.red, fontSize: 11, fontWeight: 600, fontFamily: THEME.font,
                      }}>Delete</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isPremium && expenses.length >= 10 && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <button onClick={showPaywall} style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,182,72,0.06))",
            border: "1px solid rgba(255,215,0,0.15)", borderRadius: 14, padding: "12px 24px",
            color: THEME.gold, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
            display: "flex", alignItems: "center", gap: 8, margin: "0 auto",
          }}>
            <Sparkles size={16} color={THEME.gold} />
            Upgrade for unlimited tracking
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Add Expense Modal — Premium ───
function AddExpenseModal({ curr, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const valid = name.trim() && amount && Number(amount) > 0;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(12px)", zIndex: 200,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: `linear-gradient(180deg, #132D46, ${THEME.bg})`,
        borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 440,
        padding: "28px 24px 40px", border: "1px solid rgba(255,255,255,0.06)", borderBottom: "none",
        maxHeight: "85vh", overflowY: "auto",
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", margin: "0 auto 24px" }} />
        <h3 style={{ color: THEME.white, fontSize: 22, fontWeight: 800, margin: "0 0 24px", fontFamily: THEME.font }}>
          Add Expense
        </h3>

        <input value={name} onChange={e => setName(e.target.value)} placeholder="What did you spend on?"
          style={{
            width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: "14px 16px", color: THEME.white, fontSize: 15,
            outline: "none", marginBottom: 12, fontFamily: THEME.font, boxSizing: "border-box",
          }} />

        <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder={`Amount (${curr.symbol})`} inputMode="decimal"
          style={{
            width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: "14px 16px", color: THEME.white, fontSize: 15,
            outline: "none", marginBottom: 18, fontFamily: THEME.font, boxSizing: "border-box",
          }} />

        <p style={{ color: THEME.white40, fontSize: 13, fontWeight: 600, margin: "0 0 10px", fontFamily: THEME.font }}>
          Category
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {CATEGORIES.filter(c => c.id !== "savings").map((cat) => (
            <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
              background: category === cat.id ? "rgba(0,212,170,0.12)" : "rgba(255,255,255,0.04)",
              border: category === cat.id ? `1.5px solid ${THEME.accent}` : "1.5px solid rgba(255,255,255,0.06)",
              borderRadius: 10, padding: "8px 14px", cursor: "pointer",
              fontSize: 12, color: category === cat.id ? THEME.accent : THEME.white50,
              fontFamily: THEME.font, fontWeight: 600,
              transition: "all 0.2s ease",
            }}>{cat.icon} {cat.name}</button>
          ))}
        </div>

        <button
          onClick={() => valid && onAdd({ name: name.trim(), category, amount })}
          disabled={!valid}
          style={{
            width: "100%",
            background: valid ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : "rgba(255,255,255,0.06)",
            color: valid ? THEME.bg : THEME.white30,
            border: "none", borderRadius: 16, padding: "18px",
            fontSize: 17, fontWeight: 700, cursor: valid ? "pointer" : "default",
            fontFamily: THEME.font,
            boxShadow: valid ? "0 6px 24px rgba(0,212,170,0.25)" : "none",
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
