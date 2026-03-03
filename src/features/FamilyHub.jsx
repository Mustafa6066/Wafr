import { Star } from "lucide-react";
import React from 'react';
// ─── Family Hub — family budget management with member roles ───
import { useState } from 'react';
import { THEME } from '../constants.js';
import { v4 as uuidv4 } from 'uuid';

const ROLES = [
  { id: 'parent', label: 'Parent', icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), color: THEME.accent },
  { id: 'spouse', label: 'Spouse', icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), color: '#FF6B9D' },
  { id: 'child', label: 'Child', icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), color: '#4ECDC4' },
  { id: 'other', label: 'Other', icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), color: '#FFA726' },
];

export default function FamilyHub({ family = [], onAddMember, onUpdateMember, onRemoveMember, curr = 'EGP' }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', role: 'child', allowance: '', frequency: 'monthly', limit: '', categories: [],
  });

  const totalAllowances = family.reduce((s, m) => {
    const monthMultiplier = { daily: 30, weekly: 4, monthly: 1, yearly: 1 / 12 };
    return s + (m.allowance || 0) * (monthMultiplier[m.frequency] || 1);
  }, 0);

  const handleSave = () => {
    if (!form.name.trim()) return;
    const member = {
      id: editId || uuidv4(),
      name: form.name.trim(),
      role: form.role,
      allowance: parseFloat(form.allowance) || 0,
      frequency: form.frequency,
      limit: parseFloat(form.limit) || 0,
      categories: form.categories,
      spent: editId ? (family.find(m => m.id === editId)?.spent || 0) : 0,
      createdAt: editId ? undefined : new Date().toISOString(),
    };
    if (editId) {
      onUpdateMember?.(member);
    } else {
      onAddMember?.(member);
    }
    setShowAdd(false);
    setEditId(null);
    setForm({ name: '', role: 'child', allowance: '', frequency: 'monthly', limit: '', categories: [] });
  };

  const openEdit = (m) => {
    setEditId(m.id);
    setForm({
      name: m.name, role: m.role, allowance: String(m.allowance || ''),
      frequency: m.frequency || 'monthly', limit: String(m.limit || ''),
      categories: m.categories || [],
    });
    setShowAdd(true);
  };

  const roleData = (id) => ROLES.find(r => r.id === id) || ROLES[3];

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
             Family Hub
          </h3>
          <p style={{ color: THEME.white40, fontSize: 13, margin: '4px 0 0' }}>
            Manage family budgets & allowances
          </p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ name: '', role: 'child', allowance: '', frequency: 'monthly', limit: '', categories: [] }); setShowAdd(true); }}
          style={{
            background: THEME.accent, border: 'none', borderRadius: 12, padding: '8px 16px',
            color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>+ Add Member</button>
      </div>

      {/* Summary */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,212,170,0.04))',
        borderRadius: 16, padding: 16, border: `1px solid rgba(0,212,170,0.15)`, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: THEME.white40, fontSize: 11, fontWeight: 600, margin: 0 }}>FAMILY MEMBERS</p>
            <p style={{ color: THEME.white, fontSize: 28, fontWeight: 800, margin: '2px 0 0' }}>{family.length}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: THEME.white40, fontSize: 11, fontWeight: 600, margin: 0 }}>MONTHLY ALLOWANCES</p>
            <p style={{ color: THEME.accent, fontSize: 20, fontWeight: 800, margin: '2px 0 0' }}>
              {Math.round(totalAllowances).toLocaleString()} <span style={{ fontSize: 12 }}>{curr}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Members list */}
      {family.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <p style={{ color: THEME.white40, fontSize: 14, margin: 0 }}>
            Add family members to manage budgets together
          </p>
        </div>
      )}

      {family.map(m => {
        const role = roleData(m.role);
        const allowMonth = m.allowance * ({ daily: 30, weekly: 4, monthly: 1, yearly: 1 / 12 }[m.frequency] || 1);
        const spendPct = allowMonth > 0 ? Math.round((m.spent / allowMonth) * 100) : 0;
        const isOver = spendPct > 100;

        return (
          <div key={m.id} style={{
            background: THEME.white04, borderRadius: 16, padding: 14,
            border: `1px solid ${isOver ? 'rgba(255,71,87,0.2)' : THEME.white06}`,
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${role.color}22`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{role.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ color: THEME.white, fontSize: 15, fontWeight: 700, margin: 0 }}>{m.name}</p>
                  <span style={{
                    background: `${role.color}22`, color: role.color, fontSize: 10,
                    fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                  }}>{role.label}</span>
                </div>
                <p style={{ color: THEME.white40, fontSize: 11, margin: '2px 0 0' }}>
                  {m.allowance > 0
                    ? `${m.allowance.toLocaleString()} ${curr}/${m.frequency}`
                    : 'No allowance set'}
                  {m.limit > 0 && ` · Limit: ${m.limit.toLocaleString()} ${curr}`}
                </p>
              </div>
              <button onClick={() => onRemoveMember?.(m.id)} style={{
                background: 'none', border: 'none', color: THEME.white30, fontSize: 16, cursor: 'pointer',
              }}>×</button>
            </div>

            {/* Spending bar */}
            {allowMonth > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: isOver ? THEME.red : THEME.white50, fontSize: 12 }}>
                    Spent {(m.spent || 0).toLocaleString()} of {Math.round(allowMonth).toLocaleString()} {curr}
                  </span>
                  <span style={{
                    color: isOver ? THEME.red : spendPct > 80 ? THEME.orange : THEME.accent,
                    fontSize: 12, fontWeight: 700,
                  }}>{spendPct}%</span>
                </div>
                <div style={{ height: 4, background: THEME.white06, borderRadius: 2 }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${Math.min(100, spendPct)}%`,
                    background: isOver ? THEME.red : spendPct > 80 ? THEME.orange : THEME.accent,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            )}

            {/* Restricted categories */}
            {m.categories?.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ color: THEME.white30, fontSize: 10 }}>Allowed: </span>
                {m.categories.map(c => (
                  <span key={c} style={{
                    background: THEME.white04, color: THEME.white40, fontSize: 10,
                    padding: '2px 6px', borderRadius: 4,
                  }}>{c}</span>
                ))}
              </div>
            )}

            <button onClick={() => openEdit(m)} style={{
              width: '100%', padding: '6px 0', borderRadius: 8,
              border: `1px solid ${THEME.white10}`, background: 'none',
              color: THEME.white50, fontSize: 12, cursor: 'pointer',
            }}>Edit</button>
          </div>
        );
      })}

      {/* Add/Edit Modal */}
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
            <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>
              {editId ? 'Edit Member' : 'Add Family Member'}
            </h3>

            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Ahmed, Sara" style={{ ...inputStyle, marginBottom: 12 }} />

            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Role</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setForm(f => ({ ...f, role: r.id }))} style={{
                  flex: 1, minWidth: 70, padding: '10px 8px', borderRadius: 12, border: 'none',
                  background: form.role === r.id ? r.color : THEME.white04,
                  color: form.role === r.id ? '#000' : THEME.white50,
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>{r.icon} {r.label}</button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div>
                <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Allowance</label>
                <input type="number" value={form.allowance} onChange={e => setForm(f => ({ ...f, allowance: e.target.value }))}
                  placeholder="0.00" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Frequency</label>
                <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                  style={{ ...inputStyle, appearance: 'auto' }}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <label style={{ color: THEME.white50, fontSize: 12, fontWeight: 600 }}>Spending Limit (optional)</label>
            <input type="number" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))}
              placeholder="Max per transaction" style={{ ...inputStyle, marginBottom: 16 }} />

            <button onClick={handleSave} style={{
              width: '100%', padding: 14, borderRadius: 14, background: THEME.accent,
              border: 'none', color: '#000', fontWeight: 800, fontSize: 15, cursor: 'pointer',
            }}>{editId ? 'Save Changes' : 'Add Member'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
