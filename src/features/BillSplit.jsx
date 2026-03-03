import { Handshake } from "lucide-react";
// ─── Bill Split — split expenses with friends ───
import { useState } from 'react';
import { THEME } from '../constants.js';
import { v4 as uuidv4 } from 'uuid';

const SPLIT_METHODS = [
  { id: 'equal', label: 'Equal', icon: '' },
  { id: 'custom', label: 'Custom', icon: '' },
  { id: 'percentage', label: 'Percentage', icon: '%' },
];

export default function BillSplit({ splits = [], onAddSplit, onUpdateSplit, onDeleteSplit, curr = 'EGP' }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', total: '', method: 'equal', members: ['', ''] });
  const [customAmounts, setCustomAmounts] = useState({});
  const [customPcts, setCustomPcts] = useState({});

  const addMember = () => setForm(f => ({ ...f, members: [...f.members, ''] }));
  const removeMember = i => {
    if (form.members.length <= 2) return;
    setForm(f => ({ ...f, members: f.members.filter((_, j) => j !== i) }));
  };
  const setMember = (i, v) => setForm(f => ({ ...f, members: f.members.map((m, j) => j === i ? v : m) }));

  const handleCreate = () => {
    const total = parseFloat(form.total);
    if (!form.title.trim() || isNaN(total) || total <= 0) return;
    const validMembers = form.members.filter(m => m.trim());
    if (validMembers.length < 2) return;

    let shares;
    if (form.method === 'equal') {
      const perPerson = Math.round((total / validMembers.length) * 100) / 100;
      shares = validMembers.map((name, i) => ({
        name, amount: i === 0 ? total - perPerson * (validMembers.length - 1) : perPerson,
        paid: false,
      }));
    } else if (form.method === 'custom') {
      shares = validMembers.map(name => ({
        name, amount: parseFloat(customAmounts[name]) || 0, paid: false,
      }));
    } else {
      shares = validMembers.map(name => ({
        name, amount: Math.round(total * (parseFloat(customPcts[name]) || 0) / 100 * 100) / 100,
        paid: false,
      }));
    }

    const split = {
      id: uuidv4(),
      title: form.title.trim(),
      total,
      method: form.method,
      shares,
      createdAt: new Date().toISOString(),
    };
    onAddSplit?.(split);
    setShowAdd(false);
    setForm({ title: '', total: '', method: 'equal', members: ['', ''] });
    setCustomAmounts({});
    setCustomPcts({});
  };

  const togglePaid = (splitId, memberIdx) => {
    const s = splits.find(x => x.id === splitId);
    if (!s) return;
    const updated = {
      ...s,
      shares: s.shares.map((sh, i) => i === memberIdx ? { ...sh, paid: !sh.paid } : sh),
    };
    onUpdateSplit?.(updated);
  };

  const settled = splits.filter(s => s.shares.every(sh => sh.paid));
  const active = splits.filter(s => !s.shares.every(sh => sh.paid));

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
             Bill Split
          </h3>
          <p style={{ color: THEME.white40, fontSize: 13, margin: '4px 0 0', fontFamily: THEME.font }}>
            Split expenses with friends & family
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          background: THEME.accent, border: 'none', borderRadius: 12, padding: '8px 16px',
          color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>+ New Split</button>
      </div>

      {/* Active splits */}
      {active.length === 0 && settled.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}><Handshake size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
          <p style={{ color: THEME.white40, fontSize: 14, margin: 0, fontFamily: THEME.font }}>
            No bill splits yet. Create one to start!
          </p>
        </div>
      )}

      {active.map(s => (
        <div key={s.id} style={{
          background: THEME.white04, borderRadius: 16, padding: 16,
          border: `1px solid ${THEME.white06}`, marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <p style={{ color: THEME.white, fontSize: 15, fontWeight: 700, margin: 0 }}>{s.title}</p>
              <p style={{ color: THEME.white40, fontSize: 12, margin: '2px 0 0' }}>
                {s.shares.filter(sh => sh.paid).length}/{s.shares.length} paid · {s.method} split
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: THEME.accent, fontSize: 16, fontWeight: 800, margin: 0 }}>
                {s.total.toLocaleString()} {curr}
              </p>
              <button onClick={() => onDeleteSplit?.(s.id)} style={{
                background: 'none', border: 'none', color: THEME.red, fontSize: 11,
                cursor: 'pointer', padding: 0, marginTop: 4,
              }}>Delete</button>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: THEME.white06, borderRadius: 2, marginBottom: 12 }}>
            <div style={{
              height: '100%', borderRadius: 2, background: THEME.accent,
              width: `${(s.shares.filter(sh => sh.paid).length / s.shares.length) * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>

          {s.shares.map((sh, i) => (
            <div key={i} onClick={() => togglePaid(s.id, i)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', borderRadius: 10,
              background: sh.paid ? 'rgba(0,212,170,0.06)' : 'transparent',
              cursor: 'pointer', marginBottom: 4,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: sh.paid ? THEME.accent : THEME.white06,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, transition: 'all 0.2s',
                }}>
                  {sh.paid ? '✓' : ''}
                </div>
                <span style={{
                  color: sh.paid ? THEME.white50 : THEME.white, fontSize: 14,
                  textDecoration: sh.paid ? 'line-through' : 'none',
                }}>{sh.name}</span>
              </div>
              <span style={{ color: sh.paid ? THEME.white40 : THEME.accent, fontSize: 14, fontWeight: 700 }}>
                {sh.amount.toLocaleString()} {curr}
              </span>
            </div>
          ))}
        </div>
      ))}

      {settled.length > 0 && (
        <>
          <p style={{ color: THEME.white40, fontSize: 13, fontWeight: 600, margin: '16px 0 8px', fontFamily: THEME.font }}>
             Settled
          </p>
          {settled.map(s => (
            <div key={s.id} style={{
              background: THEME.white04, borderRadius: 16, padding: 14,
              border: `1px solid ${THEME.white06}`, marginBottom: 8, opacity: 0.6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: THEME.white50, fontSize: 14, fontWeight: 600, margin: 0 }}>{s.title}</p>
                <p style={{ color: THEME.white40, fontSize: 14, fontWeight: 700, margin: 0 }}>
                  {s.total.toLocaleString()} {curr}
                </p>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', zIndex: 100,
        }} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{
            background: THEME.darkBg, borderRadius: '24px 24px 0 0', padding: 24,
            width: '100%', maxWidth: 420, maxHeight: '85vh', overflowY: 'auto',
          }}>
            <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>New Bill Split</h3>

            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Dinner at Ovio" style={{ ...inputStyle, marginBottom: 12 }} />

            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Total Amount</label>
            <input type="number" value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))}
              placeholder="0.00" style={{ ...inputStyle, marginBottom: 12 }} />

            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Split Method</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {SPLIT_METHODS.map(m => (
                <button key={m.id} onClick={() => setForm(f => ({ ...f, method: m.id }))}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                    background: form.method === m.id ? THEME.accent : THEME.white04,
                    color: form.method === m.id ? '#000' : THEME.white50,
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block' }}>
              Members
            </label>
            {form.members.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={m} onChange={e => setMember(i, e.target.value)}
                  placeholder={`Person ${i + 1}`} style={{ ...inputStyle, flex: 1 }} />
                {form.method === 'custom' && (
                  <input type="number" value={customAmounts[m] || ''}
                    onChange={e => setCustomAmounts(p => ({ ...p, [m]: e.target.value }))}
                    placeholder="Amount" style={{ ...inputStyle, width: 90, flex: 'none' }} />
                )}
                {form.method === 'percentage' && (
                  <input type="number" value={customPcts[m] || ''}
                    onChange={e => setCustomPcts(p => ({ ...p, [m]: e.target.value }))}
                    placeholder="%" style={{ ...inputStyle, width: 60, flex: 'none' }} />
                )}
                <button onClick={() => removeMember(i)} style={{
                  background: THEME.white04, border: 'none', borderRadius: 10,
                  width: 36, color: THEME.red, cursor: 'pointer', fontSize: 16,
                }}>×</button>
              </div>
            ))}
            <button onClick={addMember} style={{
              background: 'none', border: `1px dashed ${THEME.white10}`, borderRadius: 12,
              padding: '8px 16px', color: THEME.white40, fontSize: 13, cursor: 'pointer',
              width: '100%', marginBottom: 16,
            }}>+ Add Person</button>

            <button onClick={handleCreate} style={{
              width: '100%', padding: 14, borderRadius: 14, background: THEME.accent,
              border: 'none', color: '#000', fontWeight: 800, fontSize: 15, cursor: 'pointer',
            }}>Create Split</button>
          </div>
        </div>
      )}
    </div>
  );
}
