import { useState } from "react";
import { useApp } from "./WafrApp.jsx";
import { CURRENCIES, COUNTRIES, SUBSCRIPTION_PLANS, THEME } from "./constants.js";
import { ProBadge } from "./Shared.jsx";

export default function Settings() {
  const { profile, setProfile, curr, isPremium, subscription, cancelSubscription,
    settings, setSettings, exportData, resetAllData, showPaywall, showToast } = useApp();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  return (
    <div style={{ padding: "16px 24px" }}>
      <h2 style={{ color: THEME.white, fontSize: 20, fontWeight: 700, margin: "0 0 20px", fontFamily: THEME.font }}>
        Settings
      </h2>

      {/* Subscription Card */}
      <div style={{
        background: isPremium
          ? "linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,182,72,0.05))"
          : THEME.cardBg,
        borderRadius: 20, padding: "20px", marginBottom: 16,
        border: `1px solid ${isPremium ? "rgba(255,215,0,0.15)" : THEME.cardBorder}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 600, margin: "0 0 4px", fontFamily: THEME.font }}>
              Subscription
            </p>
            <p style={{ color: THEME.white, fontSize: 18, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
              {isPremium ? "Wafr Pro" : "Free Plan"} {isPremium && "👑"}
            </p>
          </div>
          <div style={{
            background: isPremium ? "linear-gradient(135deg, #FFD700, #FFB648)" : THEME.white10,
            color: isPremium ? THEME.bg : THEME.white50,
            fontSize: 11, fontWeight: 800, padding: "6px 14px", borderRadius: 10, fontFamily: THEME.font,
          }}>
            {isPremium ? "ACTIVE" : "FREE"}
          </div>
        </div>
        {isPremium ? (
          <>
            <p style={{ color: THEME.white40, fontSize: 12, margin: "0 0 4px", fontFamily: THEME.font }}>
              Plan: {SUBSCRIPTION_PLANS[subscription.plan]?.label || subscription.plan}
            </p>
            {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
              <p style={{ color: THEME.orange, fontSize: 12, fontWeight: 600, margin: "0 0 4px", fontFamily: THEME.font }}>
                Trial ends: {new Date(subscription.trialEnd).toLocaleDateString()}
              </p>
            )}
            <button onClick={cancelSubscription} style={{
              background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)",
              borderRadius: 10, padding: "8px 16px", color: THEME.red,
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: THEME.font, marginTop: 8,
            }}>Cancel Subscription</button>
          </>
        ) : (
          <button onClick={showPaywall} style={{
            background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
            border: "none", borderRadius: 12, padding: "10px 20px",
            color: THEME.bg, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
          }}>Upgrade to Pro</button>
        )}
      </div>

      {/* Profile */}
      <SettingsSection title="Profile">
        <SettingsRow label="Name" value={profile.name || "Not set"} />
        <SettingsRow label="Country" value={`${COUNTRIES.find(c => c.code === profile.country)?.flag || "🌍"} ${COUNTRIES.find(c => c.code === profile.country)?.name || profile.country}`} />
        <SettingsRow label="Currency"
          value={`${curr.symbol} ${curr.name}`}
          action="Change"
          onAction={() => setShowCurrencyPicker(true)}
        />
        <SettingsRow label="Monthly Income" value={`${curr.symbol} ${(profile.income || 0).toLocaleString()}`} />
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title="Preferences">
        <SettingsToggle
          label="Notifications"
          value={settings.notifications}
          onChange={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}
        />
      </SettingsSection>

      {/* Data */}
      <SettingsSection title="Data Management">
        <SettingsAction
          label="Export Data"
          desc={isPremium ? "Download all your data as JSON" : "Pro feature"}
          icon="📤"
          onClick={isPremium ? exportData : showPaywall}
          badge={!isPremium && "PRO"}
        />
        <SettingsAction
          label="Clear All Data"
          desc="Reset everything and start fresh"
          icon="🗑️"
          onClick={() => setShowResetConfirm(true)}
          danger
        />
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About">
        <SettingsRow label="Version" value="1.0.0" />
        <SettingsRow label="Built for" value="Middle East 🌍" />
      </SettingsSection>

      <p style={{ color: THEME.white30, fontSize: 11, textAlign: "center", margin: "24px 0", fontFamily: THEME.font }}>
        Made with 💚 for savers across the Middle East
      </p>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)", zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setShowResetConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: THEME.bgTertiary, borderRadius: 24, padding: "28px",
            maxWidth: 340, width: "90%", border: `1px solid ${THEME.cardBorder}`,
          }}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>⚠️</div>
            <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: "0 0 8px", fontFamily: THEME.font, textAlign: "center" }}>
              Clear All Data?
            </h3>
            <p style={{ color: THEME.white50, fontSize: 13, margin: "0 0 20px", fontFamily: THEME.font, textAlign: "center" }}>
              This will permanently delete all your expenses, goals, budgets, and progress. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowResetConfirm(false)} style={{
                flex: 1, background: THEME.white10, color: THEME.white50,
                border: "none", borderRadius: 14, padding: "14px",
                fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
              }}>Cancel</button>
              <button onClick={() => { resetAllData(); setShowResetConfirm(false); }} style={{
                flex: 1, background: `linear-gradient(135deg, ${THEME.red}, ${THEME.redLight})`,
                color: THEME.white, border: "none", borderRadius: 14, padding: "14px",
                fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
              }}>Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* Currency Picker */}
      {showCurrencyPicker && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)", zIndex: 300,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={() => setShowCurrencyPicker(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: `linear-gradient(180deg, ${THEME.bgTertiary}, ${THEME.bg})`,
            borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 440,
            padding: "28px 24px 40px", border: `1px solid ${THEME.cardBorder}`, borderBottom: "none",
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: THEME.white10, margin: "0 auto 20px" }} />
            <h3 style={{ color: THEME.white, fontSize: 18, fontWeight: 700, margin: "0 0 16px", fontFamily: THEME.font }}>
              Select Currency
            </h3>
            {Object.entries(CURRENCIES).map(([code, c]) => (
              <button key={code} onClick={() => {
                setProfile(p => ({ ...p, currency: code }));
                setShowCurrencyPicker(false);
                showToast(`Currency changed to ${c.name}`);
              }} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: profile.currency === code ? "rgba(0,212,170,0.1)" : "transparent",
                border: profile.currency === code ? `1.5px solid ${THEME.accent}` : `1.5px solid transparent`,
                borderRadius: 14, padding: "14px 16px", cursor: "pointer", marginBottom: 8,
              }}>
                <span style={{ color: THEME.white, fontSize: 15, fontWeight: 600, fontFamily: THEME.font }}>
                  {c.flag} {c.name}
                </span>
                <span style={{ color: THEME.white40, fontSize: 14, fontFamily: THEME.font }}>{c.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Setting Components ───
function SettingsSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ color: THEME.accent, fontSize: 12, fontWeight: 700, margin: "0 0 8px", fontFamily: THEME.font, textTransform: "uppercase" }}>
        {title}
      </p>
      <div style={{ background: THEME.cardBg, borderRadius: 16, border: `1px solid ${THEME.cardBorder}`, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ label, value, action, onAction }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 16px", borderBottom: `1px solid ${THEME.white04}`,
    }}>
      <span style={{ color: THEME.white70, fontSize: 14, fontFamily: THEME.font }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: THEME.white40, fontSize: 13, fontFamily: THEME.font }}>{value}</span>
        {action && (
          <button onClick={onAction} style={{
            background: "rgba(0,212,170,0.1)", border: "none", borderRadius: 6,
            padding: "3px 8px", color: THEME.accent, fontSize: 11, fontWeight: 600,
            cursor: "pointer", fontFamily: THEME.font,
          }}>{action}</button>
        )}
      </div>
    </div>
  );
}

function SettingsToggle({ label, value, onChange }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 16px", borderBottom: `1px solid ${THEME.white04}`,
    }}>
      <span style={{ color: THEME.white70, fontSize: 14, fontFamily: THEME.font }}>{label}</span>
      <button onClick={onChange} style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: value ? THEME.accent : THEME.white10,
        position: "relative", transition: "background 0.2s ease",
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: 9, background: THEME.white,
          position: "absolute", top: 3,
          left: value ? 23 : 3,
          transition: "left 0.2s ease",
        }} />
      </button>
    </div>
  );
}

function SettingsAction({ label, desc, icon, onClick, danger, badge }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12,
      padding: "14px 16px", borderBottom: `1px solid ${THEME.white04}`,
      background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{
          color: danger ? THEME.red : THEME.white70,
          fontSize: 14, margin: 0, fontFamily: THEME.font, fontWeight: 500,
        }}>
          {label} {badge && <ProBadge small />}
        </p>
        {desc && <p style={{ color: THEME.white30, fontSize: 11, margin: 0, fontFamily: THEME.font }}>{desc}</p>}
      </div>
      <span style={{ color: THEME.white30, fontSize: 16 }}>›</span>
    </button>
  );
}
