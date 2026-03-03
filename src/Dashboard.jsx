import { useState } from "react";
import { useApp } from "./WafrApp.jsx";
import { CATEGORIES, DAILY_CHALLENGES, THEME } from "./constants.js";
import { SectionHeader, ProBadge } from "./Shared.jsx";
import AICoach from "./AICoach.jsx";
import SavingsGoals from "./SavingsGoals.jsx";
import BudgetPlanner from "./BudgetPlanner.jsx";
import Insights from "./Insights.jsx";
import Achievements from "./Achievements.jsx";
import Settings from "./Settings.jsx";

export default function Dashboard() {
  const { profile, curr, isPremium, currentMonthExpenses, totalSpent, budget,
    addExpense, deleteExpense, challengeLog, completeChallenge, currentLevel, showPaywall } = useApp();

  const [tab, setTab] = useState("home");
  const [showAddModal, setShowAddModal] = useState(false);

  const remaining = budget - totalSpent;
  const pct = Math.min((totalSpent / budget) * 100, 100);
  const todayChallenge = DAILY_CHALLENGES[new Date().getDay() % DAILY_CHALLENGES.length];
  const todayDone = challengeLog.completed[new Date().toDateString()];

  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "ai", icon: "🤖", label: "AI Coach" },
    { id: "goals", icon: "🎯", label: "Goals" },
    { id: "budget", icon: "💼", label: "Budget" },
    { id: "insights", icon: "📊", label: "Insights" },
    { id: "achievements", icon: "🏆", label: "Rewards" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${THEME.bg} 0%, ${THEME.bgSecondary} 40%, ${THEME.bgTertiary} 100%)`,
      fontFamily: THEME.font, paddingBottom: 90,
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: THEME.white50, fontSize: 14, margin: 0 }}>
              {getGreeting()} {profile.name ? profile.name : ""} 👋
            </p>
            <h1 style={{ fontFamily: THEME.fontSerif, fontSize: 24, color: THEME.white, margin: "4px 0 0", fontWeight: 800 }}>
              Your Savings
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
      {tab === "home" && (
        <HomeTab
          curr={curr} remaining={remaining} totalSpent={totalSpent} budget={budget} pct={pct}
          profile={profile} isPremium={isPremium}
          expenses={currentMonthExpenses} onAddExpense={() => setShowAddModal(true)}
          deleteExpense={deleteExpense}
          todayChallenge={todayChallenge} todayDone={todayDone}
          challengeLog={challengeLog} completeChallenge={completeChallenge}
          showPaywall={showPaywall}
        />
      )}
      {tab === "ai" && <AICoach />}
      {tab === "goals" && <SavingsGoals />}
      {tab === "budget" && <BudgetPlanner />}
      {tab === "insights" && <Insights />}
      {tab === "achievements" && <Achievements />}
      {tab === "settings" && <Settings />}

      {/* Add Expense Modal */}
      {showAddModal && (
        <AddExpenseModal curr={curr} onClose={() => setShowAddModal(false)} onAdd={(e) => { addExpense(e); setShowAddModal(false); }} />
      )}

      {/* Bottom Navigation */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(10,22,40,0.97)", backdropFilter: "blur(20px)",
        borderTop: `1px solid ${THEME.cardBorder}`,
        display: "flex", justifyContent: "space-around",
        padding: "8px 0 18px", zIndex: 100,
      }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "4px 6px", minWidth: 0,
          }}>
            <span style={{
              fontSize: 18, filter: tab === t.id ? "none" : "grayscale(0.5) opacity(0.4)",
              transition: "all 0.2s ease",
            }}>{t.icon}</span>
            <span style={{
              color: tab === t.id ? THEME.accent : THEME.white30,
              fontSize: 9, fontWeight: 600, fontFamily: THEME.font,
            }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── HOME TAB ───
function HomeTab({ curr, remaining, totalSpent, budget, pct, profile, isPremium,
  expenses, onAddExpense, deleteExpense, todayChallenge, todayDone,
  challengeLog, completeChallenge, showPaywall }) {

  const [expandedExpense, setExpandedExpense] = useState(null);

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
          <p style={{ color: THEME.white40, fontSize: 11, margin: "0 0 4px", fontWeight: 600 }}>Streak 🔥</p>
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
            {todayDone ? "✅" : "💪"}
          </button>
        </div>
      </div>

      {/* Recent Expenses */}
      <SectionHeader title="Recent Expenses" action="+ Add" onAction={onAddExpense} />

      {expenses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📝</div>
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
                  <p style={{ color: THEME.white30, fontSize: 11, margin: 0 }}>{dateLabel}</p>
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
            🔒 Upgrade for unlimited tracking
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
            outline: "none", marginBottom: 12, fontFamily: THEME.font,
          }} />

        <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder={`Amount (${curr.symbol})`} inputMode="decimal"
          style={{
            width: "100%", background: THEME.white06, border: `1px solid ${THEME.white10}`,
            borderRadius: 14, padding: "14px 16px", color: THEME.white, fontSize: 15,
            outline: "none", marginBottom: 16, fontFamily: THEME.font,
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
