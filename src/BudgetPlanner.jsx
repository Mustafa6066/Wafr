import { useState } from "react";
import { useApp } from "./WafrApp.jsx";
import { CATEGORIES, THEME } from "./constants.js";
import { PremiumGate, SectionHeader } from "./Shared.jsx";

export default function BudgetPlanner() {
  const { curr, isPremium, budgets, setBudgets, currentMonthExpenses, budget, showPaywall } = useApp();
  const [editCat, setEditCat] = useState(null);
  const [editVal, setEditVal] = useState("");

  // Calculate spending per category
  const catSpending = {};
  currentMonthExpenses.forEach(e => {
    catSpending[e.category] = (catSpending[e.category] || 0) + e.amount;
  });

  const totalBudgeted = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalSpent = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);

  const saveBudget = (catId) => {
    if (editVal && Number(editVal) > 0) {
      setBudgets(prev => ({ ...prev, [catId]: Number(editVal) }));
    }
    setEditCat(null);
    setEditVal("");
  };

  const removeBudget = (catId) => {
    setBudgets(prev => {
      const next = { ...prev };
      delete next[catId];
      return next;
    });
  };

  const applySuggested = () => {
    const needs = ["rent", "bills", "groceries", "transport", "health", "education"];
    const wants = ["food", "shopping", "entertainment"];
    const suggested = {};
    const needsBudget = budget * 0.5;
    const wantsBudget = budget * 0.3;

    const activeCats = CATEGORIES.filter(c => c.id !== "savings" && c.id !== "other");
    const needsCats = activeCats.filter(c => needs.includes(c.id));
    const wantsCats = activeCats.filter(c => wants.includes(c.id));

    needsCats.forEach(c => { suggested[c.id] = Math.round(needsBudget / needsCats.length); });
    wantsCats.forEach(c => { suggested[c.id] = Math.round(wantsBudget / wantsCats.length); });

    setBudgets(suggested);
  };

  const content = (
    <div style={{ padding: "16px 24px" }}>
      <SectionHeader title="Budget Planner" proBadge={!isPremium} />

      {/* Summary */}
      <div style={{
        background: `linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,184,148,0.06))`,
        borderRadius: 20, padding: "20px", marginBottom: 16,
        border: `1px solid rgba(0,212,170,0.15)`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <p style={{ color: THEME.white50, fontSize: 12, margin: "0 0 2px", fontFamily: THEME.font }}>Monthly Income</p>
            <p style={{ color: THEME.white, fontSize: 22, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
              {curr.symbol} {budget.toLocaleString()}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: THEME.white50, fontSize: 12, margin: "0 0 2px", fontFamily: THEME.font }}>Budgeted</p>
            <p style={{ color: THEME.accent, fontSize: 22, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
              {curr.symbol} {totalBudgeted.toLocaleString()}
            </p>
          </div>
        </div>
        <div style={{
          background: "rgba(0,212,170,0.08)", borderRadius: 10, padding: "10px 14px",
          display: "flex", justifyContent: "space-between",
        }}>
          <span style={{ color: THEME.accent, fontSize: 12, fontWeight: 600, fontFamily: THEME.font }}>
             Savings target (20%): {curr.symbol} {Math.round(budget * 0.2).toLocaleString()}
          </span>
          <span style={{ color: THEME.white40, fontSize: 12, fontFamily: THEME.font }}>
            Unbudgeted: {curr.symbol} {Math.max(0, budget - totalBudgeted).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 50/30/20 Suggestion */}
      {Object.keys(budgets).length === 0 && (
        <div style={{
          background: "rgba(255,182,72,0.08)", borderRadius: 16, padding: "16px",
          border: "1px solid rgba(255,182,72,0.12)", marginBottom: 16,
        }}>
          <p style={{ color: THEME.orange, fontSize: 13, fontWeight: 700, margin: "0 0 6px", fontFamily: THEME.font }}>
             Suggested: 50/30/20 Rule
          </p>
          <p style={{ color: THEME.white50, fontSize: 12, margin: "0 0 4px", fontFamily: THEME.font }}>
            50% Needs ({curr.symbol} {Math.round(budget * 0.5).toLocaleString()}) · 30% Wants ({curr.symbol} {Math.round(budget * 0.3).toLocaleString()}) · 20% Savings ({curr.symbol} {Math.round(budget * 0.2).toLocaleString()})
          </p>
          <button onClick={applySuggested} style={{
            background: "rgba(255,182,72,0.2)", border: "none", borderRadius: 10,
            padding: "8px 16px", color: THEME.orange, fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: THEME.font, marginTop: 8,
          }}>Apply Suggested Budget</button>
        </div>
      )}

      {/* Category Budgets */}
      {CATEGORIES.filter(c => c.id !== "savings" && c.id !== "other").map((cat) => {
        const catBudget = budgets[cat.id] || 0;
        const spent = catSpending[cat.id] || 0;
        const pct = catBudget > 0 ? Math.min((spent / catBudget) * 100, 150) : 0;
        const overBudget = catBudget > 0 && spent > catBudget;

        return (
          <div key={cat.id} style={{
            background: THEME.cardBg, borderRadius: 16, padding: "14px 16px", marginBottom: 10,
            border: `1px solid ${overBudget ? "rgba(255,107,107,0.2)" : THEME.cardBorder}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                <span style={{ color: THEME.white, fontSize: 14, fontWeight: 600, fontFamily: THEME.font }}>{cat.name}</span>
              </div>
              {editCat === cat.id ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={editVal} onChange={e => setEditVal(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Budget" inputMode="numeric" autoFocus
                    onKeyDown={e => e.key === "Enter" && saveBudget(cat.id)}
                    style={{
                      width: 70, background: THEME.white06, border: `1px solid ${THEME.white10}`,
                      borderRadius: 8, padding: "4px 8px", color: THEME.white, fontSize: 12,
                      outline: "none", fontFamily: THEME.font,
                    }} />
                  <button onClick={() => saveBudget(cat.id)} style={{
                    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                    border: "none", borderRadius: 8, padding: "4px 10px",
                    color: THEME.bg, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}>✓</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {catBudget > 0 && (
                    <button onClick={() => removeBudget(cat.id)} style={{
                      background: "none", border: "none", color: THEME.white30, fontSize: 14,
                      cursor: "pointer", padding: "0 4px",
                    }}>×</button>
                  )}
                  <button onClick={() => { setEditCat(cat.id); setEditVal(catBudget > 0 ? String(catBudget) : ""); }}
                    style={{
                      background: catBudget > 0 ? THEME.white06 : "rgba(0,212,170,0.1)",
                      border: catBudget > 0 ? `1px solid ${THEME.cardBorder}` : `1px solid rgba(0,212,170,0.2)`,
                      borderRadius: 8, padding: "4px 10px",
                      color: catBudget > 0 ? THEME.white50 : THEME.accent,
                      fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: THEME.font,
                    }}>
                    {catBudget > 0 ? `${curr.symbol} ${catBudget.toLocaleString()}` : "+ Set"}
                  </button>
                </div>
              )}
            </div>

            {/* Progress bar (only if budget is set) */}
            {catBudget > 0 && (
              <>
                <div style={{ height: 6, borderRadius: 3, background: THEME.white10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    background: overBudget
                      ? `linear-gradient(90deg, ${THEME.red}, ${THEME.redLight})`
                      : pct > 70
                        ? `linear-gradient(90deg, ${THEME.orange}, ${THEME.orangeLight})`
                        : `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                    width: `${Math.min(pct, 100)}%`, transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{
                    color: overBudget ? THEME.red : THEME.white40,
                    fontSize: 11, fontFamily: THEME.font, fontWeight: overBudget ? 600 : 400,
                  }}>
                    {curr.symbol} {spent.toLocaleString()} spent {overBudget && `(${curr.symbol} ${(spent - catBudget).toLocaleString()} over!)`}
                  </span>
                  <span style={{ color: THEME.white30, fontSize: 11, fontFamily: THEME.font }}>
                    {curr.symbol} {Math.max(0, catBudget - spent).toLocaleString()} left
                  </span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  if (!isPremium) {
    return (
      <PremiumGate isPremium={false} onUpgrade={showPaywall} feature="Smart Budget Planner">
        {content}
      </PremiumGate>
    );
  }

  return content;
}
