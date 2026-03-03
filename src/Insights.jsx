import { useState } from "react";
import { useApp } from "./WafrApp.jsx";
import { CATEGORIES, SAVING_TIPS, THEME } from "./constants.js";
import { PremiumGate, SectionHeader } from "./Shared.jsx";

export default function Insights() {
  const { curr, isPremium, expenses, currentMonthExpenses, totalSpent, budget, profile, showPaywall } = useApp();
  const [period, setPeriod] = useState("month");

  const now = new Date();

  // Get expenses for selected period
  const periodExpenses = period === "week"
    ? expenses.filter(e => (now - new Date(e.date)) < 7 * 86400000)
    : period === "month"
      ? currentMonthExpenses
      : expenses;

  const periodTotal = periodExpenses.reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const catTotals = {};
  periodExpenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const maxCatVal = sortedCats[0]?.[1] || 1;

  // Weekly comparison (this week vs last week)
  const thisWeekExpenses = expenses.filter(e => (now - new Date(e.date)) < 7 * 86400000);
  const lastWeekExpenses = expenses.filter(e => {
    const d = now - new Date(e.date);
    return d >= 7 * 86400000 && d < 14 * 86400000;
  });
  const thisWeekTotal = thisWeekExpenses.reduce((s, e) => s + e.amount, 0);
  const lastWeekTotal = lastWeekExpenses.reduce((s, e) => s + e.amount, 0);
  const weekChange = lastWeekTotal > 0 ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) : 0;

  // Daily average
  const daysInPeriod = period === "week" ? 7 : period === "month" ? now.getDate() : Math.max(1, Math.ceil((now - new Date(Math.min(...expenses.map(e => new Date(e.date))))) / 86400000));
  const dailyAvg = periodTotal / Math.max(1, daysInPeriod);

  // Savings rate
  const savingsRate = budget > 0 ? Math.round(((budget - totalSpent) / budget) * 100) : 0;

  // Spending by day of week
  const daySpending = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  currentMonthExpenses.forEach(e => {
    daySpending[new Date(e.date).getDay()] += e.amount;
  });
  const maxDay = Math.max(...daySpending, 1);

  // Relevant tips based on top spending
  const topCatIds = sortedCats.slice(0, 3).map(([id]) => id);
  const relevantTips = SAVING_TIPS
    .filter(t => topCatIds.includes(t.category))
    .slice(0, 3);
  const otherTips = SAVING_TIPS.filter(t => !topCatIds.includes(t.category)).slice(0, Math.max(0, 3 - relevantTips.length));
  const tips = [...relevantTips, ...otherTips].slice(0, 3);

  return (
    <div style={{ padding: "16px 24px" }}>
      <SectionHeader title="Spending Insights" />

      {/* Period Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { id: "week", label: "This Week" },
          { id: "month", label: "This Month" },
          { id: "all", label: "All Time" },
        ].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} style={{
            flex: 1, background: period === p.id ? "rgba(0,212,170,0.15)" : THEME.white04,
            border: period === p.id ? `1.5px solid ${THEME.accent}` : `1.5px solid ${THEME.cardBorder}`,
            borderRadius: 10, padding: "8px", cursor: "pointer",
            color: period === p.id ? THEME.accent : THEME.white50,
            fontSize: 12, fontWeight: 600, fontFamily: THEME.font,
          }}>{p.label}</button>
        ))}
      </div>

      {/* Overview Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        <StatCard label="Total Spent" value={`${curr.symbol} ${periodTotal.toLocaleString()}`} color={THEME.redLight} />
        <StatCard label="Daily Avg" value={`${curr.symbol} ${Math.round(dailyAvg).toLocaleString()}`} color={THEME.orange} />
        <StatCard label="Savings Rate" value={`${savingsRate}%`} color={savingsRate >= 20 ? THEME.accent : THEME.red} />
      </div>

      {/* Week Comparison */}
      <div style={{
        background: THEME.cardBg, borderRadius: 16, padding: "16px", marginBottom: 16,
        border: `1px solid ${THEME.cardBorder}`,
      }}>
        <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 600, margin: "0 0 8px", fontFamily: THEME.font }}>
          Weekly Comparison
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: THEME.white, fontSize: 18, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
              {curr.symbol} {thisWeekTotal.toLocaleString()}
            </p>
            <p style={{ color: THEME.white40, fontSize: 11, margin: 0, fontFamily: THEME.font }}>This week</p>
          </div>
          <div style={{
            background: weekChange <= 0 ? "rgba(0,212,170,0.1)" : "rgba(255,107,107,0.1)",
            borderRadius: 10, padding: "6px 12px",
          }}>
            <span style={{
              color: weekChange <= 0 ? THEME.accent : THEME.red,
              fontSize: 14, fontWeight: 700, fontFamily: THEME.font,
            }}>
              {weekChange <= 0 ? "↓" : "↑"} {Math.abs(weekChange)}%
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: THEME.white50, fontSize: 18, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
              {curr.symbol} {lastWeekTotal.toLocaleString()}
            </p>
            <p style={{ color: THEME.white40, fontSize: 11, margin: 0, fontFamily: THEME.font }}>Last week</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <SectionHeader title="By Category" />
      {sortedCats.length === 0 ? (
        <p style={{ color: THEME.white50, fontSize: 14, margin: "0 0 16px", fontFamily: THEME.font }}>
          No expenses to show. Start tracking!
        </p>
      ) : (
        sortedCats.map(([catId, amount]) => {
          const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
          const pctOfTotal = periodTotal > 0 ? Math.round((amount / periodTotal) * 100) : 0;
          return (
            <div key={catId} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: THEME.white, fontSize: 13, fontWeight: 600, fontFamily: THEME.font }}>
                  {cat.icon} {cat.name}
                </span>
                <span style={{ color: THEME.white50, fontSize: 13, fontWeight: 600, fontFamily: THEME.font }}>
                  {curr.symbol} {amount.toLocaleString()} ({pctOfTotal}%)
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: THEME.white06, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                  width: `${(amount / maxCatVal) * 100}%`, transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          );
        })
      )}

      {/* Spending by Day — PRO */}
      {isPremium ? (
        <>
          <SectionHeader title="Spending by Day" />
          <div style={{
            background: THEME.cardBg, borderRadius: 16, padding: "16px", marginBottom: 16,
            border: `1px solid ${THEME.cardBorder}`,
          }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
              {daySpending.map((val, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%", borderRadius: 4,
                    background: i === now.getDay()
                      ? `linear-gradient(180deg, ${THEME.accent}, ${THEME.accentDark})`
                      : `linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))`,
                    height: `${Math.max(4, (val / maxDay) * 80)}px`,
                    transition: "height 0.5s ease",
                  }} />
                  <span style={{
                    color: i === now.getDay() ? THEME.accent : THEME.white30,
                    fontSize: 9, fontWeight: 600, fontFamily: THEME.font,
                  }}>{dayLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Projected Spending */}
          <div style={{
            background: "rgba(255,182,72,0.08)", borderRadius: 16, padding: "16px", marginBottom: 16,
            border: "1px solid rgba(255,182,72,0.12)",
          }}>
            <p style={{ color: THEME.orange, fontSize: 12, fontWeight: 700, margin: "0 0 6px", fontFamily: THEME.font }}>
              📈 Month-End Projection
            </p>
            <p style={{ color: THEME.white, fontSize: 18, fontWeight: 800, margin: "0 0 4px", fontFamily: THEME.font }}>
              {curr.symbol} {Math.round(dailyAvg * 30).toLocaleString()}
            </p>
            <p style={{ color: THEME.white50, fontSize: 12, margin: 0, fontFamily: THEME.font }}>
              {Math.round(dailyAvg * 30) > budget
                ? `⚠️ ${curr.symbol} ${(Math.round(dailyAvg * 30) - budget).toLocaleString()} over budget at this pace`
                : `✅ ${curr.symbol} ${(budget - Math.round(dailyAvg * 30)).toLocaleString()} under budget at this pace`}
            </p>
          </div>
        </>
      ) : (
        <PremiumGate isPremium={false} onUpgrade={showPaywall} feature="Advanced Analytics">
          <div style={{ padding: "40px 0" }}>
            <SectionHeader title="Spending by Day" />
            <div style={{ background: THEME.cardBg, borderRadius: 16, padding: "16px", height: 120, border: `1px solid ${THEME.cardBorder}` }} />
          </div>
        </PremiumGate>
      )}

      {/* AI Tips */}
      <SectionHeader title="AI Saving Tips" />
      {tips.map((tip, i) => (
        <div key={i} style={{
          background: THEME.cardBg, borderRadius: 16, padding: "16px", marginBottom: 10,
          border: `1px solid ${THEME.cardBorder}`,
        }}>
          <p style={{ color: THEME.white, fontSize: 13, margin: "0 0 8px", lineHeight: 1.5, fontFamily: THEME.font }}>
            💡 {tip.tip}
          </p>
          <div style={{
            display: "inline-block", background: "rgba(0,212,170,0.1)",
            borderRadius: 8, padding: "3px 10px",
          }}>
            <span style={{ color: THEME.accent, fontSize: 12, fontWeight: 700, fontFamily: THEME.font }}>
              Save {curr.symbol} {tip.saving}/mo
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: THEME.cardBg, borderRadius: 14, padding: "14px 10px",
      border: `1px solid ${THEME.cardBorder}`, textAlign: "center",
    }}>
      <p style={{ color: THEME.white40, fontSize: 10, margin: "0 0 4px", fontWeight: 600, fontFamily: THEME.font }}>{label}</p>
      <p style={{ color: color || THEME.white, fontSize: 15, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>{value}</p>
    </div>
  );
}
