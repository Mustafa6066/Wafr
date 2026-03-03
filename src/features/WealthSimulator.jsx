import { Landmark, Star, TrendingUp, Home, Car, Coins, Sparkles } from "lucide-react";
import React from 'react';
/**
 * "What If" Wealth Simulator — Interactive Compound Growth Calculator
 * 
 * Slide the bar: "What if I save 3,000 EGP/month at 18% for 5 years?"
 * See the apartment down payment appear in real time.
 * 
 * Nobody in MENA has this — it's the "aha moment" that drives premium conversion.
 */
import { useState, useMemo } from "react";
import { THEME } from "../constants.js";
import { useApp } from "../WafrApp.jsx";

// ─── Investment Options common in MENA ───
const INVESTMENT_VEHICLES = [
  { id: "savings", name: "Bank Savings", nameAr: "حساب توفير", rate: 12, icon: React.createElement(Landmark, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), risk: "Low", riskAr: "منخفض" },
  { id: "certificate", name: "Bank Certificate", nameAr: "شهادة بنكية", rate: 18, icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), risk: "Low", riskAr: "منخفض" },
  { id: "gold", name: "Gold", nameAr: "ذهب", rate: 22, icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), risk: "Medium", riskAr: "متوسط" },
  { id: "stocks", name: "EGX Stocks", nameAr: "بورصة مصر", rate: 25, icon: React.createElement(TrendingUp, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), risk: "High", riskAr: "عالي" },
  { id: "realestate", name: "Real Estate", nameAr: "عقارات", rate: 30, icon: React.createElement(Home, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), risk: "Medium", riskAr: "متوسط" },
  { id: "mattress", name: "Under the Mattress", nameAr: "تحت المرتبة", rate: 0, icon: "", risk: " Inflation", riskAr: " تضخم" },
];

// ─── Milestones that resonate with MENA users ───
const MILESTONES_EGP = [
  { amount: 10000, name: "Emergency Buffer", icon: "" },
  { amount: 50000, name: "Hajj / Umrah Trip", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { amount: 100000, name: "New Car Down Payment", icon: React.createElement(Car, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { amount: 250000, name: "Wedding Fund", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { amount: 500000, name: "Apartment Down Payment", icon: React.createElement(Home, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { amount: 1000000, name: "Millionaire! ", icon: React.createElement(Coins, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { amount: 2500000, name: "Financial Freedom", icon: "" },
];

function SliderInput({ label, value, min, max, step, format, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: THEME.white50, fontSize: 12, fontWeight: 600, fontFamily: THEME.font }}>{label}</span>
        <span style={{ color: THEME.accent, fontSize: 14, fontWeight: 800, fontFamily: THEME.font }}>{format(value)}</span>
      </div>
      <div style={{ position: "relative", height: 32, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 6, borderRadius: 3, background: THEME.white06 }}>
          <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.accentDark})`, width: `${pct}%`, transition: "width 0.1s" }} />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: "absolute", width: "100%", height: 32, margin: 0, opacity: 0, cursor: "pointer", zIndex: 2,
          }}
        />
        <div style={{
          position: "absolute", left: `calc(${pct}% - 12px)`, width: 24, height: 24,
          borderRadius: 12, background: THEME.accent, boxShadow: `0 0 12px ${THEME.accentGlow}`,
          transition: "left 0.1s", pointerEvents: "none",
        }} />
      </div>
    </div>
  );
}

export default function WealthSimulator() {
  const { curr } = useApp();
  
  const [monthlyAmount, setMonthlyAmount] = useState(3000);
  const [years, setYears] = useState(5);
  const [selectedVehicle, setSelectedVehicle] = useState("certificate");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const vehicle = INVESTMENT_VEHICLES.find(v => v.id === selectedVehicle);
  const rate = vehicle?.rate || 0;

  // Compound interest calculation (monthly compounding)
  const projection = useMemo(() => {
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    
    let total = 0;
    let totalContributed = 0;
    const timeline = [];
    const yearlySnapshots = [];
    
    for (let m = 1; m <= months; m++) {
      totalContributed += monthlyAmount;
      total = (total + monthlyAmount) * (1 + monthlyRate);
      
      if (m % 12 === 0) {
        yearlySnapshots.push({
          year: m / 12,
          total: Math.round(total),
          contributed: totalContributed,
          interest: Math.round(total - totalContributed),
        });
      }
    }

    const totalInterest = Math.round(total - totalContributed);
    const multiply = totalContributed > 0 ? (total / totalContributed).toFixed(1) : 0;

    // Inflation-adjusted (Egypt ~25% avg 2024-2026, assume moderating to 15%)
    const inflationRate = 0.15;
    const realValue = total / Math.pow(1 + inflationRate, years);

    // Milestones reached
    const milestones = MILESTONES_EGP.filter(m => total >= m.amount);
    const nextMilestone = MILESTONES_EGP.find(m => total < m.amount);

    // Months to next milestone
    let monthsToNext = null;
    if (nextMilestone) {
      let sim = total;
      let mCount = 0;
      while (sim < nextMilestone.amount && mCount < 600) {
        sim = (sim + monthlyAmount) * (1 + monthlyRate);
        mCount++;
      }
      monthsToNext = mCount;
    }

    return {
      total: Math.round(total),
      contributed: totalContributed,
      interest: totalInterest,
      multiply,
      realValue: Math.round(realValue),
      yearlySnapshots,
      milestones,
      nextMilestone,
      monthsToNext,
    };
  }, [monthlyAmount, years, rate]);

  return (
    <div style={{ padding: "16px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}><Sparkles size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
        <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 800, margin: "0 0 4px", fontFamily: THEME.font }}>
          What If...?
        </h2>
        <p style={{ color: THEME.white40, fontSize: 13, margin: 0, fontFamily: THEME.font }}>
          See your future wealth in real time
        </p>
      </div>

      {/* Sliders */}
      <div style={{
        background: THEME.cardBg, borderRadius: 20, padding: "20px 18px",
        border: `1px solid ${THEME.cardBorder}`, marginBottom: 16,
      }}>
        <SliderInput
          label="Monthly Savings" value={monthlyAmount}
          min={500} max={50000} step={500}
          format={v => `${curr.symbol} ${v.toLocaleString()}`}
          onChange={setMonthlyAmount}
        />
        <SliderInput
          label="Time Period" value={years}
          min={1} max={30} step={1}
          format={v => `${v} year${v !== 1 ? "s" : ""}`}
          onChange={setYears}
        />
      </div>

      {/* Investment Vehicle Selector */}
      <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 700, margin: "0 0 8px", fontFamily: THEME.font }}>
        Where to invest?
      </p>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {INVESTMENT_VEHICLES.map(v => (
          <button key={v.id} onClick={() => setSelectedVehicle(v.id)} style={{
            background: selectedVehicle === v.id
              ? `linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,212,170,0.08))`
              : THEME.cardBg,
            border: `1px solid ${selectedVehicle === v.id ? "rgba(0,212,170,0.3)" : THEME.cardBorder}`,
            borderRadius: 12, padding: "10px 12px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            minWidth: 80, flexShrink: 0,
          }}>
            <span style={{ fontSize: 22 }}>{v.icon}</span>
            <span style={{
              color: selectedVehicle === v.id ? THEME.accent : THEME.white50,
              fontSize: 10, fontWeight: 700, fontFamily: THEME.font, textAlign: "center",
            }}>{v.name}</span>
            <span style={{
              color: selectedVehicle === v.id ? THEME.accent : THEME.white30,
              fontSize: 10, fontWeight: 800, fontFamily: THEME.font,
            }}>{v.rate}%</span>
          </button>
        ))}
      </div>

      {/* The Big Result */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,184,148,0.06))",
        borderRadius: 24, padding: "28px 20px", marginBottom: 16,
        border: "1px solid rgba(0,212,170,0.2)", textAlign: "center",
      }}>
        <p style={{ color: THEME.white50, fontSize: 11, fontWeight: 700, margin: "0 0 8px", letterSpacing: 1, textTransform: "uppercase" }}>
          In {years} year{years !== 1 ? "s" : ""} you'll have
        </p>
        <div style={{ fontSize: 38, fontWeight: 900, color: THEME.accent, fontFamily: THEME.font }}>
          {curr.symbol} {projection.total.toLocaleString()}
        </div>
        
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
          <div>
            <p style={{ color: THEME.white30, fontSize: 10, margin: "0 0 2px" }}>You put in</p>
            <p style={{ color: THEME.white50, fontSize: 13, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
              {curr.symbol} {projection.contributed.toLocaleString()}
            </p>
          </div>
          <div style={{ width: 1, background: THEME.white10 }} />
          <div>
            <p style={{ color: THEME.white30, fontSize: 10, margin: "0 0 2px" }}>Interest earned</p>
            <p style={{ color: THEME.accent, fontSize: 13, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
              +{curr.symbol} {projection.interest.toLocaleString()}
            </p>
          </div>
          <div style={{ width: 1, background: THEME.white10 }} />
          <div>
            <p style={{ color: THEME.white30, fontSize: 10, margin: "0 0 2px" }}>Multiplier</p>
            <p style={{ color: THEME.orange, fontSize: 13, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
              {projection.multiply}×
            </p>
          </div>
        </div>

        {rate === 0 && (
          <div style={{
            background: "rgba(255,107,107,0.1)", borderRadius: 10, padding: "8px 14px", marginTop: 12,
            border: "1px solid rgba(255,107,107,0.15)",
          }}>
            <p style={{ color: THEME.red, fontSize: 11, fontWeight: 600, margin: 0, fontFamily: THEME.font }}>
               With ~25% inflation, your {curr.symbol} {projection.total.toLocaleString()} will only be worth {curr.symbol} {projection.realValue.toLocaleString()} in today's money
            </p>
          </div>
        )}
      </div>

      {/* Milestones Reached */}
      {projection.milestones.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: THEME.white, fontSize: 14, fontWeight: 800, margin: "0 0 8px", fontFamily: THEME.font }}>
             Milestones you'll reach
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {projection.milestones.map((m, i) => (
              <div key={i} style={{
                background: "rgba(0,212,170,0.1)", borderRadius: 10, padding: "6px 12px",
                border: "1px solid rgba(0,212,170,0.15)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 14 }}>{m.icon}</span>
                <span style={{ color: THEME.accent, fontSize: 11, fontWeight: 700, fontFamily: THEME.font }}>
                  {m.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Milestone */}
      {projection.nextMilestone && (
        <div style={{
          background: THEME.cardBg, borderRadius: 16, padding: "16px",
          border: `1px solid ${THEME.cardBorder}`, marginBottom: 16,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 28 }}>{projection.nextMilestone.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: THEME.white, fontSize: 13, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
              Next: {projection.nextMilestone.name}
            </p>
            <p style={{ color: THEME.white40, fontSize: 11, margin: "2px 0 0", fontFamily: THEME.font }}>
              {curr.symbol} {projection.nextMilestone.amount.toLocaleString()} — {projection.monthsToNext ? `${projection.monthsToNext} more months` : "keep going!"}
            </p>
          </div>
          <div style={{
            background: "rgba(255,182,72,0.15)", borderRadius: 8, padding: "4px 10px",
          }}>
            <span style={{ color: THEME.orange, fontSize: 11, fontWeight: 700, fontFamily: THEME.font }}>
              {Math.round((projection.total / projection.nextMilestone.amount) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Year-by-Year Breakdown */}
      <button onClick={() => setShowBreakdown(!showBreakdown)} style={{
        width: "100%", background: THEME.cardBg, border: `1px solid ${THEME.cardBorder}`,
        borderRadius: 14, padding: "14px 16px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: showBreakdown ? 0 : 16,
        borderBottomLeftRadius: showBreakdown ? 0 : 14,
        borderBottomRightRadius: showBreakdown ? 0 : 14,
      }}>
        <span style={{ color: THEME.white50, fontSize: 13, fontWeight: 600, fontFamily: THEME.font }}>
           Year-by-Year Breakdown
        </span>
        <span style={{ color: THEME.white30, fontSize: 12, transform: showBreakdown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </button>

      {showBreakdown && (
        <div style={{
          background: THEME.cardBg, borderRadius: "0 0 14px 14px", padding: "12px 16px",
          border: `1px solid ${THEME.cardBorder}`, borderTop: "none", marginBottom: 16,
        }}>
          {projection.yearlySnapshots.map((snap, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0", borderBottom: i < projection.yearlySnapshots.length - 1 ? `1px solid ${THEME.white04}` : "none",
            }}>
              <span style={{ color: THEME.white40, fontSize: 12, fontWeight: 600, fontFamily: THEME.font }}>
                Year {snap.year}
              </span>
              <div style={{ textAlign: "right" }}>
                <span style={{ color: THEME.white, fontSize: 13, fontWeight: 700, fontFamily: THEME.font }}>
                  {curr.symbol} {snap.total.toLocaleString()}
                </span>
                <span style={{ color: THEME.accent, fontSize: 10, marginLeft: 8, fontFamily: THEME.font }}>
                  (+{curr.symbol} {snap.interest.toLocaleString()})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inflation Warning */}
      <div style={{
        background: "rgba(255,182,72,0.08)", borderRadius: 14, padding: "12px 16px",
        border: "1px solid rgba(255,182,72,0.12)",
      }}>
        <p style={{ color: THEME.orange, fontSize: 12, fontWeight: 600, margin: "0 0 4px", fontFamily: THEME.font }}>
           Real Value After Inflation
        </p>
        <p style={{ color: THEME.white40, fontSize: 11, margin: 0, fontFamily: THEME.font, lineHeight: 1.5 }}>
          With Egypt's average inflation (~15%), your {curr.symbol} {projection.total.toLocaleString()} will have the purchasing power of about <strong style={{ color: THEME.white50 }}>{curr.symbol} {projection.realValue.toLocaleString()}</strong> in today's money.
          {rate > 15 ? "  Your investment beats inflation!" : rate > 0 ? "  Consider higher-return options." : "  Money under the mattress loses value every day."}
        </p>
      </div>
    </div>
  );
}
