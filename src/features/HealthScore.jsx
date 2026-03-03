// ─── Financial Health Score — gamified financial wellness metric ───
import { useMemo } from 'react';
import { THEME } from '../constants.js';
import { ProgressRing } from '../Shared.jsx';

export default function HealthScore({ expenses = [], goals = [], budgets = {}, recurring = [], income = 0, curr }) {
  const score = useMemo(() => {
    let total = 0;
    const factors = [];

    // 1. Savings Rate (0-25 points)
    const now = new Date();
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const savingsRate = income > 0 ? Math.round(((income - totalSpent) / income) * 100) : 0;
    const savingsPoints = Math.min(25, Math.max(0, Math.round(savingsRate * 1.25)));
    total += savingsPoints;
    factors.push({
      name: 'Savings Rate',
      icon: '💰',
      score: savingsPoints,
      max: 25,
      detail: `${savingsRate}% of income saved`,
      status: savingsRate >= 20 ? 'excellent' : savingsRate >= 10 ? 'good' : savingsRate >= 0 ? 'fair' : 'poor',
    });

    // 2. Budget Adherence (0-25 points)
    const budgetCategories = Object.keys(budgets);
    let budgetScore = 0;
    if (budgetCategories.length > 0) {
      let underBudget = 0;
      budgetCategories.forEach(cat => {
        const spent = monthExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
        if (spent <= budgets[cat]) underBudget++;
      });
      budgetScore = Math.round((underBudget / budgetCategories.length) * 25);
    } else {
      budgetScore = 5; // partial credit for existing
    }
    total += budgetScore;
    factors.push({
      name: 'Budget Discipline',
      icon: '📊',
      score: budgetScore,
      max: 25,
      detail: budgetCategories.length > 0
        ? `${Math.round((budgetScore / 25) * 100)}% categories under budget`
        : 'Set budgets to improve score',
      status: budgetScore >= 20 ? 'excellent' : budgetScore >= 12 ? 'good' : budgetScore >= 5 ? 'fair' : 'poor',
    });

    // 3. Emergency Fund (0-20 points)
    const emergencyGoal = goals.find(g => g.name?.toLowerCase().includes('emergency') || g.id === 'emergency');
    const emergencyTarget = income * 3; // 3 months income
    const emergencySaved = emergencyGoal ? emergencyGoal.saved : 0;
    const emergencyPct = emergencyTarget > 0 ? Math.min(100, Math.round((emergencySaved / emergencyTarget) * 100)) : 0;
    const emergencyPoints = Math.round(emergencyPct * 0.2);
    total += emergencyPoints;
    factors.push({
      name: 'Emergency Fund',
      icon: '🛡️',
      score: emergencyPoints,
      max: 20,
      detail: emergencyGoal
        ? `${emergencyPct}% of 3-month target`
        : 'Create an emergency fund goal',
      status: emergencyPct >= 100 ? 'excellent' : emergencyPct >= 50 ? 'good' : emergencyPct > 0 ? 'fair' : 'poor',
    });

    // 4. Expense Tracking Consistency (0-15 points)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const daysWithExpenses = new Set(
      monthExpenses.map(e => new Date(e.date).getDate())
    ).size;
    const trackingPct = daysPassed > 0 ? Math.round((daysWithExpenses / daysPassed) * 100) : 0;
    const trackingPoints = Math.min(15, Math.round(trackingPct * 0.15));
    total += trackingPoints;
    factors.push({
      name: 'Tracking Habit',
      icon: '📝',
      score: trackingPoints,
      max: 15,
      detail: `Tracked ${daysWithExpenses} of ${daysPassed} days`,
      status: trackingPct >= 80 ? 'excellent' : trackingPct >= 50 ? 'good' : trackingPct > 0 ? 'fair' : 'poor',
    });

    // 5. Recurring Management (0-15 points)
    const recurringMonthly = recurring.reduce((s, r) => {
      const daysInFreq = { daily: 1, weekly: 7, monthly: 30, quarterly: 90, yearly: 365 };
      return s + (r.amount * 30 / (daysInFreq[r.frequency] || 30));
    }, 0);
    const recurringPct = income > 0 ? Math.round((recurringMonthly / income) * 100) : 0;
    const recurringPoints = recurringPct <= 30 ? 15 : recurringPct <= 50 ? 10 : recurringPct <= 70 ? 5 : 0;
    total += recurringPoints;
    factors.push({
      name: 'Fixed Costs',
      icon: '🔄',
      score: recurringPoints,
      max: 15,
      detail: `${recurringPct}% of income on fixed costs`,
      status: recurringPct <= 30 ? 'excellent' : recurringPct <= 50 ? 'good' : recurringPct <= 70 ? 'fair' : 'poor',
    });

    const grade = total >= 85 ? 'Excellent' : total >= 70 ? 'Good' : total >= 50 ? 'Fair' : 'Needs Work';
    const gradeColor = total >= 85 ? THEME.accent : total >= 70 ? '#4ECDC4' : total >= 50 ? THEME.orange : THEME.red;
    const emoji = total >= 85 ? '🌟' : total >= 70 ? '👍' : total >= 50 ? '💪' : '⚡';

    return { total, factors, grade, gradeColor, emoji };
  }, [expenses, goals, budgets, recurring, income]);

  const statusColors = {
    excellent: THEME.accent,
    good: '#4ECDC4',
    fair: THEME.orange,
    poor: THEME.red,
  };

  return (
    <div style={{ padding: '16px 24px' }}>
      <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: '0 0 4px', fontFamily: THEME.font }}>
        💊 Financial Health Score
      </h3>
      <p style={{ color: THEME.white40, fontSize: 13, margin: '0 0 24px', fontFamily: THEME.font }}>
        Your personalized financial wellness rating
      </p>

      {/* Main score circle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <ProgressRing progress={score.total} size={160} strokeWidth={10} color={score.gradeColor}>
          <span style={{ fontSize: 40, fontWeight: 800, color: score.gradeColor }}>{score.total}</span>
          <span style={{ fontSize: 11, color: THEME.white40, fontWeight: 600 }}>/100</span>
        </ProgressRing>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: 32 }}>{score.emoji}</span>
        <p style={{ color: score.gradeColor, fontSize: 22, fontWeight: 800, margin: '4px 0 0', fontFamily: THEME.font }}>
          {score.grade}
        </p>
      </div>

      {/* Factor breakdown */}
      <p style={{ color: THEME.white50, fontSize: 13, fontWeight: 600, margin: '0 0 12px', fontFamily: THEME.font }}>
        Score Breakdown
      </p>
      {score.factors.map((factor, i) => (
        <div key={i} style={{
          background: THEME.white04, borderRadius: 16, padding: 14,
          border: `1px solid ${THEME.white06}`, marginBottom: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{factor.icon}</span>
              <div>
                <p style={{ color: THEME.white, fontSize: 14, fontWeight: 600, margin: 0 }}>{factor.name}</p>
                <p style={{ color: THEME.white40, fontSize: 11, margin: 0 }}>{factor.detail}</p>
              </div>
            </div>
            <span style={{
              color: statusColors[factor.status], fontSize: 16, fontWeight: 800,
            }}>{factor.score}/{factor.max}</span>
          </div>
          <div style={{ height: 4, background: THEME.white06, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${(factor.score / factor.max) * 100}%`,
              background: statusColors[factor.status],
              transition: 'width 0.8s ease',
            }} />
          </div>
        </div>
      ))}

      {/* Tips based on weakest factor */}
      {(() => {
        const weakest = [...score.factors].sort((a, b) => (a.score / a.max) - (b.score / b.max))[0];
        if (!weakest || weakest.score / weakest.max >= 0.8) return null;
        
        const tips = {
          'Savings Rate': 'Try the 50/30/20 rule: needs, wants, and 20% to savings.',
          'Budget Discipline': 'Set category budgets in the Budget tab to track limits.',
          'Emergency Fund': 'Start small — save just 5% of income towards 3 months of expenses.',
          'Tracking Habit': 'Enable SMS auto-tracking to capture expenses you might miss.',
          'Fixed Costs': 'Review subscriptions — cancel ones you haven\'t used in 30 days.',
        };

        return (
          <div style={{
            background: 'rgba(0,212,170,0.08)', borderRadius: 16, padding: 16,
            border: `1px solid rgba(0,212,170,0.15)`, marginTop: 8,
          }}>
            <p style={{ color: THEME.accent, fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>💡 TOP TIP TO IMPROVE</p>
            <p style={{ color: THEME.white, fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>
              Improve your {weakest.name}
            </p>
            <p style={{ color: THEME.white50, fontSize: 13, margin: 0 }}>
              {tips[weakest.name] || 'Keep tracking your expenses to see improvements.'}
            </p>
          </div>
        );
      })()}
    </div>
  );
}
