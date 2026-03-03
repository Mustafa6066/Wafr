import { Smartphone, Star, Car, Dumbbell, Sparkles, GraduationCap, BookOpen, Gem, Home, Hammer, Lightbulb } from "lucide-react";
import React from 'react';
/**
 * Behavioral Shock Screen — The "Mirror" that Drives Conversion
 * 
 * Shows users their REAL lifestyle cost in shocking comparisons:
 * "Your 45 EGP/day coffee habit = a car payment in 2 years"
 * 
 * Psychology: Connor Burd's framework — emotional triggers convert 90% better.
 * No competitor in MENA does this.
 */
import { useState, useMemo } from "react";
import { THEME, CATEGORIES } from "../constants.js";
import { useExpenseStore } from "../store/index.js";
import { useApp } from "../WafrApp.jsx";

// ─── Shock Comparisons (localized for Egypt/MENA) ───
const SHOCK_ITEMS = {
  EGP: [
    { name: "iPhone 16 Pro", nameAr: "آيفون ١٦ برو", price: 85000, icon: React.createElement(Smartphone, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Hajj Trip", nameAr: "رحلة حج", price: 120000, icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "New Car Down Payment", nameAr: "مقدم سيارة", price: 250000, icon: React.createElement(Car, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Year of Gym", nameAr: "سنة جيم", price: 12000, icon: React.createElement(Dumbbell, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Family Vacation to Turkey", nameAr: "إجازة عائلية لتركيا", price: 80000, icon: "", emoji: React.createElement(Sparkles, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Master's Degree Semester", nameAr: "فصل دراسي ماجستير", price: 45000, icon: React.createElement(GraduationCap, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(BookOpen, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Gold Bracelet", nameAr: "غويشة دهب", price: 35000, icon: React.createElement(Gem, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Gem, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Home Renovation", nameAr: "تجديد شقة", price: 150000, icon: React.createElement(Home, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Hammer, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Emergency Fund (6 months)", nameAr: "صندوق طوارئ (٦ شهور)", price: 60000, icon: "", emoji: "" },
    { name: "Wedding Party", nameAr: "حفل زفاف", price: 200000, icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  ],
  SAR: [
    { name: "iPhone 16 Pro", nameAr: "آيفون ١٦ برو", price: 5800, icon: React.createElement(Smartphone, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Umrah Package", nameAr: "باقة عمرة", price: 3500, icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "New Car Down Payment", nameAr: "مقدم سيارة", price: 25000, icon: React.createElement(Car, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Family Vacation", nameAr: "إجازة عائلية", price: 15000, icon: "", emoji: React.createElement(Sparkles, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Year of Gym", nameAr: "سنة جيم", price: 5000, icon: React.createElement(Dumbbell, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  ],
  AED: [
    { name: "iPhone 16 Pro", nameAr: "آيفون ١٦ برو", price: 5500, icon: React.createElement(Smartphone, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Weekend in Maldives", nameAr: "ويكند المالديف", price: 12000, icon: "", emoji: React.createElement(Sparkles, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "New Car Down Payment", nameAr: "مقدم سيارة", price: 30000, icon: React.createElement(Car, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Family Vacation", nameAr: "إجازة عائلية", price: 18000, icon: "", emoji: React.createElement(Sparkles, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
    { name: "Year of Gym", nameAr: "سنة جيم", price: 6000, icon: React.createElement(Dumbbell, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), emoji: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  ],
};

// ─── Time-based projections ───
const TIME_PERIODS = [
  { months: 1, label: "1 Month", labelAr: "شهر" },
  { months: 3, label: "3 Months", labelAr: "٣ شهور" },
  { months: 6, label: "6 Months", labelAr: "٦ شهور" },
  { months: 12, label: "1 Year", labelAr: "سنة" },
  { months: 24, label: "2 Years", labelAr: "سنتين" },
  { months: 60, label: "5 Years", labelAr: "٥ سنين" },
];

export default function ShockScreen() {
  const { curr } = useApp();
  const expenses = useExpenseStore(s => s.expenses);
  const [selectedPeriod, setSelectedPeriod] = useState(12); // Default: 1 year
  const [animateShock, setAnimateShock] = useState(false);

  // Analyze spending by category
  const analysis = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 86400000);
    const recent = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
    
    if (recent.length === 0) return null;

    // Group by category
    const byCategory = {};
    recent.forEach(e => {
      if (!byCategory[e.category]) byCategory[e.category] = { total: 0, count: 0, items: [] };
      byCategory[e.category].total += e.amount;
      byCategory[e.category].count += 1;
      byCategory[e.category].items.push(e);
    });

    // Daily averages
    const totalDays = Math.max(1, Math.ceil((now - thirtyDaysAgo) / 86400000));
    const totalMonthly = recent.reduce((s, e) => s + e.amount, 0);
    const dailyAvg = totalMonthly / totalDays;

    // Top spending categories
    const ranked = Object.entries(byCategory)
      .map(([cat, data]) => ({
        category: cat,
        total: data.total,
        daily: data.total / totalDays,
        count: data.count,
        info: CATEGORIES.find(c => c.id === cat) || CATEGORIES[CATEGORIES.length - 1],
      }))
      .sort((a, b) => b.total - a.total);

    return { ranked, totalMonthly, dailyAvg, totalDays };
  }, [expenses]);

  // Calculate what the money could buy
  const shockComparisons = useMemo(() => {
    if (!analysis) return [];

    const items = SHOCK_ITEMS[curr.code] || SHOCK_ITEMS.EGP;
    const projectedTotal = analysis.totalMonthly * (selectedPeriod / 1);
    
    return items
      .map(item => ({
        ...item,
        canBuy: Math.floor(projectedTotal / item.price),
        percentage: Math.round((projectedTotal / item.price) * 100),
        surplus: projectedTotal - item.price,
      }))
      .filter(item => item.canBuy >= 1 || item.percentage >= 30)
      .slice(0, 6);
  }, [analysis, selectedPeriod, curr.code]);

  // Category shocks
  const categoryShocks = useMemo(() => {
    if (!analysis) return [];

    return analysis.ranked.slice(0, 5).map(cat => {
      const yearly = cat.total * 12;
      const items = SHOCK_ITEMS[curr.code] || SHOCK_ITEMS.EGP;
      const bestMatch = items.find(i => yearly >= i.price * 0.5) || items[items.length - 1];

      return {
        ...cat,
        yearly,
        projected: cat.total * (selectedPeriod / 1),
        shockItem: bestMatch,
        shockRatio: yearly / bestMatch.price,
      };
    });
  }, [analysis, selectedPeriod, curr.code]);

  const triggerShock = () => {
    setAnimateShock(true);
    setTimeout(() => setAnimateShock(false), 600);
  };

  // No data state
  if (!analysis) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}><Star size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
        <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 800, margin: "0 0 8px", fontFamily: THEME.font }}>
          Your Money Mirror
        </h2>
        <p style={{ color: THEME.white40, fontSize: 14, margin: "0 0 24px", fontFamily: THEME.font, lineHeight: 1.5 }}>
          Track at least a week of expenses to see the shocking truth about where your money goes.
        </p>
        <div style={{
          background: THEME.cardBg, borderRadius: 16, padding: 20, border: `1px solid ${THEME.cardBorder}`,
        }}>
          <p style={{ color: THEME.white50, fontSize: 13, margin: 0, fontFamily: THEME.font }}>
             The average Egyptian spends 45 EGP/day on coffee shops — that's a car down payment in 2 years.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8, transform: animateShock ? "scale(1.3)" : "scale(1)", transition: "transform 0.3s ease" }}><Star size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
        <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 800, margin: "0 0 4px", fontFamily: THEME.font }}>
          Your Money Mirror
        </h2>
        <p style={{ color: THEME.white40, fontSize: 13, margin: 0, fontFamily: THEME.font }}>
          The uncomfortable truth about your spending
        </p>
      </div>

      {/* The Big Number */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,107,107,0.05))",
        borderRadius: 24, padding: "24px 20px", marginBottom: 16,
        border: "1px solid rgba(255,107,107,0.2)", textAlign: "center",
        transform: animateShock ? "scale(1.02)" : "scale(1)", transition: "transform 0.3s ease",
      }}>
        <p style={{ color: THEME.white50, fontSize: 11, fontWeight: 700, margin: "0 0 8px", letterSpacing: 1, textTransform: "uppercase" }}>
          You spend every single day
        </p>
        <div style={{ fontSize: 42, fontWeight: 900, color: THEME.red, fontFamily: THEME.font }}>
          {curr.symbol} {Math.round(analysis.dailyAvg).toLocaleString()}
        </div>
        <p style={{ color: THEME.white30, fontSize: 12, margin: "4px 0 0", fontFamily: THEME.font }}>
          That's {curr.symbol} {Math.round(analysis.totalMonthly).toLocaleString()}/month
        </p>
      </div>

      {/* Time Period Selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {TIME_PERIODS.map(p => (
          <button key={p.months} onClick={() => { setSelectedPeriod(p.months); triggerShock(); }} style={{
            background: selectedPeriod === p.months ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : THEME.cardBg,
            color: selectedPeriod === p.months ? THEME.bg : THEME.white50,
            border: `1px solid ${selectedPeriod === p.months ? "transparent" : THEME.cardBorder}`,
            borderRadius: 10, padding: "8px 12px", fontSize: 11, fontWeight: 700,
            cursor: "pointer", fontFamily: THEME.font, whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Projected Total */}
      <div style={{
        background: THEME.cardBg, borderRadius: 18, padding: "18px", marginBottom: 16,
        border: `1px solid ${THEME.cardBorder}`, textAlign: "center",
      }}>
        <p style={{ color: THEME.white40, fontSize: 11, fontWeight: 600, margin: "0 0 6px" }}>
          In {TIME_PERIODS.find(p => p.months === selectedPeriod)?.label} you'll spend
        </p>
        <div style={{ fontSize: 32, fontWeight: 900, color: THEME.orange, fontFamily: THEME.font }}>
          {curr.symbol} {Math.round(analysis.totalMonthly * selectedPeriod).toLocaleString()}
        </div>
      </div>

      {/* What You COULD Buy Instead */}
      {shockComparisons.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}><Lightbulb size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></span>
            <h3 style={{ color: THEME.white, fontSize: 16, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
              What that money could buy
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {shockComparisons.map((item, i) => (
              <div key={i} style={{
                background: THEME.cardBg, borderRadius: 14, padding: "14px 16px",
                border: `1px solid ${THEME.cardBorder}`, display: "flex", alignItems: "center", gap: 12,
                transform: animateShock ? `translateX(${i % 2 === 0 ? 3 : -3}px)` : "none",
                transition: `transform 0.3s ease ${i * 0.05}s`,
              }}>
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
                    {item.canBuy}× {item.name}
                  </p>
                  <p style={{ color: THEME.white30, fontSize: 11, margin: "2px 0 0", fontFamily: THEME.font }}>
                    {curr.symbol} {item.price.toLocaleString()} each
                  </p>
                </div>
                <span style={{ fontSize: 22 }}>{item.emoji}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Category Breakdown — The Real Shockers */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}><Star size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></span>
        <h3 style={{ color: THEME.white, fontSize: 16, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
          Where it's going
        </h3>
      </div>
      
      {categoryShocks.map((cat, i) => (
        <div key={cat.category} style={{
          background: THEME.cardBg, borderRadius: 16, padding: "16px",
          border: `1px solid ${THEME.cardBorder}`, marginBottom: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{cat.info.icon}</span>
              <div>
                <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
                  {cat.info.name}
                </p>
                <p style={{ color: THEME.white30, fontSize: 11, margin: "1px 0 0", fontFamily: THEME.font }}>
                  {curr.symbol} {Math.round(cat.daily).toLocaleString()}/day
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: THEME.redLight, fontSize: 16, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
                {curr.symbol} {Math.round(cat.projected).toLocaleString()}
              </p>
              <p style={{ color: THEME.white20, fontSize: 10, margin: 0 }}>
                in {TIME_PERIODS.find(p => p.months === selectedPeriod)?.label}
              </p>
            </div>
          </div>

          {/* Comparison bar */}
          {cat.shockItem && cat.shockRatio >= 0.3 && (
            <div style={{
              background: "rgba(255,107,107,0.08)", borderRadius: 8, padding: "8px 12px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>{cat.shockItem.icon}</span>
              <p style={{ color: THEME.white40, fontSize: 11, margin: 0, fontFamily: THEME.font, flex: 1 }}>
                {cat.shockRatio >= 1
                  ? `= ${Math.floor(cat.shockRatio)}× ${cat.shockItem.name}/year`
                  : `= ${Math.round(cat.shockRatio * 100)}% of a ${cat.shockItem.name}/year`}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* CTA — The Conversion Hook */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,184,148,0.06))",
        borderRadius: 20, padding: "24px 20px", marginTop: 16, textAlign: "center",
        border: "1px solid rgba(0,212,170,0.15)",
      }}>
        <p style={{ color: THEME.white, fontSize: 18, fontWeight: 800, margin: "0 0 8px", fontFamily: THEME.font }}>
          What if you saved just 20%?
        </p>
        <div style={{ fontSize: 28, fontWeight: 900, color: THEME.accent, marginBottom: 8, fontFamily: THEME.font }}>
          {curr.symbol} {Math.round(analysis.totalMonthly * 0.2 * selectedPeriod).toLocaleString()}
        </div>
        <p style={{ color: THEME.white40, fontSize: 12, margin: "0 0 16px", fontFamily: THEME.font }}>
          saved in {TIME_PERIODS.find(p => p.months === selectedPeriod)?.label}
        </p>
        <div style={{
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
          color: THEME.bg, fontWeight: 800, fontSize: 14, padding: "12px 24px",
          borderRadius: 12, fontFamily: THEME.font, display: "inline-block",
        }}>
          Start Your Savings Plan →
        </div>
      </div>
    </div>
  );
}
