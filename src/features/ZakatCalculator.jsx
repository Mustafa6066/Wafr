// ─── Zakat Calculator — Islamic financial obligation calc ───
import { useState, useMemo } from 'react';
import { THEME } from '../constants.js';

const NISAB_GOLD_GRAMS = 85; // grams of gold
const NISAB_SILVER_GRAMS = 595; // grams of silver
const ZAKAT_RATE = 0.025; // 2.5%

// Approximate gold/silver prices per gram (user can override)
const DEFAULT_PRICES = {
  EGP: { gold: 3500, silver: 45 },
  SAR: { gold: 245, silver: 3 },
  AED: { gold: 230, silver: 2.8 },
  USD: { gold: 65, silver: 0.8 },
  KWD: { gold: 20, silver: 0.25 },
};

const ASSET_CATEGORIES = [
  { id: 'cash', label: 'Cash & Bank', icon: '💵', desc: 'All cash, savings accounts, checking accounts' },
  { id: 'gold', label: 'Gold & Silver', icon: '🥇', desc: 'Jewelry, bullion, coins (by weight or value)' },
  { id: 'stocks', label: 'Investments', icon: '📈', desc: 'Stocks, mutual funds, retirement accounts' },
  { id: 'business', label: 'Business Assets', icon: '🏪', desc: 'Inventory, receivables, business cash' },
  { id: 'property', label: 'Rent Income', icon: '🏠', desc: 'Rental income (not personal residence)' },
  { id: 'lending', label: 'Money Owed To You', icon: '🤝', desc: 'Loans to others expected to be repaid' },
];

const LIABILITY_CATEGORIES = [
  { id: 'debts', label: 'Debts Due Now', icon: '💳', desc: 'Current debts, bills, loans due within a year' },
  { id: 'expenses', label: 'Basic Living', icon: '🏡', desc: 'Essential living expenses for one year' },
];

export default function ZakatCalculator({ curr = 'EGP', expenses = [], goals = [] }) {
  const [assets, setAssets] = useState({});
  const [liabilities, setLiabilities] = useState({});
  const [goldPrice, setGoldPrice] = useState(DEFAULT_PRICES[curr]?.gold || 65);
  const [silverPrice, setSilverPrice] = useState(DEFAULT_PRICES[curr]?.silver || 0.8);
  const [nisabBasis, setNisabBasis] = useState('gold');
  const [showDetails, setShowDetails] = useState(false);

  const updateAsset = (id, value) => setAssets(a => ({ ...a, [id]: value }));
  const updateLiability = (id, value) => setLiabilities(l => ({ ...l, [id]: value }));

  // Auto-populate from app data
  const autoCash = useMemo(() => {
    // Sum up savings from goals
    return goals.reduce((s, g) => s + (g.saved || 0), 0);
  }, [goals]);

  const calc = useMemo(() => {
    const totalAssets = Object.entries(assets).reduce((s, [, v]) => s + (parseFloat(v) || 0), 0);
    const totalLiabilities = Object.entries(liabilities).reduce((s, [, v]) => s + (parseFloat(v) || 0), 0);
    const zakatableWealth = Math.max(0, totalAssets - totalLiabilities);

    const nisabGold = NISAB_GOLD_GRAMS * goldPrice;
    const nisabSilver = NISAB_SILVER_GRAMS * silverPrice;
    const nisab = nisabBasis === 'gold' ? nisabGold : nisabSilver;

    const isEligible = zakatableWealth >= nisab;
    const zakatDue = isEligible ? Math.round(zakatableWealth * ZAKAT_RATE) : 0;

    // Monthly equivalent
    const monthly = Math.round(zakatDue / 12);

    return { totalAssets, totalLiabilities, zakatableWealth, nisab, nisabGold, nisabSilver, isEligible, zakatDue, monthly };
  }, [assets, liabilities, goldPrice, silverPrice, nisabBasis]);

  const inputStyle = {
    background: THEME.white04, border: `1px solid ${THEME.white06}`, borderRadius: 12,
    padding: '10px 14px', color: THEME.white, fontSize: 14, fontFamily: THEME.font,
    width: '100%', boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{ padding: '16px 24px' }}>
      <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: '0 0 4px', fontFamily: THEME.font }}>
        🕌 Zakat Calculator
      </h3>
      <p style={{ color: THEME.white40, fontSize: 13, margin: '0 0 20px', fontFamily: THEME.font }}>
        Calculate your annual Zakat obligation
      </p>

      {/* Nisab info */}
      <div style={{
        background: THEME.white04, borderRadius: 16, padding: 14,
        border: `1px solid ${THEME.white06}`, marginBottom: 16,
      }}>
        <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 600, margin: '0 0 8px' }}>NISAB BASIS</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {['gold', 'silver'].map(b => (
            <button key={b} onClick={() => setNisabBasis(b)} style={{
              flex: 1, padding: '8px 0', borderRadius: 10, border: 'none',
              background: nisabBasis === b ? THEME.accent : THEME.white04,
              color: nisabBasis === b ? '#000' : THEME.white50,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>
              {b === 'gold' ? '🥇 Gold' : '🥈 Silver'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: THEME.white40, fontSize: 10 }}>Gold /{curr}/gram</label>
            <input type="number" value={goldPrice} onChange={e => setGoldPrice(parseFloat(e.target.value) || 0)}
              style={{ ...inputStyle, fontSize: 12, padding: '6px 10px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: THEME.white40, fontSize: 10 }}>Silver /{curr}/gram</label>
            <input type="number" value={silverPrice} onChange={e => setSilverPrice(parseFloat(e.target.value) || 0)}
              style={{ ...inputStyle, fontSize: 12, padding: '6px 10px' }} />
          </div>
        </div>
        <p style={{ color: THEME.white30, fontSize: 11, margin: '8px 0 0' }}>
          Current Nisab: {calc.nisab.toLocaleString()} {curr} ({nisabBasis === 'gold' ? `${NISAB_GOLD_GRAMS}g gold` : `${NISAB_SILVER_GRAMS}g silver`})
        </p>
      </div>

      {/* Assets */}
      <p style={{ color: THEME.accent, fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>💰 ASSETS</p>
      {ASSET_CATEGORIES.map(cat => (
        <div key={cat.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: THEME.white04, borderRadius: 12, padding: 10,
          marginBottom: 8, border: `1px solid ${THEME.white06}`,
        }}>
          <span style={{ fontSize: 20 }}>{cat.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: THEME.white, fontSize: 13, fontWeight: 600, margin: 0 }}>{cat.label}</p>
            {showDetails && <p style={{ color: THEME.white30, fontSize: 10, margin: '2px 0 0' }}>{cat.desc}</p>}
          </div>
          <input
            type="number"
            value={assets[cat.id] || ''}
            onChange={e => updateAsset(cat.id, e.target.value)}
            placeholder="0"
            style={{ ...inputStyle, width: 120, textAlign: 'right', flex: 'none' }}
          />
        </div>
      ))}

      {autoCash > 0 && !assets.cash && (
        <button onClick={() => updateAsset('cash', String(autoCash))} style={{
          background: 'rgba(0,212,170,0.08)', border: `1px dashed rgba(0,212,170,0.3)`,
          borderRadius: 10, padding: '8px 12px', cursor: 'pointer', width: '100%',
          marginBottom: 12,
        }}>
          <span style={{ color: THEME.accent, fontSize: 12 }}>
            💡 Auto-fill {autoCash.toLocaleString()} {curr} from savings goals?
          </span>
        </button>
      )}

      {/* Liabilities */}
      <p style={{ color: THEME.red, fontSize: 13, fontWeight: 700, margin: '16px 0 8px' }}>💳 DEDUCTIONS</p>
      {LIABILITY_CATEGORIES.map(cat => (
        <div key={cat.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: THEME.white04, borderRadius: 12, padding: 10,
          marginBottom: 8, border: `1px solid ${THEME.white06}`,
        }}>
          <span style={{ fontSize: 20 }}>{cat.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: THEME.white, fontSize: 13, fontWeight: 600, margin: 0 }}>{cat.label}</p>
            {showDetails && <p style={{ color: THEME.white30, fontSize: 10, margin: '2px 0 0' }}>{cat.desc}</p>}
          </div>
          <input
            type="number"
            value={liabilities[cat.id] || ''}
            onChange={e => updateLiability(cat.id, e.target.value)}
            placeholder="0"
            style={{ ...inputStyle, width: 120, textAlign: 'right', flex: 'none' }}
          />
        </div>
      ))}

      <button onClick={() => setShowDetails(!showDetails)} style={{
        background: 'none', border: 'none', color: THEME.white40, fontSize: 12,
        cursor: 'pointer', padding: '8px 0',
      }}>{showDetails ? 'Hide descriptions' : 'Show descriptions'}</button>

      {/* Result */}
      <div style={{
        background: calc.isEligible
          ? 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.05))'
          : THEME.white04,
        borderRadius: 20, padding: 20,
        border: `1px solid ${calc.isEligible ? 'rgba(0,212,170,0.25)' : THEME.white06}`,
        marginTop: 16, textAlign: 'center',
      }}>
        {calc.isEligible ? (
          <>
            <p style={{ fontSize: 14, color: THEME.accent, fontWeight: 700, margin: '0 0 4px' }}>
              🕌 YOUR ZAKAT DUE
            </p>
            <p style={{ fontSize: 36, color: THEME.accent, fontWeight: 800, margin: '0 0 4px' }}>
              {calc.zakatDue.toLocaleString()} <span style={{ fontSize: 16 }}>{curr}</span>
            </p>
            <p style={{ fontSize: 13, color: THEME.white40, margin: 0 }}>
              That's {calc.monthly.toLocaleString()} {curr}/month if distributed over 12 months
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 14, color: THEME.white50, fontWeight: 700, margin: '0 0 4px' }}>
              No Zakat Due
            </p>
            <p style={{ fontSize: 13, color: THEME.white40, margin: 0 }}>
              {calc.zakatableWealth > 0
                ? `Your zakatable wealth (${calc.zakatableWealth.toLocaleString()} ${curr}) is below the Nisab (${calc.nisab.toLocaleString()} ${curr})`
                : 'Enter your assets to calculate'}
            </p>
          </>
        )}
      </div>

      {/* Breakdown */}
      {(calc.totalAssets > 0 || calc.totalLiabilities > 0) && (
        <div style={{
          background: THEME.white04, borderRadius: 16, padding: 14,
          border: `1px solid ${THEME.white06}`, marginTop: 12,
        }}>
          <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 600, margin: '0 0 8px' }}>BREAKDOWN</p>
          {[
            { label: 'Total Assets', value: calc.totalAssets, color: THEME.accent },
            { label: 'Deductions', value: -calc.totalLiabilities, color: THEME.red },
            { label: 'Zakatable Wealth', value: calc.zakatableWealth, color: THEME.white },
            { label: 'Nisab Threshold', value: calc.nisab, color: THEME.white40 },
            { label: 'Zakat (2.5%)', value: calc.zakatDue, color: THEME.accent },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', padding: '6px 0',
              borderTop: i === 2 || i === 4 ? `1px solid ${THEME.white06}` : 'none',
            }}>
              <span style={{ color: THEME.white40, fontSize: 13 }}>{row.label}</span>
              <span style={{ color: row.color, fontSize: 13, fontWeight: i >= 2 ? 700 : 400 }}>
                {row.value.toLocaleString()} {curr}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p style={{ color: THEME.white20, fontSize: 10, margin: '16px 0 0', textAlign: 'center', lineHeight: 1.4 }}>
        This calculator is for guidance only. Please consult a qualified Islamic scholar
        for specific rulings on your financial situation.
      </p>
    </div>
  );
}
