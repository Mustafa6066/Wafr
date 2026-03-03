// ─── Recurring Expense Tracker — subscriptions, bills, recurring charges ───
import { useState } from 'react';
import { THEME, CATEGORIES } from '../constants.js';
import { SectionHeader, EmptyState, ProBadge } from '../Shared.jsx';

const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Daily', days: 1 },
  { id: 'weekly', label: 'Weekly', days: 7 },
  { id: 'monthly', label: 'Monthly', days: 30 },
  { id: 'quarterly', label: 'Quarterly', days: 90 },
  { id: 'yearly', label: 'Yearly', days: 365 },
];

export default function RecurringTracker({ recurring = [], setRecurring, curr, isPremium, showPaywall }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', amount: '', category: 'bills', frequency: 'monthly', nextDue: '' });

  const totalMonthly = recurring.reduce((sum, r) => {
    const freq = FREQUENCY_OPTIONS.find(f => f.id === r.frequency);
    return sum + (r.amount * 30 / (freq?.days || 30));
  }, 0);

  const totalYearly = totalMonthly * 12;

  // Sort by next due date
  const sorted = [...recurring].sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));
  const overdue = sorted.filter(r => new Date(r.nextDue) < new Date());
  const upcoming = sorted.filter(r => {
    const due = new Date(r.nextDue);
    const now = new Date();
    const week = new Date(now.getTime() + 7 * 86400000);
    return due >= now && due <= week;
  });

  const handleSave = () => {
    const amount = Number(form.amount);
    if (!form.name.trim() || !amount || amount <= 0) return;

    const item = {
      id: editId || Date.now(),
      name: form.name.trim(),
      amount,
      category: form.category,
      frequency: form.frequency,
      nextDue: form.nextDue || new Date().toISOString().slice(0, 10),
      active: true,
      createdAt: new Date().toISOString(),
    };

    if (editId) {
      setRecurring(prev => prev.map(r => r.id === editId ? { ...r, ...item } : r));
    } else {
      setRecurring(prev => [...prev, item]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ name: '', amount: '', category: 'bills', frequency: 'monthly', nextDue: '' });
    setShowAdd(false);
    setEditId(null);
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      amount: String(item.amount),
      category: item.category,
      frequency: item.frequency,
      nextDue: item.nextDue?.slice(0, 10) || '',
    });
    setEditId(item.id);
    setShowAdd(true);
  };

  const handleDelete = (id) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
  };

  const inputStyle = {
    width: '100%', background: THEME.white06, border: `1px solid ${THEME.white10}`,
    borderRadius: 12, padding: '12px 14px', color: THEME.white, fontSize: 14,
    outline: 'none', marginBottom: 10, fontFamily: THEME.font, boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '16px 24px' }}>
      <SectionHeader title="Recurring Expenses" proBadge action="+ Add" onAction={() => {
        if (!isPremium) { showPaywall?.(); return; }
        setShowAdd(true);
      }} />

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 16, border: `1px solid ${THEME.cardBorder}` }}>
          <p style={{ color: THEME.white40, fontSize: 11, margin: '0 0 4px', fontWeight: 600 }}>Monthly Cost</p>
          <p style={{ color: THEME.red, fontSize: 20, fontWeight: 800, margin: 0 }}>
            {curr?.symbol} {Math.round(totalMonthly).toLocaleString()}
          </p>
        </div>
        <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 16, border: `1px solid ${THEME.cardBorder}` }}>
          <p style={{ color: THEME.white40, fontSize: 11, margin: '0 0 4px', fontWeight: 600 }}>Yearly Cost</p>
          <p style={{ color: THEME.orange, fontSize: 20, fontWeight: 800, margin: 0 }}>
            {curr?.symbol} {Math.round(totalYearly).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div style={{
          background: 'rgba(255,107,107,0.08)', borderRadius: 16, padding: 14,
          border: '1px solid rgba(255,107,107,0.15)', marginBottom: 16,
        }}>
          <p style={{ color: THEME.red, fontSize: 12, fontWeight: 700, margin: '0 0 6px' }}>
            ⚠️ {overdue.length} OVERDUE
          </p>
          {overdue.map(r => (
            <p key={r.id} style={{ color: THEME.white50, fontSize: 12, margin: '2px 0' }}>
              {r.name} — {curr?.symbol} {r.amount.toLocaleString()} (due {new Date(r.nextDue).toLocaleDateString()})
            </p>
          ))}
        </div>
      )}

      {/* Upcoming this week */}
      {upcoming.length > 0 && (
        <div style={{
          background: 'rgba(255,182,72,0.08)', borderRadius: 16, padding: 14,
          border: '1px solid rgba(255,182,72,0.15)', marginBottom: 16,
        }}>
          <p style={{ color: THEME.orange, fontSize: 12, fontWeight: 700, margin: '0 0 6px' }}>
            📅 UPCOMING THIS WEEK
          </p>
          {upcoming.map(r => (
            <p key={r.id} style={{ color: THEME.white50, fontSize: 12, margin: '2px 0' }}>
              {r.name} — {curr?.symbol} {r.amount.toLocaleString()} (due {new Date(r.nextDue).toLocaleDateString()})
            </p>
          ))}
        </div>
      )}

      {/* Recurring list */}
      {recurring.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="No recurring expenses"
          subtitle="Track subscriptions, bills, and regular payments"
          action="+ Add Recurring"
          onAction={() => { if (!isPremium) { showPaywall?.(); return; } setShowAdd(true); }}
        />
      ) : (
        sorted.map(item => {
          const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];
          const freq = FREQUENCY_OPTIONS.find(f => f.id === item.frequency);
          const isOverdue = new Date(item.nextDue) < new Date();

          return (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 0', borderBottom: `1px solid ${THEME.white04}`,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: `${cat.color}20`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>{cat.icon}</div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: THEME.white, fontSize: 14, fontWeight: 600, margin: 0 }}>{item.name}</p>
                <p style={{ color: isOverdue ? THEME.red : THEME.white30, fontSize: 11, margin: '2px 0 0' }}>
                  {freq?.label || 'Monthly'} • Next: {new Date(item.nextDue).toLocaleDateString()}
                  {isOverdue && ' ⚠️'}
                </p>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0 }}>
                  {curr?.symbol} {item.amount.toLocaleString()}
                </p>
                <div style={{ display: 'flex', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
                  <button onClick={() => handleEdit(item)} style={{
                    background: 'none', border: 'none', color: THEME.white30, fontSize: 10,
                    cursor: 'pointer', padding: 2,
                  }}>✏️</button>
                  <button onClick={() => handleDelete(item.id)} style={{
                    background: 'none', border: 'none', color: THEME.red, fontSize: 10,
                    cursor: 'pointer', padding: 2, opacity: 0.5,
                  }}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={resetForm}>
          <div onClick={e => e.stopPropagation()} style={{
            background: `linear-gradient(180deg, ${THEME.bgTertiary}, ${THEME.bg})`,
            borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 440,
            padding: '28px 24px 40px',
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: THEME.white10, margin: '0 auto 20px' }} />
            <h3 style={{ color: THEME.white, fontSize: 20, fontWeight: 700, margin: '0 0 16px', fontFamily: THEME.font }}>
              {editId ? 'Edit Recurring' : 'Add Recurring Expense'}
            </h3>

            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Expense name (e.g. Netflix, Rent)" style={inputStyle} />
            <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value.replace(/[^0-9.]/g, '') }))}
              placeholder={`Amount (${curr?.symbol})`} inputMode="decimal" style={inputStyle} />

            <p style={{ color: THEME.white50, fontSize: 12, margin: '0 0 8px', fontWeight: 600 }}>Frequency</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {FREQUENCY_OPTIONS.map(f => (
                <button key={f.id} onClick={() => setForm(prev => ({ ...prev, frequency: f.id }))} style={{
                  background: form.frequency === f.id ? 'rgba(0,212,170,0.2)' : THEME.white04,
                  border: form.frequency === f.id ? `1px solid ${THEME.accent}` : `1px solid ${THEME.white06}`,
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  color: form.frequency === f.id ? THEME.accent : THEME.white40,
                  fontSize: 12, fontWeight: 600, fontFamily: THEME.font,
                }}>{f.label}</button>
              ))}
            </div>

            <p style={{ color: THEME.white50, fontSize: 12, margin: '0 0 8px', fontWeight: 600 }}>Category</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {CATEGORIES.filter(c => c.id !== 'savings').map(cat => (
                <button key={cat.id} onClick={() => setForm(f => ({ ...f, category: cat.id }))} style={{
                  background: form.category === cat.id ? 'rgba(0,212,170,0.2)' : THEME.white04,
                  border: form.category === cat.id ? `1px solid ${THEME.accent}` : `1px solid ${THEME.white06}`,
                  borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                  color: form.category === cat.id ? THEME.accent : THEME.white40,
                  fontSize: 11, fontFamily: THEME.font,
                }}>{cat.icon} {cat.name}</button>
              ))}
            </div>

            <p style={{ color: THEME.white50, fontSize: 12, margin: '0 0 8px', fontWeight: 600 }}>Next Due Date</p>
            <input type="date" value={form.nextDue} onChange={e => setForm(f => ({ ...f, nextDue: e.target.value }))}
              style={{ ...inputStyle, colorScheme: 'dark' }} />

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.amount}
                style={{
                  flex: 1,
                  background: form.name.trim() && form.amount
                    ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : THEME.white10,
                  color: form.name.trim() && form.amount ? THEME.bg : THEME.white30,
                  border: 'none', borderRadius: 14, padding: '14px',
                  fontSize: 15, fontWeight: 700, cursor: form.name.trim() && form.amount ? 'pointer' : 'default',
                  fontFamily: THEME.font,
                }}>{editId ? 'Update' : 'Add'}</button>
              <button onClick={resetForm} style={{
                background: THEME.white06, color: THEME.white50,
                border: `1px solid ${THEME.white10}`, borderRadius: 14, padding: '14px 24px',
                fontSize: 15, cursor: 'pointer', fontFamily: THEME.font,
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
