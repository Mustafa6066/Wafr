// ─── Savings Pots — named savings buckets with auto-save rules ───
import { useState, useMemo } from 'react';
import { THEME } from '../constants.js';
import { v4 as uuidv4 } from 'uuid';

const POT_ICONS = ['🎯', '✈️', '🏠', '🚗', '💍', '🎓', '📱', '🛡️', '🎁', '💰', '🏖️', '🩺'];
const AUTO_RULES = [
  { id: 'none', label: 'Manual Only' },
  { id: 'daily', label: 'Save Daily' },
  { id: 'weekly', label: 'Save Weekly' },
  { id: 'monthly', label: 'Save Monthly' },
  { id: 'roundup', label: 'Round-Up Savings', desc: 'Round up expenses to nearest 10' },
];

export default function SavingsPots({ pots = [], onAddPot, onUpdatePot, onDeletePot, onDeposit, onWithdraw, curr = 'EGP' }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showDeposit, setShowDeposit] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isWithdraw, setIsWithdraw] = useState(false);
  const [form, setForm] = useState({ name: '', target: '', icon: '🎯', autoRule: 'none', autoAmount: '' });

  const totalSaved = useMemo(() => pots.reduce((s, p) => s + p.saved, 0), [pots]);
  const totalTarget = useMemo(() => pots.reduce((s, p) => s + p.target, 0), [pots]);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleCreate = () => {
    const target = parseFloat(form.target);
    if (!form.name.trim() || isNaN(target) || target <= 0) return;
    const pot = {
      id: uuidv4(),
      name: form.name.trim(),
      saved: 0,
      target,
      icon: form.icon,
      autoRule: form.autoRule,
      autoAmount: parseFloat(form.autoAmount) || 0,
      color: `hsl(${Math.random() * 360}, 70%, 55%)`,
      createdAt: new Date().toISOString(),
      history: [],
    };
    onAddPot?.(pot);
    setShowAdd(false);
    setForm({ name: '', target: '', icon: '🎯', autoRule: 'none', autoAmount: '' });
  };

  const handleDepositWithdraw = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0 || !showDeposit) return;
    if (isWithdraw) {
      onWithdraw?.(showDeposit, amt);
    } else {
      onDeposit?.(showDeposit, amt);
    }
    setShowDeposit(null);
    setDepositAmount('');
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
            🏦 Savings Pots
          </h3>
          <p style={{ color: THEME.white40, fontSize: 13, margin: '4px 0 0' }}>
            Save for what matters most
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          background: THEME.accent, border: 'none', borderRadius: 12, padding: '8px 16px',
          color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>+ New Pot</button>
      </div>

      {/* Total summary */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,212,170,0.04))',
        borderRadius: 16, padding: 16, border: `1px solid rgba(0,212,170,0.15)`, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <p style={{ color: THEME.white40, fontSize: 11, fontWeight: 600, margin: 0 }}>TOTAL SAVED</p>
            <p style={{ color: THEME.accent, fontSize: 22, fontWeight: 800, margin: '2px 0 0' }}>
              {totalSaved.toLocaleString()} <span style={{ fontSize: 13 }}>{curr}</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: THEME.white40, fontSize: 11, fontWeight: 600, margin: 0 }}>TARGET</p>
            <p style={{ color: THEME.white50, fontSize: 16, fontWeight: 700, margin: '2px 0 0' }}>
              {totalTarget.toLocaleString()} {curr}
            </p>
          </div>
        </div>
        <div style={{ height: 6, background: THEME.white06, borderRadius: 3 }}>
          <div style={{
            height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${THEME.accent}, #4ECDC4)`,
            width: `${Math.min(100, overallProgress)}%`, transition: 'width 0.8s ease',
          }} />
        </div>
        <p style={{ color: THEME.white40, fontSize: 11, margin: '4px 0 0', textAlign: 'right' }}>{overallProgress}%</p>
      </div>

      {/* Pots grid */}
      {pots.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏦</div>
          <p style={{ color: THEME.white40, fontSize: 14, margin: 0 }}>
            Create your first savings pot!
          </p>
        </div>
      )}

      {pots.map(pot => {
        const pct = pot.target > 0 ? Math.round((pot.saved / pot.target) * 100) : 0;
        const isComplete = pct >= 100;
        return (
          <div key={pot.id} style={{
            background: THEME.white04, borderRadius: 16, padding: 16,
            border: `1px solid ${isComplete ? 'rgba(0,212,170,0.3)' : THEME.white06}`,
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: pot.color ? `${pot.color}22` : THEME.white04,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>{pot.icon}</div>
                <div>
                  <p style={{ color: THEME.white, fontSize: 15, fontWeight: 700, margin: 0 }}>
                    {pot.name} {isComplete && '✅'}
                  </p>
                  <p style={{ color: THEME.white40, fontSize: 11, margin: '2px 0 0' }}>
                    {pot.autoRule !== 'none' && `Auto: ${pot.autoRule} ${pot.autoAmount > 0 ? pot.autoAmount + '/cycle' : ''}`}
                    {pot.autoRule === 'none' && 'Manual savings'}
                  </p>
                </div>
              </div>
              <button onClick={() => onDeletePot?.(pot.id)} style={{
                background: 'none', border: 'none', color: THEME.white30, fontSize: 16, cursor: 'pointer',
              }}>×</button>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: THEME.accent, fontSize: 16, fontWeight: 800 }}>
                  {pot.saved.toLocaleString()} {curr}
                </span>
                <span style={{ color: THEME.white30, fontSize: 13 }}>
                  {pot.target.toLocaleString()} {curr}
                </span>
              </div>
              <div style={{ height: 6, background: THEME.white06, borderRadius: 3 }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: isComplete
                    ? `linear-gradient(90deg, ${THEME.accent}, #4ECDC4)`
                    : pot.color || THEME.accent,
                  width: `${Math.min(100, pct)}%`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <p style={{ color: THEME.white30, fontSize: 11, margin: '4px 0 0', textAlign: 'right' }}>{pct}%</p>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => { setShowDeposit(pot.id); setIsWithdraw(false); }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 10,
                  background: 'rgba(0,212,170,0.1)', border: `1px solid rgba(0,212,170,0.2)`,
                  color: THEME.accent, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>+ Deposit</button>
              <button onClick={() => { setShowDeposit(pot.id); setIsWithdraw(true); }}
                disabled={pot.saved <= 0}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 10,
                  background: THEME.white04, border: `1px solid ${THEME.white06}`,
                  color: THEME.white50, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  opacity: pot.saved <= 0 ? 0.3 : 1,
                }}>- Withdraw</button>
            </div>
          </div>
        );
      })}

      {/* Deposit/Withdraw modal */}
      {showDeposit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100,
        }} onClick={e => e.target === e.currentTarget && setShowDeposit(null)}>
          <div style={{
            background: THEME.darkBg, borderRadius: 24, padding: 24, width: '85%', maxWidth: 360,
          }}>
            <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>
              {isWithdraw ? '💸 Withdraw' : '💰 Deposit'}
            </h3>
            <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
              placeholder="Amount" style={{ ...inputStyle, marginBottom: 16, fontSize: 20, textAlign: 'center' }}
              autoFocus />

            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {[50, 100, 250, 500, 1000].map(v => (
                <button key={v} onClick={() => setDepositAmount(String(v))} style={{
                  padding: '6px 12px', borderRadius: 10,
                  background: depositAmount === String(v) ? THEME.accent : THEME.white04,
                  color: depositAmount === String(v) ? '#000' : THEME.white50,
                  border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>{v}</button>
              ))}
            </div>

            <button onClick={handleDepositWithdraw} style={{
              width: '100%', padding: 14, borderRadius: 14,
              background: isWithdraw ? THEME.orange : THEME.accent,
              border: 'none', color: '#000', fontWeight: 800, fontSize: 15, cursor: 'pointer',
            }}>{isWithdraw ? 'Withdraw' : 'Deposit'}</button>
          </div>
        </div>
      )}

      {/* Create pot modal */}
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
            <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>New Savings Pot</h3>

            {/* Icon picker */}
            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Icon</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {POT_ICONS.map(ic => (
                <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{
                  width: 36, height: 36, borderRadius: 10, border: form.icon === ic ? `2px solid ${THEME.accent}` : 'none',
                  background: form.icon === ic ? 'rgba(0,212,170,0.1)' : THEME.white04,
                  fontSize: 18, cursor: 'pointer',
                }}>{ic}</button>
              ))}
            </div>

            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Emergency Fund, Travel, New Phone" style={{ ...inputStyle, marginBottom: 12 }} />

            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Target Amount</label>
            <input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              placeholder="0.00" style={{ ...inputStyle, marginBottom: 12 }} />

            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Auto-Save Rule</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {AUTO_RULES.map(r => (
                <button key={r.id} onClick={() => setForm(f => ({ ...f, autoRule: r.id }))} style={{
                  padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: form.autoRule === r.id ? THEME.accent : THEME.white04,
                  color: form.autoRule === r.id ? '#000' : THEME.white50,
                  fontWeight: 600, fontSize: 11,
                }}>
                  {r.label}
                </button>
              ))}
            </div>

            {form.autoRule !== 'none' && form.autoRule !== 'roundup' && (
              <>
                <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Auto-Save Amount</label>
                <input type="number" value={form.autoAmount} onChange={e => setForm(f => ({ ...f, autoAmount: e.target.value }))}
                  placeholder="0.00" style={{ ...inputStyle, marginBottom: 12 }} />
              </>
            )}

            <button onClick={handleCreate} style={{
              width: '100%', padding: 14, borderRadius: 14, background: THEME.accent,
              border: 'none', color: '#000', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              marginTop: 8,
            }}>Create Pot</button>
          </div>
        </div>
      )}
    </div>
  );
}
