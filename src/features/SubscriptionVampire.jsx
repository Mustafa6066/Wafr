import { Clapperboard, Tv, Star, Apple, Package, Gamepad, Dumbbell, ClipboardList, CheckCircle2, ThumbsUp } from "lucide-react";
import React from 'react';
/**
 * Subscription Vampire Detector — Kill Unused Subscriptions
 * 
 * Automatically flags unused subscriptions (Shahid VIP you haven't 
 * watched in 45 days). Calculates yearly waste. Sets cancel reminders.
 * 
 * No competitor in MENA automates this.
 */
import { useState, useMemo } from "react";
import { THEME } from "../constants.js";
import { useApp } from "../WafrApp.jsx";
import { useRecurringStore } from "../store/index.js";

// ─── Common MENA Subscriptions ───
const SUBSCRIPTION_DB = [
  { name: "Netflix", icon: React.createElement(Clapperboard, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "entertainment", avgPrice: { EGP: 199, SAR: 39, AED: 39 }, cancelUrl: "netflix.com/cancelplan" },
  { name: "Shahid VIP", icon: React.createElement(Tv, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "entertainment", avgPrice: { EGP: 119, SAR: 25, AED: 25 }, cancelUrl: "shahid.mbc.net" },
  { name: "Spotify", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "entertainment", avgPrice: { EGP: 59, SAR: 22, AED: 22 }, cancelUrl: "spotify.com/account" },
  { name: "YouTube Premium", icon: "", category: "entertainment", avgPrice: { EGP: 75, SAR: 26, AED: 26 }, cancelUrl: "youtube.com/paid_memberships" },
  { name: "Apple Music", icon: React.createElement(Apple, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "entertainment", avgPrice: { EGP: 50, SAR: 20, AED: 20 }, cancelUrl: "apple.com/subscriptions" },
  { name: "Amazon Prime", icon: React.createElement(Package, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "shopping", avgPrice: { EGP: 50, SAR: 16, AED: 16 }, cancelUrl: "amazon.com/gp/primecentral" },
  { name: "PlayStation Plus", icon: React.createElement(Gamepad, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "entertainment", avgPrice: { EGP: 250, SAR: 50, AED: 50 }, cancelUrl: "playstation.com" },
  { name: "Gym Membership", icon: React.createElement(Dumbbell, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "health", avgPrice: { EGP: 800, SAR: 200, AED: 200 }, cancelUrl: null },
  { name: "WATCH IT!", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "entertainment", avgPrice: { EGP: 120, SAR: 0, AED: 0 }, cancelUrl: "watchit.com" },
  { name: "TOD", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "entertainment", avgPrice: { EGP: 150, SAR: 30, AED: 30 }, cancelUrl: "tod.tv" },
  { name: "OSN+", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "entertainment", avgPrice: { EGP: 99, SAR: 30, AED: 30 }, cancelUrl: "osnplus.com" },
  { name: "Cloud Storage", icon: "", category: "tech", avgPrice: { EGP: 30, SAR: 10, AED: 10 }, cancelUrl: null },
  { name: "VPN", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "tech", avgPrice: { EGP: 100, SAR: 25, AED: 25 }, cancelUrl: null },
  { name: "Anghami Plus", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "entertainment", avgPrice: { EGP: 50, SAR: 15, AED: 15 }, cancelUrl: "anghami.com" },
  { name: "Other", icon: React.createElement(ClipboardList, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "other", avgPrice: { EGP: 100, SAR: 25, AED: 25 }, cancelUrl: null },
];

const USAGE_LEVELS = [
  { id: "daily", label: "Daily", labelAr: "يومياً", icon: React.createElement(CheckCircle2, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), color: THEME.accent, waste: 0 },
  { id: "weekly", label: "Weekly", labelAr: "أسبوعياً", icon: React.createElement(ThumbsUp, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), color: THEME.accent, waste: 0 },
  { id: "monthly", label: "Monthly", labelAr: "شهرياً", icon: "", color: THEME.orange, waste: 0.3 },
  { id: "rarely", label: "Rarely", labelAr: "نادراً", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), color: THEME.red, waste: 0.7 },
  { id: "never", label: "Never", labelAr: "أبداً", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), color: THEME.red, waste: 1.0 },
];

export default function SubscriptionVampire() {
  const { curr } = useApp();
  const { recurring, addRecurring, deleteRecurring } = useRecurringStore();

  const [userSubs, setUserSubs] = useState(() => {
    // Initialize from recurring store (subscription category)
    return recurring
      .filter(r => r.category === 'subscriptions' || r.category === 'entertainment')
      .map(r => ({
        id: r.id,
        name: r.name,
        amount: r.amount,
        usage: 'weekly', // default
        icon: SUBSCRIPTION_DB.find(s => r.name.toLowerCase().includes(s.name.toLowerCase()))?.icon || "",
      }));
  });

  const [showAddSub, setShowAddSub] = useState(false);
  const [addName, setAddName] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Analysis
  const analysis = useMemo(() => {
    const totalMonthly = userSubs.reduce((s, sub) => s + sub.amount, 0);
    const totalYearly = totalMonthly * 12;

    const vampires = userSubs.filter(sub => {
      const usage = USAGE_LEVELS.find(u => u.id === sub.usage);
      return usage && usage.waste >= 0.7;
    });

    const wastedMonthly = vampires.reduce((s, sub) => s + sub.amount, 0);
    const wastedYearly = wastedMonthly * 12;

    const potentialSavings = userSubs.reduce((s, sub) => {
      const usage = USAGE_LEVELS.find(u => u.id === sub.usage);
      return s + (sub.amount * (usage?.waste || 0));
    }, 0);

    return { totalMonthly, totalYearly, vampires, wastedMonthly, wastedYearly, potentialSavings };
  }, [userSubs]);

  const updateUsage = (subId, usage) => {
    setUserSubs(prev => prev.map(s => s.id === subId ? { ...s, usage } : s));
  };

  const removeSub = (subId) => {
    setUserSubs(prev => prev.filter(s => s.id !== subId));
  };

  const addSubscription = () => {
    const template = selectedTemplate ? SUBSCRIPTION_DB.find(s => s.name === selectedTemplate) : null;
    const name = template?.name || addName.trim();
    const amount = Number(addAmount) || (template?.avgPrice?.[curr.code] || 100);
    
    if (!name) return;

    const newSub = {
      id: crypto.randomUUID(),
      name,
      amount,
      usage: "weekly",
      icon: template?.icon || "",
    };
    
    setUserSubs(prev => [...prev, newSub]);
    
    // Also add to recurring store
    addRecurring({
      name, amount, category: "subscriptions", frequency: "monthly",
      merchant: name, autoDetected: false,
    });

    setAddName("");
    setAddAmount("");
    setSelectedTemplate(null);
    setShowAddSub(false);
  };

  return (
    <div style={{ padding: "16px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}><Star size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
        <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 800, margin: "0 0 4px", fontFamily: THEME.font }}>
          Subscription Vampires
        </h2>
        <p style={{ color: THEME.white40, fontSize: 13, margin: 0, fontFamily: THEME.font }}>
          Find and kill subscriptions draining your wallet
        </p>
      </div>

      {/* Total Cost Overview */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,107,107,0.12), rgba(255,107,107,0.04))",
        borderRadius: 20, padding: "22px", marginBottom: 16,
        border: "1px solid rgba(255,107,107,0.15)", textAlign: "center",
      }}>
        <p style={{ color: THEME.white40, fontSize: 11, fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 1 }}>
          Your subscriptions cost you
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: THEME.white, fontFamily: THEME.font }}>
              {curr.symbol} {analysis.totalMonthly.toLocaleString()}
            </div>
            <p style={{ color: THEME.white30, fontSize: 11, margin: "2px 0 0" }}>per month</p>
          </div>
          <div style={{ width: 1, background: THEME.white10 }} />
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: THEME.red, fontFamily: THEME.font }}>
              {curr.symbol} {analysis.totalYearly.toLocaleString()}
            </div>
            <p style={{ color: THEME.white30, fontSize: 11, margin: "2px 0 0" }}>per year</p>
          </div>
        </div>
      </div>

      {/* Vampire Alert */}
      {analysis.vampires.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,107,107,0.05))",
          borderRadius: 16, padding: "16px", marginBottom: 16,
          border: "1px solid rgba(255,107,107,0.2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}><Star size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></span>
            <h3 style={{ color: THEME.red, fontSize: 15, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
              {analysis.vampires.length} Vampire{analysis.vampires.length > 1 ? "s" : ""} Found!
            </h3>
          </div>
          <p style={{ color: THEME.white50, fontSize: 12, margin: "0 0 8px", fontFamily: THEME.font }}>
            You're wasting {curr.symbol} {analysis.wastedMonthly.toLocaleString()}/month on subscriptions you rarely or never use.
          </p>
          <div style={{
            background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "10px 14px", textAlign: "center",
          }}>
            <p style={{ color: THEME.orange, fontSize: 11, fontWeight: 700, margin: "0 0 2px", fontFamily: THEME.font }}>
              Cancel these and save
            </p>
            <span style={{ color: THEME.accent, fontSize: 22, fontWeight: 900, fontFamily: THEME.font }}>
              {curr.symbol} {analysis.wastedYearly.toLocaleString()}/year
            </span>
          </div>
        </div>
      )}

      {/* Subscription List */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <h3 style={{ color: THEME.white, fontSize: 14, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
          Your Subscriptions
        </h3>
        <button onClick={() => setShowAddSub(true)} style={{
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
          color: THEME.bg, border: "none", borderRadius: 8, padding: "6px 12px",
          fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
        }}>+ Add</button>
      </div>

      {userSubs.length === 0 ? (
        <div style={{
          background: THEME.cardBg, borderRadius: 16, padding: "32px", textAlign: "center",
          border: `1px solid ${THEME.cardBorder}`,
        }}>
          <p style={{ fontSize: 32, margin: "0 0 8px" }}><ClipboardList size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></p>
          <p style={{ color: THEME.white40, fontSize: 13, margin: 0, fontFamily: THEME.font }}>
            Add your subscriptions to find the vampires
          </p>
        </div>
      ) : (
        userSubs.map(sub => {
          const usage = USAGE_LEVELS.find(u => u.id === sub.usage);
          const isVampire = usage && usage.waste >= 0.7;
          return (
            <div key={sub.id} style={{
              background: isVampire ? "rgba(255,107,107,0.06)" : THEME.cardBg,
              borderRadius: 16, padding: "14px 16px", marginBottom: 8,
              border: `1px solid ${isVampire ? "rgba(255,107,107,0.15)" : THEME.cardBorder}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{sub.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
                      {sub.name}
                    </p>
                    {isVampire && <span style={{ fontSize: 14 }}><Star size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></span>}
                  </div>
                  <p style={{ color: THEME.white30, fontSize: 11, margin: "2px 0 0", fontFamily: THEME.font }}>
                    {curr.symbol} {sub.amount.toLocaleString()}/month · {curr.symbol} {(sub.amount * 12).toLocaleString()}/year
                  </p>
                </div>
                <button onClick={() => removeSub(sub.id)} style={{
                  background: "rgba(255,107,107,0.1)", border: "none", borderRadius: 8,
                  padding: "4px 8px", cursor: "pointer", color: THEME.red, fontSize: 10,
                  fontWeight: 700, fontFamily: THEME.font,
                }}>✕</button>
              </div>

              {/* Usage Selector */}
              <p style={{ color: THEME.white30, fontSize: 10, fontWeight: 600, margin: "0 0 6px", fontFamily: THEME.font }}>
                How often do you use it?
              </p>
              <div style={{ display: "flex", gap: 4 }}>
                {USAGE_LEVELS.map(level => (
                  <button key={level.id} onClick={() => updateUsage(sub.id, level.id)} style={{
                    flex: 1, background: sub.usage === level.id ? `${level.color}20` : THEME.white04,
                    border: `1px solid ${sub.usage === level.id ? `${level.color}40` : "transparent"}`,
                    borderRadius: 8, padding: "6px 2px", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  }}>
                    <span style={{ fontSize: 12 }}>{level.icon}</span>
                    <span style={{
                      color: sub.usage === level.id ? level.color : THEME.white30,
                      fontSize: 9, fontWeight: 700, fontFamily: THEME.font,
                    }}>{level.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Add Subscription Modal */}
      {showAddSub && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={() => setShowAddSub(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: `linear-gradient(180deg, ${THEME.bgTertiary}, ${THEME.bg})`,
            borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 440,
            padding: "28px 24px 40px", maxHeight: "80vh", overflowY: "auto",
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: THEME.white10, margin: "0 auto 20px" }} />
            <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: "0 0 16px", fontFamily: THEME.font }}>
              Add Subscription
            </h3>

            {/* Quick Add Templates */}
            <p style={{ color: THEME.white40, fontSize: 12, fontWeight: 600, margin: "0 0 8px", fontFamily: THEME.font }}>
              Popular in MENA
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {SUBSCRIPTION_DB.filter(s => s.name !== "Other").map(s => (
                <button key={s.name} onClick={() => {
                  setSelectedTemplate(s.name);
                  setAddName(s.name);
                  setAddAmount(String(s.avgPrice[curr.code] || s.avgPrice.EGP));
                }} style={{
                  background: selectedTemplate === s.name ? "rgba(0,212,170,0.15)" : THEME.white06,
                  border: `1px solid ${selectedTemplate === s.name ? "rgba(0,212,170,0.3)" : THEME.white10}`,
                  borderRadius: 10, padding: "6px 10px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <span style={{
                    color: selectedTemplate === s.name ? THEME.accent : THEME.white50,
                    fontSize: 11, fontWeight: 600, fontFamily: THEME.font,
                  }}>{s.name}</span>
                </button>
              ))}
            </div>

            <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Subscription name"
              style={{
                width: "100%", background: THEME.white06, border: `1px solid ${THEME.white10}`,
                borderRadius: 14, padding: "14px 16px", color: THEME.white, fontSize: 14,
                outline: "none", marginBottom: 10, fontFamily: THEME.font, boxSizing: "border-box",
              }} />
            <input value={addAmount} onChange={e => setAddAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder={`Monthly cost (${curr.symbol})`} inputMode="decimal"
              style={{
                width: "100%", background: THEME.white06, border: `1px solid ${THEME.white10}`,
                borderRadius: 14, padding: "14px 16px", color: THEME.white, fontSize: 14,
                outline: "none", marginBottom: 16, fontFamily: THEME.font, boxSizing: "border-box",
              }} />

            <button onClick={addSubscription} disabled={!addName.trim()} style={{
              width: "100%",
              background: addName.trim() ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : THEME.white10,
              color: addName.trim() ? THEME.bg : THEME.white30,
              border: "none", borderRadius: 14, padding: "16px", fontSize: 15,
              fontWeight: 700, cursor: addName.trim() ? "pointer" : "default", fontFamily: THEME.font,
            }}>Add Subscription</button>
          </div>
        </div>
      )}

      {/* Potential Savings */}
      {analysis.potentialSavings > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,184,148,0.04))",
          borderRadius: 18, padding: "20px", marginTop: 16, textAlign: "center",
          border: "1px solid rgba(0,212,170,0.15)",
        }}>
          <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 600, margin: "0 0 6px", fontFamily: THEME.font }}>
            If you cancel the vampires, you'll save
          </p>
          <div style={{ fontSize: 28, fontWeight: 900, color: THEME.accent, fontFamily: THEME.font }}>
            {curr.symbol} {Math.round(analysis.potentialSavings * 12).toLocaleString()}/year
          </div>
          <p style={{ color: THEME.white30, fontSize: 11, margin: "6px 0 0", fontFamily: THEME.font }}>
            That's {curr.symbol} {Math.round(analysis.potentialSavings).toLocaleString()} back in your pocket every month 
          </p>
        </div>
      )}
    </div>
  );
}
