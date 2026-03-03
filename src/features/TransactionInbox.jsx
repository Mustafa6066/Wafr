// ─── Transaction Inbox — Auto-detected transactions awaiting approval ───
import { useState } from 'react';
import { THEME, CATEGORIES } from '../constants.js';
import { SectionHeader, EmptyState } from '../Shared.jsx';

export default function TransactionInbox({ transactions = [], onApprove, onReject, onEdit, curr }) {
  const [filter, setFilter] = useState('all'); // all | sms | ocr | bank

  const filtered = filter === 'all' ? transactions 
    : transactions.filter(t => t.source === filter);
  
  const pending = filtered.filter(t => t.status === 'pending');
  const approved = filtered.filter(t => t.status === 'approved');

  const getSourceBadge = (source) => {
    const badges = {
      sms: { label: '📱 SMS', bg: 'rgba(78,205,196,0.15)', color: '#4ECDC4' },
      ocr: { label: '📸 Receipt', bg: 'rgba(255,182,72,0.15)', color: '#FFB648' },
      bank: { label: '🏦 Bank', bg: 'rgba(133,193,233,0.15)', color: '#85C1E9' },
    };
    return badges[source] || badges.sms;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return THEME.accent;
    if (confidence >= 60) return THEME.orange;
    return THEME.red;
  };

  return (
    <div style={{ padding: '16px 24px' }}>
      <SectionHeader title="Transaction Inbox" />
      <p style={{ color: THEME.white40, fontSize: 13, margin: '-4px 0 16px', fontFamily: THEME.font }}>
        Auto-detected from SMS & receipts — review before adding
      </p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        {[
          { id: 'all', label: 'All', count: transactions.length },
          { id: 'sms', label: '📱 SMS', count: transactions.filter(t => t.source === 'sms').length },
          { id: 'ocr', label: '📸 Receipt', count: transactions.filter(t => t.source === 'ocr').length },
          { id: 'bank', label: '🏦 Bank', count: transactions.filter(t => t.source === 'bank').length },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            background: filter === f.id ? 'rgba(0,212,170,0.15)' : THEME.white04,
            border: filter === f.id ? `1px solid ${THEME.accent}` : `1px solid ${THEME.white06}`,
            borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
            color: filter === f.id ? THEME.accent : THEME.white40,
            fontSize: 12, fontWeight: 600, fontFamily: THEME.font, whiteSpace: 'nowrap',
          }}>
            {f.label} {f.count > 0 && <span style={{ opacity: 0.6 }}>({f.count})</span>}
          </button>
        ))}
      </div>

      {/* Approve All button */}
      {pending.length > 1 && (
        <button onClick={() => pending.forEach(t => onApprove?.(t))} style={{
          width: '100%', background: 'rgba(0,212,170,0.1)', border: `1px solid rgba(0,212,170,0.2)`,
          borderRadius: 14, padding: '12px', marginBottom: 16, cursor: 'pointer',
          color: THEME.accent, fontSize: 14, fontWeight: 700, fontFamily: THEME.font,
        }}>
          ✓ Approve All ({pending.length})
        </button>
      )}

      {/* Pending Transactions */}
      {pending.length === 0 && approved.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No pending transactions"
          subtitle="Transactions from SMS and receipts will appear here for review"
        />
      ) : (
        <>
          {pending.map((tx, i) => {
            const cat = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES[CATEGORIES.length - 1];
            const badge = getSourceBadge(tx.source);
            const date = new Date(tx.date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div key={tx.id || i} style={{
                background: THEME.white04, borderRadius: 18, padding: 16,
                border: `1px solid ${THEME.white06}`, marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: `${cat.color}20`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>{cat.icon}</div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: THEME.white, fontSize: 14, fontWeight: 600, margin: 0 }}>
                        {tx.merchant || tx.name || 'Unknown'}
                      </p>
                      <span style={{ color: THEME.redLight, fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                        -{curr?.symbol} {tx.amount?.toLocaleString()}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        background: badge.bg, color: badge.color, fontSize: 10,
                        fontWeight: 700, padding: '2px 8px', borderRadius: 6, fontFamily: THEME.font,
                      }}>{badge.label}</span>
                      <span style={{
                        background: `${getConfidenceColor(tx.confidence)}15`,
                        color: getConfidenceColor(tx.confidence),
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      }}>{tx.confidence}% match</span>
                      <span style={{ color: THEME.white30, fontSize: 10, padding: '2px 4px' }}>
                        {isToday ? 'Today' : date.toLocaleDateString()}
                      </span>
                    </div>

                    {tx.bank && (
                      <p style={{ color: THEME.white30, fontSize: 11, margin: '4px 0 0' }}>
                        via {tx.bank}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => onApprove?.(tx)} style={{
                    flex: 1, background: 'rgba(0,212,170,0.15)', border: `1px solid rgba(0,212,170,0.2)`,
                    borderRadius: 10, padding: '8px', cursor: 'pointer',
                    color: THEME.accent, fontSize: 12, fontWeight: 700, fontFamily: THEME.font,
                  }}>✓ Approve</button>
                  <button onClick={() => onEdit?.(tx)} style={{
                    flex: 1, background: THEME.white04, border: `1px solid ${THEME.white06}`,
                    borderRadius: 10, padding: '8px', cursor: 'pointer',
                    color: THEME.white50, fontSize: 12, fontWeight: 600, fontFamily: THEME.font,
                  }}>✏️ Edit</button>
                  <button onClick={() => onReject?.(tx)} style={{
                    background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.15)',
                    borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
                    color: THEME.red, fontSize: 12, fontWeight: 600, fontFamily: THEME.font,
                  }}>✕</button>
                </div>
              </div>
            );
          })}

          {/* Recently approved section */}
          {approved.length > 0 && (
            <>
              <p style={{ color: THEME.white30, fontSize: 12, fontWeight: 600, margin: '20px 0 10px', fontFamily: THEME.font }}>
                RECENTLY APPROVED ({approved.length})
              </p>
              {approved.slice(0, 5).map((tx, i) => {
                const cat = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES[CATEGORIES.length - 1];
                return (
                  <div key={tx.id || `a-${i}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: `1px solid ${THEME.white04}`, opacity: 0.6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{cat.icon}</span>
                      <span style={{ color: THEME.white50, fontSize: 13 }}>{tx.merchant || tx.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: THEME.white40, fontSize: 13 }}>
                        -{curr?.symbol} {tx.amount?.toLocaleString()}
                      </span>
                      <span style={{ color: THEME.accent, fontSize: 10 }}>✓</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
}
