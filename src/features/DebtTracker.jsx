// ─── Debt Tracker — debt payoff planner with avalanche/snowball strategies ───
import { useState, useMemo } from 'react';
import { THEME } from '../constants.js';
import { v4 as uuidv4 } from 'uuid';

const STRATEGIES = [
  { id: 'avalanche', label: 'Avalanche', desc: 'Pay highest interest first (saves most money)', icon: '🏔️' },
  { id: 'snowball', label: 'Snowball', desc: 'Pay smallest balance first (wins motivation)', icon: '⛄' },
];

export default function DebtTracker({ debts = [], onAddDebt, onUpdateDebt, onDeleteDebt, curr = 'EGP' }) {
  const [showAdd, setShowAdd] = useState(false);
  const [strategy, setStrategy] = useState('avalanche');
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', balance: '', rate: '', minPayment: '', extra: '' });

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin = debts.reduce((s, d) => s + d.minPayment, 0);
  const avgRate = debts.length > 0
    ? (debts.reduce((s, d) => s + d.rate, 0) / debts.length).toFixed(1)
    : 0;

  // Sort based on strategy
  const sorted = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (strategy === 'avalanche') return b.rate - a.rate;
      return a.balance - b.balance;
    });
  }, [debts, strategy]);

  // Payoff projection
  const projection = useMemo(() => {
    if (debts.length === 0) return null;
    const totalExtra = debts.reduce((s, d) => s + (d.extra || 0), 0);
    const totalMonthly = totalMin + totalExtra;
    if (totalMonthly <= 0) return null;

    let remaining = [...debts.map(d => ({ ...d }))];
    let months = 0;
    let totalInterest = 0;
    const maxMonths = 600; // 50 year cap

    while (remaining.some(d => d.balance > 0) && months < maxMonths) {
      months++;
      let extraBudget = totalExtra;
      
      remaining.sort((a, b) => {
        if (strategy === 'avalanche') return b.rate - a.rate;
        return a.balance - b.balance;
      });

      remaining.forEach(d => {
        if (d.balance <= 0) return;
        const interest = d.balance * (d.rate / 100 / 12);
        totalInterest += interest;
        d.balance += interest;
        const payment = Math.min(d.balance, d.minPayment);
        d.balance -= payment;
      });

      // Apply extra to focus debt
      for (const d of remaining) {
        if (d.balance <= 0 || extraBudget <= 0) continue;
        const extra = Math.min(d.balance, extraBudget);
        d.balance -= extra;
        extraBudget -= extra;
      }
    }

    const years = Math.floor(months / 12);
    const mo = months % 12;
    const dateStr = years > 0 ? `${years}y ${mo}m` : `${mo} months`;

    const debtFreeDate = new Date();
    debtFreeDate.setMonth(debtFreeDate.getMonth() + months);

    return { months, totalInterest: Math.round(totalInterest), dateStr, debtFreeDate };
  }, [debts, strategy, totalMin]);

  const handleSave = () => {
    const balance = parseFloat(form.balance);
    const rate = parseFloat(form.rate);
    const minPayment = parseFloat(form.minPayment);
    if (!form.name.trim() || isNaN(balance) || isNaN(rate) || isNaN(minPayment)) return;

    const debt = {
      id: editId || uuidv4(),
      name: form.name.trim(),
      balance,
      rate,
      minPayment,
      extra: parseFloat(form.extra) || 0,
      createdAt: editId ? undefined : new Date().toISOString(),
    };

    if (editId) {
      onUpdateDebt?.(debt);
    } else {
      onAddDebt?.(debt);
    }
    setShowAdd(false);
    setEditId(null);
    setForm({ name: '', balance: '', rate: '', minPayment: '', extra: '' });
  };

  const openEdit = (d) => {
    setEditId(d.id);
    setForm({ name: d.name, balance: String(d.balance), rate: String(d.rate), minPayment: String(d.minPayment), extra: String(d.extra || 0) });
    setShowAdd(true);
  };

  const inputStyle = {
    background: THEME.white04, border: `1px solid ${THEME.white06}`, borderRadius: 12,
    padding: '10px 14px', color: THEME.white, fontSize: 14, fontFamily: THEME.font,
    width: '100%', boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{ padding: '16px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
            💳 Debt Tracker
          </h3>
          <p style={{ color: THEME.white40, fontSize: 13, margin: '4px 0 0' }}>
            Plan your path to debt freedom
          </p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ name: '', balance: '', rate: '', minPayment: '', extra: '' }); setShowAdd(true); }}
          style={{
            background: THEME.accent, border: 'none', borderRadius: 12, padding: '8px 16px',
            color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>+ Add Debt</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Total Debt', value: totalDebt.toLocaleString(), sub: curr, color: THEME.red },
          { label: 'Monthly Min', value: totalMin.toLocaleString(), sub: curr, color: THEME.orange },
          { label: 'Avg Rate', value: `${avgRate}%`, sub: 'interest', color: THEME.white50 },
        ].map((c, i) => (
          <div key={i} style={{
            background: THEME.white04, borderRadius: 14, padding: 12, textAlign: 'center',
            border: `1px solid ${THEME.white06}`,
          }}>
            <p style={{ color: THEME.white40, fontSize: 10, fontWeight: 600, margin: 0 }}>{c.label}</p>
            <p style={{ color: c.color, fontSize: 16, fontWeight: 800, margin: '4px 0 0' }}>{c.value}</p>
            <p style={{ color: THEME.white30, fontSize: 10, margin: 0 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Projection card */}
      {projection && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,212,170,0.04))',
          borderRadius: 16, padding: 16, border: `1px solid rgba(0,212,170,0.15)`, marginBottom: 16,
        }}>
          <p style={{ color: THEME.accent, fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>
            🎯 DEBT-FREE PROJECTION ({strategy.toUpperCase()})
          </p>
          <p style={{ color: THEME.white, fontSize: 24, fontWeight: 800, margin: '0 0 2px' }}>
            {projection.dateStr}
          </p>
          <p style={{ color: THEME.white40, fontSize: 12, margin: 0 }}>
            Debt-free by {projection.debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} · {projection.totalInterest.toLocaleString()} {curr} total interest
          </p>
        </div>
      )}

      {/* Strategy toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {STRATEGIES.map(s => (
          <button key={s.id} onClick={() => setStrategy(s.id)} style={{
            flex: 1, padding: '10px 8px', borderRadius: 12, border: 'none',
            background: strategy === s.id ? THEME.accent : THEME.white04,
            color: strategy === s.id ? '#000' : THEME.white50,
            fontWeight: 700, fontSize: 12, cursor: 'pointer', textAlign: 'center',
          }}>
            {s.icon} {s.label}
            <div style={{ fontSize: 9, fontWeight: 400, marginTop: 2, opacity: 0.7 }}>{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Debt list */}
      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
          <p style={{ color: THEME.white40, fontSize: 14, margin: 0 }}>No debts added yet</p>
        </div>
      )}

      {sorted.map((d, i) => (
        <div key={d.id} style={{
          background: THEME.white04, borderRadius: 16, padding: 14,
          border: `1px solid ${i === 0 ? 'rgba(0,212,170,0.2)' : THEME.white06}`,
          marginBottom: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {i === 0 && <span style={{
                background: THEME.accent, color: '#000', fontSize: 9, fontWeight: 800,
                padding: '2px 6px', borderRadius: 4, marginBottom: 4, display: 'inline-block',
              }}>FOCUS</span>}
              <p style={{ color: THEME.white, fontSize: 15, fontWeight: 700, margin: '2px 0 0' }}>{d.name}</p>
              <p style={{ color: THEME.white40, fontSize: 11, margin: '2px 0 0' }}>
                {d.rate}% APR · Min {d.minPayment.toLocaleString()} {curr}/mo
                {d.extra > 0 && ` + ${d.extra.toLocaleString()} extra`}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: THEME.red, fontSize: 18, fontWeight: 800, margin: 0 }}>
                {d.balance.toLocaleString()}
              </p>
              <p style={{ color: THEME.white30, fontSize: 11, margin: 0 }}>{curr}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => openEdit(d)} style={{
              flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid ${THEME.white10}`,
              background: 'none', color: THEME.white50, fontSize: 12, cursor: 'pointer',
            }}>Edit</button>
            <button onClick={() => onDeleteDebt?.(d.id)} style={{
              flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid rgba(255,71,87,0.2)`,
              background: 'none', color: THEME.red, fontSize: 12, cursor: 'pointer',
            }}>Remove</button>
          </div>
        </div>
      ))}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', zIndex: 100,
        }} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{
            background: THEME.darkBg, borderRadius: '24px 24px 0 0', padding: 24,
            width: '100%', maxWidth: 420,
          }}>
            <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>
              {editId ? 'Edit Debt' : 'Add New Debt'}
            </h3>

            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Credit Card, Car Loan" style={{ ...inputStyle, marginBottom: 12 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div>
                <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Balance</label>
                <input type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
                  placeholder="0.00" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Interest Rate %</label>
                <input type="number" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}
                  placeholder="0.0" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div>
                <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Min Monthly</label>
                <input type="number" value={form.minPayment} onChange={e => setForm(f => ({ ...f, minPayment: e.target.value }))}
                  placeholder="0.00" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Extra Monthly</label>
                <input type="number" value={form.extra} onChange={e => setForm(f => ({ ...f, extra: e.target.value }))}
                  placeholder="0.00" style={inputStyle} />
              </div>
            </div>

            <button onClick={handleSave} style={{
              width: '100%', padding: 14, borderRadius: 14, background: THEME.accent,
              border: 'none', color: '#000', fontWeight: 800, fontSize: 15, cursor: 'pointer',
            }}>{editId ? 'Save Changes' : 'Add Debt'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
