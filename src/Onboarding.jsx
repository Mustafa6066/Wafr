import { Bell, Smartphone, CheckCircle2, Coins, Star, Crown, Lock } from "lucide-react";
import React from 'react';
import { useState, useEffect } from "react";
import { useApp } from "./WafrApp.jsx";
import { COUNTRIES, CURRENCIES, CATEGORIES, INCOME_RANGES, SUBSCRIPTION_PLANS, THEME } from "./constants.js";
import { AnimatedNumber } from "./Shared.jsx";
import { PRIVACY_GUARANTEES } from "./services/privacyEngine.js";
import { useSettingsStore, usePrivacyStore } from "./store/index.js";

export default function Onboarding({ onComplete }) {
  const { profile, setProfile, subscribe } = useApp();
  const [step, setStep] = useState(0);

  const next = () => {
    if (step >= 5) onComplete();
    else setStep(s => s + 1);
  };

  const screens = [
    <WelcomeScreen key={0} onNext={next} />,
    <CountryScreen key={1} onNext={next} profile={profile} setProfile={setProfile} />,
    <SpendingQuizScreen key={2} onNext={next} profile={profile} setProfile={setProfile} />,
    <TrustScreen key={3} onNext={next} />,
    <ResultsScreen key={4} onNext={next} profile={profile} />,
    <PaywallScreen key={5} onNext={next} profile={profile} onSubscribe={subscribe} />,
  ];

  return screens[step] || null;
}

function WelcomeScreen({ onNext }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", padding: "40px 24px",
      background: `linear-gradient(160deg, ${THEME.bg} 0%, ${THEME.bgSecondary} 40%, ${THEME.bgTertiary} 70%, #1A3A5C 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400,
        borderRadius: "50%", background: `radial-gradient(circle, ${THEME.accentGlow} 0%, transparent 70%)`,
        animation: "float 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", left: "-15%", width: 350, height: 350,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(255,182,72,0.12) 0%, transparent 70%)",
        animation: "float 10s ease-in-out infinite reverse",
      }} />

      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)", textAlign: "center",
      }}>
        <div style={{
          width: 120, height: 120, borderRadius: 32, margin: "0 auto 32px",
          background: `linear-gradient(135deg, ${THEME.accent} 0%, ${THEME.accentDark} 50%, #009B7D 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 20px 60px ${THEME.accentGlow}, 0 0 0 1px rgba(0,212,170,0.1)`,
          fontSize: 56, position: "relative",
        }}><Coins size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /> <div style={{ position: "absolute", inset: -3, borderRadius: 35, border: "2px solid rgba(0,212,170,0.2)" }} />
        </div>

        <h1 style={{
          fontFamily: THEME.fontSerif, fontSize: 52, fontWeight: 800, color: THEME.white,
          margin: "0 0 8px", letterSpacing: "-1px", textShadow: `0 2px 20px ${THEME.accentGlow}`,
        }}>Wafr</h1>
        <p style={{ fontFamily: THEME.fontArabic, fontSize: 28, color: THEME.accent, margin: "0 0 24px", fontWeight: 600 }}>وفّر</p>
        <p style={{ fontSize: 18, color: THEME.white70, margin: "0 0 48px", lineHeight: 1.6, maxWidth: 320, fontFamily: THEME.font }}>
          Your AI-powered savings coach.<br />Built for the Middle East.
        </p>

        <button onClick={onNext} style={{
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
          color: THEME.bg, border: "none", borderRadius: 16, padding: "18px 64px",
          fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
          boxShadow: `0 8px 32px ${THEME.accentGlow}`, transition: "all 0.3s ease", letterSpacing: "0.5px",
        }}
        onMouseOver={e => e.target.style.transform = "translateY(-2px) scale(1.02)"}
        onMouseOut={e => e.target.style.transform = "translateY(0) scale(1)"}
        >Start Saving →</button>

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 24, fontFamily: THEME.font }}>
          Join 50,000+ savers across the Middle East
        </p>
      </div>
    </div>
  );
}

function CountryScreen({ onNext, profile, setProfile }) {
  const [selected, setSelected] = useState(profile.country || "");
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px",
      background: `linear-gradient(160deg, ${THEME.bg} 0%, ${THEME.bgSecondary} 40%, ${THEME.bgTertiary} 100%)`,
    }}>
      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease", maxWidth: 400, margin: "0 auto", width: "100%",
      }}>
        <ProgressBar step={1} total={3} />

        <h2 style={{ fontFamily: THEME.fontSerif, fontSize: 32, fontWeight: 800, color: THEME.white, margin: "0 0 12px", lineHeight: 1.2 }}>
          Where are you based? 
        </h2>
        <p style={{ color: THEME.white50, fontSize: 16, margin: "0 0 32px", fontFamily: THEME.font, lineHeight: 1.5 }}>
          We'll customize everything for your local market and currency.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {COUNTRIES.map((c, i) => (
            <button key={c.code}
              onClick={() => { setSelected(c.code); setProfile(d => ({ ...d, country: c.code, currency: c.currency, avgWaste: c.avgWaste })); }}
              style={{
                background: selected === c.code
                  ? `linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,184,148,0.1))`
                  : THEME.white04,
                border: selected === c.code ? `2px solid ${THEME.accent}` : `2px solid rgba(255,255,255,0.08)`,
                borderRadius: 16, padding: "18px 20px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "all 0.3s ease",
                opacity: show ? 1 : 0, transform: show ? "translateX(0)" : "translateX(-20px)",
                transitionDelay: `${i * 0.08}s`,
              }}>
              <span style={{ color: THEME.white, fontSize: 17, fontWeight: 600, fontFamily: THEME.font }}>
                {c.flag} {c.name}
              </span>
              <span style={{ color: THEME.white40, fontSize: 14, fontFamily: THEME.font }}>
                {CURRENCIES[c.currency].symbol}
              </span>
            </button>
          ))}
        </div>

        <ContinueButton onClick={onNext} disabled={!selected} />
      </div>
    </div>
  );
}

function SpendingQuizScreen({ onNext, profile, setProfile }) {
  const [income, setIncome] = useState(profile.income || "");
  const [topSpend, setTopSpend] = useState(profile.topSpend || []);
  const [name, setName] = useState(profile.name || "");
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const curr = CURRENCIES[profile.currency] || CURRENCIES.EGP;

  const toggleCategory = (id) => {
    setTopSpend(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 3);
      setProfile(d => ({ ...d, topSpend: next }));
      return next;
    });
  };

  const valid = income && topSpend.length > 0;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px",
      background: `linear-gradient(160deg, ${THEME.bg} 0%, ${THEME.bgSecondary} 40%, ${THEME.bgTertiary} 100%)`,
    }}>
      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease", maxWidth: 400, margin: "0 auto", width: "100%",
      }}>
        <ProgressBar step={2} total={3} />

        <h2 style={{ fontFamily: THEME.fontSerif, fontSize: 28, fontWeight: 800, color: THEME.white, margin: "0 0 12px" }}>
          Quick spending check 
        </h2>
        <p style={{ color: THEME.white50, fontSize: 15, margin: "0 0 24px", fontFamily: THEME.font }}>
          This helps our AI find your biggest saving opportunities.
        </p>

        {/* Name */}
        <p style={{ color: THEME.accent, fontSize: 14, fontWeight: 600, margin: "0 0 8px", fontFamily: THEME.font }}>
          What should we call you?
        </p>
        <input value={name} onChange={e => { setName(e.target.value); setProfile(d => ({ ...d, name: e.target.value })); }}
          placeholder="Your name" style={{
            width: "100%", background: THEME.white06, border: `1px solid ${THEME.white10}`,
            borderRadius: 14, padding: "14px 16px", color: THEME.white, fontSize: 15,
            outline: "none", marginBottom: 20, fontFamily: THEME.font,
          }} />

        {/* Income */}
        <p style={{ color: THEME.accent, fontSize: 14, fontWeight: 600, margin: "0 0 10px", fontFamily: THEME.font }}>
          Monthly income range ({curr.symbol})
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {INCOME_RANGES.map((r) => (
            <button key={r.value}
              onClick={() => { setIncome(r.value); setProfile(d => ({ ...d, income: r.value })); }}
              style={{
                background: income === r.value ? "rgba(0,212,170,0.2)" : THEME.white04,
                border: income === r.value ? `1.5px solid ${THEME.accent}` : `1.5px solid rgba(255,255,255,0.08)`,
                borderRadius: 12, padding: "10px 16px", cursor: "pointer",
                color: income === r.value ? THEME.accent : THEME.white50,
                fontSize: 14, fontWeight: 600, fontFamily: THEME.font, transition: "all 0.2s ease",
              }}>{r.label}</button>
          ))}
        </div>

        {/* Categories */}
        <p style={{ color: THEME.accent, fontSize: 14, fontWeight: 600, margin: "0 0 10px", fontFamily: THEME.font }}>
          Where does most of your money go? (Pick up to 3)
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
          {CATEGORIES.filter(c => c.id !== "savings").map((cat) => (
            <button key={cat.id} onClick={() => toggleCategory(cat.id)} style={{
              background: topSpend.includes(cat.id) ? "rgba(0,212,170,0.15)" : THEME.white04,
              border: topSpend.includes(cat.id) ? `1.5px solid ${THEME.accent}` : `1.5px solid rgba(255,255,255,0.08)`,
              borderRadius: 14, padding: "12px 10px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s ease",
            }}>
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              <span style={{
                color: topSpend.includes(cat.id) ? THEME.white : THEME.white50,
                fontSize: 12, fontWeight: 600, fontFamily: THEME.font,
              }}>{cat.name}</span>
            </button>
          ))}
        </div>

        <ContinueButton onClick={onNext} disabled={!valid} label="Analyze My Spending →" />
      </div>
    </div>
  );
}

function ResultsScreen({ onNext, profile }) {
  const [show, setShow] = useState(false);
  const curr = CURRENCIES[profile.currency] || CURRENCIES.EGP;
  const monthlyWaste = profile.avgWaste || 3000;
  const yearlyWaste = monthlyWaste * 12;

  useEffect(() => { setTimeout(() => setShow(true), 300); }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px",
      background: `linear-gradient(160deg, ${THEME.bg} 0%, ${THEME.bgSecondary} 40%, ${THEME.bgTertiary} 100%)`,
    }}>
      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        maxWidth: 400, margin: "0 auto", width: "100%", textAlign: "center",
      }}>
        <ProgressBar step={3} total={3} />
        <div style={{ fontSize: 48, marginBottom: 16 }}><Star size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
        <h2 style={{ fontFamily: THEME.fontSerif, fontSize: 26, fontWeight: 800, color: THEME.white, margin: "0 0 8px", lineHeight: 1.3 }}>
          {profile.name ? `${profile.name}, you` : "You"} could be wasting
        </h2>

        <div style={{
          fontFamily: THEME.font, fontSize: 56, fontWeight: 800, margin: "16px 0",
          background: `linear-gradient(135deg, ${THEME.red}, ${THEME.redLight})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-2px",
        }}>
          {curr.symbol} <AnimatedNumber value={monthlyWaste} duration={2000} />
        </div>
        <p style={{ color: THEME.white50, fontSize: 16, margin: "0 0 8px", fontFamily: THEME.font }}>
          per month on unnecessary spending
        </p>

        <div style={{
          background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)",
          borderRadius: 16, padding: "16px 20px", margin: "24px 0",
        }}>
          <p style={{ color: THEME.redLight, fontSize: 14, fontWeight: 600, margin: 0, fontFamily: THEME.font }}>
            That's <span style={{ fontSize: 20, fontWeight: 800 }}>{curr.symbol} {yearlyWaste.toLocaleString()}</span> per year!
          </p>
        </div>

        <div style={{
          background: "rgba(0,212,170,0.08)", border: `1px solid rgba(0,212,170,0.15)`,
          borderRadius: 16, padding: "20px", margin: "16px 0 32px", textAlign: "left",
        }}>
          <p style={{ color: THEME.accent, fontSize: 14, fontWeight: 700, margin: "0 0 12px", fontFamily: THEME.font }}>
            Instead, you could:
          </p>
          {[
            `Save ${curr.symbol} ${yearlyWaste.toLocaleString()} for a dream vacation `,
            `Build a ${curr.symbol} ${(yearlyWaste * 3).toLocaleString()} emergency fund in 3 years `,
            `Invest and grow your wealth with compound returns `,
          ].map((item, i) => (
            <p key={i} style={{ color: THEME.white70, fontSize: 14, margin: "8px 0", fontFamily: THEME.font, lineHeight: 1.5 }}>
              {item}
            </p>
          ))}
        </div>

        <ContinueButton onClick={onNext} label="Show Me How to Save →" />
      </div>
    </div>
  );
}

function PaywallScreen({ onNext, profile, onSubscribe }) {
  const [show, setShow] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const curr = CURRENCIES[profile.currency] || CURRENCIES.EGP;
  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px",
      background: `linear-gradient(160deg, ${THEME.bg} 0%, ${THEME.bgSecondary} 40%, ${THEME.bgTertiary} 100%)`,
    }}>
      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease", maxWidth: 400, margin: "0 auto", width: "100%",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
            background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
            boxShadow: `0 12px 40px ${THEME.accentGlow}`,
          }}><Crown size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
          <h2 style={{ fontFamily: THEME.fontSerif, fontSize: 28, fontWeight: 800, color: THEME.white, margin: "0 0 8px" }}>
            Unlock Your Savings Plan
          </h2>
          <p style={{ color: THEME.white50, fontSize: 15, margin: 0, fontFamily: THEME.font }}>
            Start your 3-day free trial
          </p>
        </div>

        {/* Free vs Pro comparison */}
        <div style={{
          background: THEME.cardBg, borderRadius: 20, padding: "20px", marginBottom: 20,
          border: `1px solid ${THEME.cardBorder}`,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center" }}>
            <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 600, margin: 0, fontFamily: THEME.font }}>Feature</p>
            <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 600, margin: 0, fontFamily: THEME.font, textAlign: "center", width: 50 }}>Free</p>
            <p style={{
              color: THEME.bg, fontSize: 12, fontWeight: 700, margin: 0, fontFamily: THEME.font,
              textAlign: "center", width: 50, background: `linear-gradient(135deg, #FFD700, #FFB648)`,
              borderRadius: 6, padding: "2px 0",
            }}>Pro</p>
            {[
              ["Expense Tracking", "15/mo", "∞"],
              ["AI Coach Messages", "3/day", "∞"],
              ["Savings Goals", "1", "∞"],
              ["Budget Planner", "—", "✓"],
              ["Advanced Insights", "—", "✓"],
              ["Recurring Tracker", "—", "✓"],
              ["Achievements", "Basic", "All"],
              ["Data Export", "—", "✓"],
            ].map(([feature, free, pro], i) => (
              <div key={i} style={{ display: "contents" }}>
                <p style={{ color: THEME.white70, fontSize: 13, margin: "6px 0", fontFamily: THEME.font }}>{feature}</p>
                <p style={{ color: THEME.white30, fontSize: 13, margin: "6px 0", fontFamily: THEME.font, textAlign: "center" }}>{free}</p>
                <p style={{ color: THEME.accent, fontSize: 13, fontWeight: 700, margin: "6px 0", fontFamily: THEME.font, textAlign: "center" }}>{pro}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {plans.map((plan) => (
            <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} style={{
              flex: 1, position: "relative",
              background: selectedPlan === plan.id ? `linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,184,148,0.08))` : THEME.white04,
              border: selectedPlan === plan.id ? `2px solid ${THEME.accent}` : `2px solid ${THEME.cardBorder}`,
              borderRadius: 16, padding: "16px 6px", cursor: "pointer", textAlign: "center",
              transition: "all 0.2s ease",
            }}>
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #FFB648, #FF9500)",
                  color: THEME.bg, fontSize: 8, fontWeight: 800, padding: "2px 8px",
                  borderRadius: 6, fontFamily: THEME.font, whiteSpace: "nowrap",
                }}>{plan.badge}</div>
              )}
              <p style={{ color: THEME.white50, fontSize: 11, margin: "0 0 4px", fontFamily: THEME.font, fontWeight: 600 }}>{plan.label}</p>
              <p style={{ color: THEME.white, fontSize: 18, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
                {curr.symbol} {plan.prices[profile.currency] || plan.prices.EGP}
              </p>
              <p style={{ color: THEME.white30, fontSize: 10, margin: 0, fontFamily: THEME.font }}>{plan.period}</p>
            </button>
          ))}
        </div>

        <button onClick={() => { onSubscribe(selectedPlan); onNext(); }} style={{
          width: "100%", background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
          color: THEME.bg, border: "none", borderRadius: 16, padding: "18px",
          fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
          boxShadow: `0 8px 32px ${THEME.accentGlow}`, marginBottom: 8,
        }}>Start Free Trial →</button>

        <button onClick={onNext} style={{
          width: "100%", background: "none", border: "none",
          color: THEME.white30, fontSize: 14, cursor: "pointer", fontFamily: THEME.font, padding: 8,
        }}>Continue with Free plan</button>

        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, textAlign: "center", fontFamily: THEME.font, marginTop: 4 }}>
          Cancel anytime. No charge during trial period.
        </p>
      </div>
    </div>
  );
}

// ─── TRUST SCREEN — Layer 2 Privacy Onboarding ───
function TrustScreen({ onNext }) {
  const [show, setShow] = useState(false);
  const [autoTrackEnabled, setAutoTrackEnabled] = useState(false);
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const markTrustScreenSeen = usePrivacyStore(s => s.markTrustScreenSeen);

  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const handleContinue = () => {
    updateSettings({
      autoTrackingEnabled: autoTrackEnabled,
      notificationListenerEnabled: autoTrackEnabled,
    });
    markTrustScreenSeen();
    onNext();
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px",
      background: `linear-gradient(160deg, ${THEME.bg} 0%, ${THEME.bgSecondary} 40%, ${THEME.bgTertiary} 100%)`,
    }}>
      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease", maxWidth: 400, margin: "0 auto", width: "100%",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, margin: "0 auto 16px",
            background: "linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,184,148,0.08))",
            border: "2px solid rgba(0,212,170,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40,
          }}><Lock size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
          <h2 style={{
            fontFamily: THEME.fontSerif, fontSize: 26, fontWeight: 800,
            color: THEME.white, margin: "0 0 8px", lineHeight: 1.3,
          }}>
            Your money data stays<br />on YOUR phone
          </h2>
          <p style={{ color: THEME.white50, fontSize: 14, margin: 0, fontFamily: THEME.font, lineHeight: 1.5 }}>
            Unlike other apps, we never read your OTPs<br />or upload your bank messages
          </p>
        </div>

        {/* Privacy Guarantee Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {PRIVACY_GUARANTEES.slice(0, 3).map((g, i) => (
            <div key={g.id} style={{
              background: THEME.cardBg, borderRadius: 16, padding: "16px 18px",
              border: `1px solid ${THEME.cardBorder}`,
              display: "flex", alignItems: "center", gap: 14,
              opacity: show ? 1 : 0, transform: show ? "translateX(0)" : "translateX(-20px)",
              transition: "all 0.5s ease", transitionDelay: `${0.2 + i * 0.1}s`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: g.id === 'on_device' ? "rgba(0,212,170,0.12)" :
                  g.id === 'no_otp' ? "rgba(255,107,107,0.12)" : "rgba(108,92,231,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>{g.icon}</div>
              <div>
                <p style={{
                  color: THEME.white, fontSize: 14, fontWeight: 700,
                  margin: "0 0 2px", fontFamily: THEME.font,
                }}>{g.title}</p>
                <p style={{
                  color: THEME.white40, fontSize: 11, margin: 0,
                  fontFamily: THEME.font, lineHeight: 1.4,
                }}>{g.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Auto-Track Toggle — OFF by default */}
        <div style={{
          background: autoTrackEnabled
            ? "linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,184,148,0.06))"
            : THEME.cardBg,
          borderRadius: 18, padding: "18px 20px", marginBottom: 16,
          border: `1px solid ${autoTrackEnabled ? "rgba(0,212,170,0.2)" : THEME.cardBorder}`,
          transition: "all 0.3s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <p style={{
                color: THEME.white, fontSize: 15, fontWeight: 700,
                margin: "0 0 4px", fontFamily: THEME.font,
              }}>
                 Auto-track from bank notifications
              </p>
              <p style={{
                color: THEME.white40, fontSize: 11, margin: 0,
                fontFamily: THEME.font, lineHeight: 1.4,
              }}>
                Reads only bank notifications — never SMS inbox or OTPs.
                You'll review each transaction before it's saved.
              </p>
            </div>
            <button onClick={() => setAutoTrackEnabled(!autoTrackEnabled)} style={{
              width: 52, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
              background: autoTrackEnabled ? THEME.accent : THEME.white10,
              position: "relative", transition: "background 0.3s ease", flexShrink: 0, marginLeft: 12,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11, background: THEME.white,
                position: "absolute", top: 3,
                left: autoTrackEnabled ? 27 : 3,
                transition: "left 0.3s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }} />
            </button>
          </div>
        </div>

        {/* How it works mini-diagram */}
        <div style={{
          background: THEME.white04, borderRadius: 14, padding: "14px 16px", marginBottom: 24,
        }}>
          <p style={{
            color: THEME.white40, fontSize: 10, fontWeight: 700,
            margin: "0 0 10px", fontFamily: THEME.font, textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>How auto-tracking works</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            {[
              { icon: React.createElement(Bell, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), label: "Bank\nNotification" },
              { icon: "→", label: "" },
              { icon: "", label: "OTP\nFilter" },
              { icon: "→", label: "" },
              { icon: React.createElement(Smartphone, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), label: "On-Device\nParse" },
              { icon: "→", label: "" },
              { icon: React.createElement(CheckCircle2, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), label: "You\nReview" },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <span style={{
                  fontSize: step.icon === "→" ? 14 : 18,
                  color: step.icon === "→" ? THEME.white20 : undefined,
                }}>{step.icon}</span>
                {step.label && (
                  <p style={{
                    color: THEME.white30, fontSize: 9, margin: "3px 0 0",
                    fontFamily: THEME.font, whiteSpace: "pre-line", lineHeight: 1.2,
                  }}>{step.label}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <ContinueButton onClick={handleContinue} label="Continue →" />

        <p style={{
          color: THEME.white20, fontSize: 10, textAlign: "center",
          margin: "12px 0 0", fontFamily: THEME.font,
        }}>
          You can change this anytime in Settings → Privacy
        </p>
      </div>
    </div>
  );
}

// ─── Reusable Onboarding Components ───
function ProgressBar({ step, total }) {
  return (
    <>
      <div style={{ marginBottom: 8, color: THEME.white40, fontSize: 14, fontFamily: THEME.font }}>Step {step} of {total}</div>
      <div style={{ height: 4, borderRadius: 2, background: THEME.white10, marginBottom: 32 }}>
        <div style={{ height: "100%", width: `${(step / total) * 100}%`, borderRadius: 2, background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.accentDark})`, transition: "width 0.5s ease" }} />
      </div>
    </>
  );
}

function ContinueButton({ onClick, disabled, label = "Continue →" }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", marginTop: 24,
      background: !disabled ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : THEME.white10,
      color: !disabled ? THEME.bg : THEME.white30,
      border: "none", borderRadius: 16, padding: "18px",
      fontSize: 17, fontWeight: 700, cursor: !disabled ? "pointer" : "default",
      fontFamily: THEME.font, transition: "all 0.3s ease",
      boxShadow: !disabled ? `0 8px 32px ${THEME.accentGlow}` : "none",
    }}>{label}</button>
  );
}
