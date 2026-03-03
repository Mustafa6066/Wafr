import { Handshake, Bot, Lightbulb } from "lucide-react";
/**
 * Gameyya (جمعية) Optimizer — AI Cash Flow Slot Recommender
 * 
 * Digitizes the traditional MENA money circle (ROSCA).
 * AI analyzes user's cash flow and recommends which month/slot to take.
 * 
 * Unique to Egyptian/Arab culture — Money Fellows digitized it,
 * but nobody optimizes WHICH slot to take based on your spending patterns.
 */
import { useState, useMemo } from "react";
import { THEME } from "../constants.js";
import { useApp } from "../WafrApp.jsx";
import { useExpenseStore } from "../store/index.js";

// ─── Gameyya Setup Options ───
const COMMON_AMOUNTS = [
  { amount: 1000, label: "1,000" },
  { amount: 2000, label: "2,000" },
  { amount: 3000, label: "3,000" },
  { amount: 5000, label: "5,000" },
  { amount: 10000, label: "10,000" },
];

const MEMBER_OPTIONS = [5, 8, 10, 12, 15, 20];

export default function GameyyaOptimizer() {
  const { curr, profile } = useApp();
  const expenses = useExpenseStore(s => s.expenses);

  const [monthlyContribution, setMonthlyContribution] = useState(3000);
  const [memberCount, setMemberCount] = useState(10);
  const [showSetup, setShowSetup] = useState(true);
  const [gameyyaList, setGameyyaList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Payout analysis
  const totalPayout = monthlyContribution * memberCount;

  // Cash flow analysis
  const cashFlowAnalysis = useMemo(() => {
    const now = new Date();
    const monthlyData = {};
    
    // Analyze last 6 months
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyData[key] = { month: d.getMonth(), spending: 0, label: d.toLocaleDateString('en', { month: 'short' }) };
    }

    expenses.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyData[key]) {
        monthlyData[key].spending += e.amount;
      }
    });

    const months = Object.values(monthlyData).reverse();
    const avgSpend = months.reduce((s, m) => s + m.spending, 0) / Math.max(months.length, 1);

    // Find low-spending months (good to contribute, bad to receive)
    // Find high-spending months (good to receive)
    const ranked = months
      .filter(m => m.spending > 0)
      .sort((a, b) => b.spending - a.spending);

    return { months, avgSpend, ranked };
  }, [expenses]);

  // AI Recommendation
  const recommendation = useMemo(() => {
    const income = profile.income || 15000;
    const monthlyBurden = monthlyContribution / income;
    
    // Strategy: Take early if you need cash, take late for discipline
    let strategy = "early"; // default
    let reason = "";
    let riskLevel = "low";

    if (monthlyBurden > 0.3) {
      strategy = "first_3";
      reason = "Your contribution is over 30% of income. Take an early slot to minimize the financial strain of paying before receiving.";
      riskLevel = "high";
    } else if (monthlyBurden > 0.2) {
      strategy = "mid_early";
      reason = "Moderate burden — an early-to-middle slot gives you cash when you might need it most, while keeping contributions manageable.";
      riskLevel = "medium";
    } else if (monthlyBurden <= 0.1) {
      strategy = "late";
      reason = "Low burden — taking a late slot works like forced savings. You'll have contributed most of the money before receiving, making it a discipline tool.";
      riskLevel = "low";
    } else {
      strategy = "middle";
      reason = "Balanced position — a middle slot gives you flexibility. You'll have paid about half before receiving the full amount.";
      riskLevel = "low";
    }

    // Best slot number
    let bestSlot;
    if (strategy === "first_3") bestSlot = Math.min(3, memberCount);
    else if (strategy === "mid_early") bestSlot = Math.ceil(memberCount * 0.3);
    else if (strategy === "middle") bestSlot = Math.ceil(memberCount * 0.5);
    else if (strategy === "late") bestSlot = Math.ceil(memberCount * 0.8);
    else bestSlot = Math.ceil(memberCount * 0.4);

    // What you'll have paid before receiving
    const paidBefore = monthlyContribution * bestSlot;
    const netGain = totalPayout - paidBefore;

    return { strategy, reason, bestSlot, riskLevel, paidBefore, netGain, monthlyBurden };
  }, [monthlyContribution, memberCount, profile.income, totalPayout]);

  // Add new gameyya
  const addGameyya = (name) => {
    setGameyyaList(prev => [...prev, {
      id: crypto.randomUUID(),
      name: name || `Gameyya ${gameyyaList.length + 1}`,
      amount: monthlyContribution,
      members: memberCount,
      mySlot: recommendation.bestSlot,
      startDate: new Date().toISOString(),
      active: true,
    }]);
    setShowAddForm(false);
  };

  const slotColors = (slot) => {
    if (slot <= Math.ceil(memberCount * 0.3)) return { bg: "rgba(0,212,170,0.12)", border: "rgba(0,212,170,0.2)", text: THEME.accent };
    if (slot <= Math.ceil(memberCount * 0.6)) return { bg: "rgba(255,182,72,0.12)", border: "rgba(255,182,72,0.2)", text: THEME.orange };
    return { bg: "rgba(108,92,231,0.12)", border: "rgba(108,92,231,0.2)", text: "#6C5CE7" };
  };

  return (
    <div style={{ padding: "16px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}><Handshake size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
        <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 800, margin: "0 0 4px", fontFamily: THEME.font }}>
          Gameyya Optimizer
        </h2>
        <p style={{ color: THEME.white40, fontSize: 13, margin: 0, fontFamily: THEME.font }}>
          AI picks your best slot in the money circle
        </p>
      </div>

      {/* Setup */}
      <div style={{
        background: THEME.cardBg, borderRadius: 20, padding: "20px", marginBottom: 16,
        border: `1px solid ${THEME.cardBorder}`,
      }}>
        <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 700, margin: "0 0 10px", fontFamily: THEME.font }}>
          Monthly Contribution
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {COMMON_AMOUNTS.map(a => (
            <button key={a.amount} onClick={() => setMonthlyContribution(a.amount)} style={{
              background: monthlyContribution === a.amount ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : THEME.white06,
              color: monthlyContribution === a.amount ? THEME.bg : THEME.white50,
              border: `1px solid ${monthlyContribution === a.amount ? "transparent" : THEME.white10}`,
              borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: THEME.font,
            }}>
              {curr.symbol} {a.label}
            </button>
          ))}
        </div>

        <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 700, margin: "0 0 10px", fontFamily: THEME.font }}>
          Number of Members
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {MEMBER_OPTIONS.map(n => (
            <button key={n} onClick={() => setMemberCount(n)} style={{
              background: memberCount === n ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : THEME.white06,
              color: memberCount === n ? THEME.bg : THEME.white50,
              border: `1px solid ${memberCount === n ? "transparent" : THEME.white10}`,
              borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: THEME.font,
            }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Payout Info */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,184,148,0.05))",
        borderRadius: 18, padding: "20px", marginBottom: 16,
        border: "1px solid rgba(0,212,170,0.15)", textAlign: "center",
      }}>
        <p style={{ color: THEME.white50, fontSize: 11, fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 1 }}>
          Total Payout
        </p>
        <div style={{ fontSize: 34, fontWeight: 900, color: THEME.accent, fontFamily: THEME.font }}>
          {curr.symbol} {totalPayout.toLocaleString()}
        </div>
        <p style={{ color: THEME.white30, fontSize: 11, margin: "4px 0 0" }}>
          {memberCount} members × {curr.symbol} {monthlyContribution.toLocaleString()}/month
        </p>
      </div>

      {/* AI Recommendation */}
      <div style={{
        background: "linear-gradient(135deg, rgba(108,92,231,0.15), rgba(108,92,231,0.05))",
        borderRadius: 20, padding: "20px", marginBottom: 16,
        border: "1px solid rgba(108,92,231,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}><Bot size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></span>
          <h3 style={{ color: THEME.white, fontSize: 16, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
            AI Recommendation
          </h3>
        </div>

        <div style={{
          background: "rgba(0,0,0,0.2)", borderRadius: 14, padding: "16px", marginBottom: 12,
          textAlign: "center",
        }}>
          <p style={{ color: THEME.white40, fontSize: 11, margin: "0 0 6px", fontWeight: 600 }}>Take slot</p>
          <div style={{ fontSize: 42, fontWeight: 900, color: "#6C5CE7", fontFamily: THEME.font }}>
            #{recommendation.bestSlot}
          </div>
          <p style={{ color: THEME.white30, fontSize: 11, margin: "4px 0 0" }}>
            of {memberCount} slots
          </p>
        </div>

        <p style={{ color: THEME.white50, fontSize: 12, lineHeight: 1.6, margin: "0 0 12px", fontFamily: THEME.font }}>
          {recommendation.reason}
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "10px", textAlign: "center" }}>
            <p style={{ color: THEME.white30, fontSize: 10, margin: "0 0 2px" }}>You pay before</p>
            <p style={{ color: THEME.white, fontSize: 13, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
              {curr.symbol} {recommendation.paidBefore.toLocaleString()}
            </p>
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "10px", textAlign: "center" }}>
            <p style={{ color: THEME.white30, fontSize: 10, margin: "0 0 2px" }}>Net you receive</p>
            <p style={{ color: THEME.accent, fontSize: 13, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
              {curr.symbol} {recommendation.netGain.toLocaleString()}
            </p>
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "10px", textAlign: "center" }}>
            <p style={{ color: THEME.white30, fontSize: 10, margin: "0 0 2px" }}>Income burden</p>
            <p style={{
              color: recommendation.riskLevel === "high" ? THEME.red : recommendation.riskLevel === "medium" ? THEME.orange : THEME.accent,
              fontSize: 13, fontWeight: 700, margin: 0, fontFamily: THEME.font,
            }}>
              {Math.round(recommendation.monthlyBurden * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Slot Visualization */}
      <h3 style={{ color: THEME.white, fontSize: 14, fontWeight: 800, margin: "0 0 10px", fontFamily: THEME.font }}>
         Slot Map
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 16 }}>
        {Array.from({ length: memberCount }, (_, i) => {
          const slot = i + 1;
          const isRecommended = slot === recommendation.bestSlot;
          const colors = slotColors(slot);
          return (
            <div key={slot} style={{
              background: isRecommended ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : colors.bg,
              border: `1.5px solid ${isRecommended ? THEME.accent : colors.border}`,
              borderRadius: 10, padding: "10px 4px", textAlign: "center",
              position: "relative",
            }}>
              {isRecommended && (
                <div style={{
                  position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
                  background: THEME.accent, color: THEME.bg, fontSize: 7, fontWeight: 800,
                  padding: "1px 5px", borderRadius: 4, fontFamily: THEME.font,
                }}>BEST</div>
              )}
              <p style={{
                color: isRecommended ? THEME.bg : colors.text,
                fontSize: 14, fontWeight: 800, margin: 0, fontFamily: THEME.font,
              }}>#{slot}</p>
              <p style={{
                color: isRecommended ? "rgba(10,22,40,0.6)" : THEME.white20,
                fontSize: 8, margin: "2px 0 0", fontFamily: THEME.font,
              }}>{curr.symbol}{(monthlyContribution * slot / 1000).toFixed(0)}k paid</p>
            </div>
          );
        })}
      </div>

      {/* My Gameyyat (Active Circles) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <h3 style={{ color: THEME.white, fontSize: 14, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
           My Gameyyat
        </h3>
        <button onClick={() => addGameyya()} style={{
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
          color: THEME.bg, border: "none", borderRadius: 8, padding: "6px 12px",
          fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
        }}>+ Add</button>
      </div>

      {gameyyaList.length === 0 ? (
        <div style={{
          background: THEME.cardBg, borderRadius: 16, padding: "24px", textAlign: "center",
          border: `1px solid ${THEME.cardBorder}`,
        }}>
          <p style={{ color: THEME.white30, fontSize: 13, margin: 0, fontFamily: THEME.font }}>
            No active gameyyat yet. Use the optimizer above, then add one.
          </p>
        </div>
      ) : (
        gameyyaList.map(g => (
          <div key={g.id} style={{
            background: THEME.cardBg, borderRadius: 14, padding: "14px 16px", marginBottom: 8,
            border: `1px solid ${THEME.cardBorder}`, display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: "rgba(108,92,231,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
            }}><Handshake size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
            <div style={{ flex: 1 }}>
              <p style={{ color: THEME.white, fontSize: 13, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>{g.name}</p>
              <p style={{ color: THEME.white30, fontSize: 11, margin: "2px 0 0", fontFamily: THEME.font }}>
                {curr.symbol} {g.amount.toLocaleString()}/mo · Slot #{g.mySlot} of {g.members}
              </p>
            </div>
            <div style={{
              background: "rgba(0,212,170,0.1)", borderRadius: 8, padding: "4px 10px",
            }}>
              <span style={{ color: THEME.accent, fontSize: 11, fontWeight: 700, fontFamily: THEME.font }}>
                {curr.symbol} {(g.amount * g.members).toLocaleString()}
              </span>
            </div>
          </div>
        ))
      )}

      {/* Cultural Note */}
      <div style={{
        background: "rgba(255,182,72,0.06)", borderRadius: 14, padding: "12px 16px", marginTop: 16,
        border: "1px solid rgba(255,182,72,0.1)",
      }}>
        <p style={{ color: THEME.white40, fontSize: 11, lineHeight: 1.5, margin: 0, fontFamily: THEME.font }}><Lightbulb size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /> <strong style={{ color: THEME.white50 }}>Pro Tip:</strong> The earlier your slot, the more it's like getting a loan (you receive before fully paying). Later slots work like forced savings. Match your slot to your financial need.
        </p>
      </div>
    </div>
  );
}
