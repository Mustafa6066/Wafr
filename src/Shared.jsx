import { Lock, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { THEME, SUBSCRIPTION_PLANS, CURRENCIES } from "./constants.js";

// ─── Premium Gate: shows lock overlay + upgrade prompt for free users ───
export function PremiumGate({ isPremium, onUpgrade, feature, children }) {
  if (isPremium) return children;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ filter: "blur(3px)", pointerEvents: "none", opacity: 0.5 }}>
        {children}
      </div>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", zIndex: 10,
        background: "rgba(10,22,40,0.6)", borderRadius: 20, backdropFilter: "blur(2px)",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}><Lock size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
        <p style={{ color: THEME.white, fontSize: 16, fontWeight: 700, margin: "0 0 4px", fontFamily: THEME.font, textAlign: "center" }}>
          {feature || "Premium Feature"}
        </p>
        <p style={{ color: THEME.white50, fontSize: 13, margin: "0 0 16px", fontFamily: THEME.font, textAlign: "center", padding: "0 20px" }}>
          Upgrade to Wafr Pro to unlock
        </p>
        <button onClick={onUpgrade} style={{
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
          color: THEME.bg, border: "none", borderRadius: 12, padding: "10px 28px",
          fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
          boxShadow: `0 4px 20px ${THEME.accentGlow}`,
        }}>
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}

// ─── Inline Premium Badge ───
export function ProBadge({ small }) {
  return (
    <span style={{
      background: "linear-gradient(135deg, #FFD700, #FFB648)",
      color: THEME.bg, fontSize: small ? 9 : 10, fontWeight: 800,
      padding: small ? "1px 5px" : "2px 8px", borderRadius: 6,
      fontFamily: THEME.font, letterSpacing: "0.5px",
      verticalAlign: "middle", marginLeft: 6,
    }}>PRO</span>
  );
}

// ─── Progress Ring (SVG circle) ───
export function ProgressRing({ progress, size = 80, strokeWidth = 6, color = THEME.accent, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", flexDirection: "column",
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Animated Counter ───
export function AnimatedNumber({ value, duration = 1500, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const startVal = display;
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(startVal + (value - startVal) * eased));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

// ─── Paywall Modal (can be triggered from anywhere) ───
export function PaywallModal({ show, onClose, onSubscribe, currency }) {
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [animate, setAnimate] = useState(false);
  const curr = CURRENCIES[currency] || CURRENCIES.EGP;

  useEffect(() => {
    if (show) setTimeout(() => setAnimate(true), 50);
    else setAnimate(false);
  }, [show]);

  if (!show) return null;

  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(12px)", zIndex: 1000,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: `linear-gradient(180deg, ${THEME.bgTertiary}, ${THEME.bg})`,
          borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 440,
          padding: "28px 24px 40px", maxHeight: "90vh", overflowY: "auto",
          border: `1px solid ${THEME.cardBorder}`, borderBottom: "none",
          transform: animate ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: THEME.white10, margin: "0 auto 20px" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
            background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
            boxShadow: `0 12px 40px ${THEME.accentGlow}`,
          }}><Crown size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
          <h2 style={{ fontFamily: THEME.fontSerif, fontSize: 26, fontWeight: 800, color: THEME.white, margin: "0 0 6px" }}>
            Upgrade to Wafr Pro
          </h2>
          <p style={{ color: THEME.white50, fontSize: 14, margin: 0, fontFamily: THEME.font }}>
            Unlock all features and start saving smarter
          </p>
        </div>

        {/* Features */}
        <div style={{
          background: THEME.cardBg, borderRadius: 18, padding: "18px", marginBottom: 20,
          border: `1px solid ${THEME.cardBorder}`,
        }}>
          {[
            ["", "Unlimited AI Coach", "Personalized savings advice anytime"],
            ["", "Unlimited Savings Goals", "Track multiple goals with templates"],
            ["", "Advanced Insights", "Trends, projections & peer comparison"],
            ["", "Smart Budget Planner", "Auto-budgets with category limits"],
            ["", "Recurring Expense Tracker", "Track subscriptions & bills"],
            ["", "All Achievements", "Badges, levels & rewards"],
            ["", "Data Export", "Export your data as JSON"],
          ].map(([icon, title, desc], i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "8px 0",
              borderBottom: i < 6 ? `1px solid ${THEME.white04}` : "none",
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <p style={{ color: THEME.white, fontSize: 14, fontWeight: 600, margin: 0, fontFamily: THEME.font }}>{title}</p>
                <p style={{ color: THEME.white40, fontSize: 11, margin: 0, fontFamily: THEME.font }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {plans.map((plan) => (
            <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} style={{
              flex: 1, position: "relative",
              background: selectedPlan === plan.id ? `linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,184,148,0.08))` : THEME.white04,
              border: selectedPlan === plan.id ? `2px solid ${THEME.accent}` : `2px solid ${THEME.cardBorder}`,
              borderRadius: 16, padding: "16px 8px", cursor: "pointer", textAlign: "center",
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
              <p style={{ color: THEME.white, fontSize: 20, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
                {curr.symbol} {plan.prices[currency] || plan.prices.EGP}
              </p>
              <p style={{ color: THEME.white30, fontSize: 10, margin: 0, fontFamily: THEME.font }}>{plan.period}</p>
            </button>
          ))}
        </div>

        <button onClick={() => onSubscribe(selectedPlan)} style={{
          width: "100%", background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
          color: THEME.bg, border: "none", borderRadius: 16, padding: "16px",
          fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
          boxShadow: `0 8px 32px ${THEME.accentGlow}`, marginBottom: 8,
        }}>
          Start 3-Day Free Trial
        </button>

        <button onClick={onClose} style={{
          width: "100%", background: "none", border: "none",
          color: THEME.white30, fontSize: 13, cursor: "pointer", fontFamily: THEME.font, padding: 8,
        }}>
          Maybe later
        </button>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, textAlign: "center", fontFamily: THEME.font, marginTop: 4 }}>
          Cancel anytime. No charge during trial period.
        </p>
      </div>
    </div>
  );
}

// ─── Toast Notification ───
export function Toast({ message, show, type = "success" }) {
  if (!show) return null;
  const colors = { success: THEME.accent, error: THEME.red, warning: THEME.orange, info: "#85C1E9" };
  return (
    <div style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      background: colors[type] || THEME.accent, color: THEME.bg,
      padding: "12px 24px", borderRadius: 14, fontFamily: THEME.font,
      fontSize: 14, fontWeight: 700, zIndex: 2000,
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      animation: "slideDown 0.3s ease",
    }}>
      {message}
    </div>
  );
}

// ─── Empty State ───
export function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <p style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: "0 0 8px", fontFamily: THEME.font }}>{title}</p>
      <p style={{ color: THEME.white50, fontSize: 14, margin: "0 0 20px", fontFamily: THEME.font }}>{subtitle}</p>
      {action && (
        <button onClick={onAction} style={{
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
          color: THEME.bg, border: "none", borderRadius: 12, padding: "12px 28px",
          fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
        }}>{action}</button>
      )}
    </div>
  );
}

// ─── Section Header ───
export function SectionHeader({ title, action, onAction, proBadge }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <p style={{ color: THEME.white, fontSize: 16, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
        {title}{proBadge && <ProBadge />}
      </p>
      {action && (
        <button onClick={onAction} style={{
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
          border: "none", borderRadius: 10, padding: "6px 14px",
          color: THEME.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
        }}>{action}</button>
      )}
    </div>
  );
}

// ─── Global Styles (injected once) ───
export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;600;700&display=swap');
      * { box-sizing: border-box; margin: 0; }
      body { margin: 0; background: ${THEME.bg}; }
      ::-webkit-scrollbar { width: 0; }
      input::placeholder { color: ${THEME.white30}; }
      @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(15px, -20px) scale(1.05); }
        66% { transform: translate(-10px, 10px) scale(0.95); }
      }
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `}</style>
  );
}
