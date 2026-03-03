// ─── Cash Flow Forecast — 30-day income vs expense projection ───
import { useMemo } from 'react';
import { THEME } from '../constants.js';

export default function CashFlow({ expenses = [], recurring = [], income = 0, curr }) {
  const forecast = useMemo(() => {
    const days = 30;
    const now = new Date();
    const data = [];

    // Calculate daily spending average from last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const recentExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
    const dailyAvg = recentExpenses.length > 0
      ? recentExpenses.reduce((s, e) => s + e.amount, 0) / 30
      : income * 0.025; // fallback to 2.5% of income daily

    let balance = income;
    const monthlyExpenseTotal = dailyAvg * 30;

    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() + i * 86400000);
      const dayOfMonth = date.getDate();
      
      // Check for recurring expenses due on this day
      let recurringDue = 0;
      recurring.forEach(r => {
        if (r.nextDue) {
          const dueDate = new Date(r.nextDue);
          if (dueDate.getDate() === dayOfMonth) {
            recurringDue += r.amount;
          }
        }
      });

      const dailySpend = dailyAvg + recurringDue;
      balance -= dailySpend;

      data.push({
        date,
        day: i + 1,
        label: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        balance: Math.round(balance),
        spending: Math.round(dailySpend),
        recurringDue: Math.round(recurringDue),
      });
    }

    return {
      data,
      projectedSavings: Math.round(income - monthlyExpenseTotal),
      savingsRate: Math.round(((income - monthlyExpenseTotal) / income) * 100),
      dailyAvg: Math.round(dailyAvg),
      daysUntilZero: data.findIndex(d => d.balance <= 0),
      projectedTotal: Math.round(monthlyExpenseTotal),
    };
  }, [expenses, recurring, income]);

  const maxBalance = Math.max(income, ...forecast.data.map(d => Math.abs(d.balance)));
  const chartHeight = 180;

  return (
    <div style={{ padding: '16px 24px' }}>
      <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: '0 0 4px', fontFamily: THEME.font }}>
         Cash Flow Forecast
      </h3>
      <p style={{ color: THEME.white40, fontSize: 13, margin: '0 0 20px', fontFamily: THEME.font }}>
        30-day projection based on your spending habits
      </p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={{ background: THEME.cardBg, borderRadius: 14, padding: 12, border: `1px solid ${THEME.cardBorder}`, textAlign: 'center' }}>
          <p style={{ color: THEME.white40, fontSize: 10, margin: '0 0 4px', fontWeight: 600 }}>Daily Avg</p>
          <p style={{ color: THEME.white, fontSize: 16, fontWeight: 800, margin: 0 }}>
            {curr?.symbol} {forecast.dailyAvg.toLocaleString()}
          </p>
        </div>
        <div style={{ background: THEME.cardBg, borderRadius: 14, padding: 12, border: `1px solid ${THEME.cardBorder}`, textAlign: 'center' }}>
          <p style={{ color: THEME.white40, fontSize: 10, margin: '0 0 4px', fontWeight: 600 }}>Projected Total</p>
          <p style={{ color: THEME.red, fontSize: 16, fontWeight: 800, margin: 0 }}>
            {curr?.symbol} {forecast.projectedTotal.toLocaleString()}
          </p>
        </div>
        <div style={{ background: THEME.cardBg, borderRadius: 14, padding: 12, border: `1px solid ${THEME.cardBorder}`, textAlign: 'center' }}>
          <p style={{ color: THEME.white40, fontSize: 10, margin: '0 0 4px', fontWeight: 600 }}>Savings</p>
          <p style={{ color: forecast.projectedSavings >= 0 ? THEME.accent : THEME.red, fontSize: 16, fontWeight: 800, margin: 0 }}>
            {forecast.savingsRate}%
          </p>
        </div>
      </div>

      {/* Warning if running out */}
      {forecast.daysUntilZero > 0 && forecast.daysUntilZero < 30 && (
        <div style={{
          background: 'rgba(255,107,107,0.08)', borderRadius: 14, padding: 14,
          border: '1px solid rgba(255,107,107,0.15)', marginBottom: 16,
        }}>
          <p style={{ color: THEME.red, fontSize: 13, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
             At this rate, you'll run out of budget in {forecast.daysUntilZero} days
          </p>
          <p style={{ color: THEME.white40, fontSize: 11, margin: '4px 0 0' }}>
            Try reducing daily spending by {curr?.symbol} {Math.round(forecast.dailyAvg * 0.2).toLocaleString()} to stay on track
          </p>
        </div>
      )}

      {/* Chart */}
      <div style={{
        background: THEME.white04, borderRadius: 18, padding: 16,
        border: `1px solid ${THEME.white06}`, marginBottom: 16,
      }}>
        <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 600, margin: '0 0 12px' }}>
          Projected Balance
        </p>
        <div style={{ height: chartHeight, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          {forecast.data.map((d, i) => {
            const h = Math.abs(d.balance) / maxBalance * chartHeight * 0.85;
            const isNegative = d.balance < 0;
            return (
              <div key={i} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                height: '100%',
              }}>
                <div style={{
                  width: '100%', minHeight: 2,
                  height: Math.max(2, h),
                  borderRadius: '2px 2px 0 0',
                  background: isNegative
                    ? `linear-gradient(180deg, ${THEME.red}, rgba(255,107,107,0.3))`
                    : i % 2 === 0
                      ? `linear-gradient(180deg, ${THEME.accent}, rgba(0,212,170,0.3))`
                      : `linear-gradient(180deg, ${THEME.accentDark}, rgba(0,212,170,0.2))`,
                  transition: 'height 0.5s ease',
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ color: THEME.white30, fontSize: 9 }}>Today</span>
          <span style={{ color: THEME.white30, fontSize: 9 }}>+15 days</span>
          <span style={{ color: THEME.white30, fontSize: 9 }}>+30 days</span>
        </div>
      </div>

      {/* Key dates */}
      <p style={{ color: THEME.white50, fontSize: 13, fontWeight: 600, margin: '0 0 10px' }}> Key Dates</p>
      {forecast.data.filter(d => d.recurringDue > 0).slice(0, 5).map((d, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 0', borderBottom: `1px solid ${THEME.white04}`,
        }}>
          <span style={{ color: THEME.white50, fontSize: 13 }}>{d.label}</span>
          <span style={{ color: THEME.orange, fontSize: 13, fontWeight: 600 }}>
            -{curr?.symbol} {d.recurringDue.toLocaleString()} due
          </span>
        </div>
      ))}
    </div>
  );
}
