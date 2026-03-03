import { Target } from "lucide-react";
import { useState } from "react";
import { useApp } from "./WafrApp.jsx";
import { GOAL_TEMPLATES, FREE_LIMITS, THEME } from "./constants.js";
import { ProgressRing, PremiumGate, SectionHeader, EmptyState } from "./Shared.jsx";

export default function SavingsGoals() {
  const { curr, isPremium, goals, addGoal, addToGoal, deleteGoal, showPaywall } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [showDeposit, setShowDeposit] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  const handleDeposit = (goalId) => {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    addToGoal(goalId, Number(depositAmount));
    setDepositAmount("");
    setShowDeposit(null);
  };

  return (
    <div style={{ padding: "16px 24px" }}>
      <SectionHeader
        title="Savings Goals"
        action="+ New Goal"
        onAction={() => {
          if (!isPremium && goals.length >= FREE_LIMITS.maxGoals) { showPaywall(); return; }
          setShowCreate(true);
        }}
      />

      {/* Overview Card */}
      {goals.length > 0 && (
        <div style={{
          background: `linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,184,148,0.06))`,
          borderRadius: 20, padding: "20px", marginBottom: 16,
          border: `1px solid rgba(0,212,170,0.15)`, display: "flex", alignItems: "center", gap: 16,
        }}>
          <ProgressRing progress={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0} size={72} strokeWidth={5}>
            <span style={{ color: THEME.accent, fontSize: 14, fontWeight: 800, fontFamily: THEME.font }}>
              {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
            </span>
          </ProgressRing>
          <div>
            <p style={{ color: THEME.white50, fontSize: 12, margin: "0 0 4px", fontFamily: THEME.font }}>Total Saved</p>
            <p style={{ color: THEME.white, fontSize: 24, fontWeight: 800, margin: "0 0 2px", fontFamily: THEME.font }}>
              {curr.symbol} {totalSaved.toLocaleString()}
            </p>
            <p style={{ color: THEME.white40, fontSize: 12, margin: 0, fontFamily: THEME.font }}>
              of {curr.symbol} {totalTarget.toLocaleString()} target
            </p>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <EmptyState
          icon={<Target size="1em" style={{display:"inline-block", verticalAlign:"middle"}} />}
          title="No savings goals yet"
          subtitle="Set a target and watch your savings grow!"
          action="Create Your First Goal"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        goals.map((goal) => {
          const progress = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
          const isComplete = progress >= 100;
          return (
            <div key={goal.id} style={{
              background: THEME.cardBg, borderRadius: 20, padding: "18px", marginBottom: 12,
              border: `1px solid ${isComplete ? "rgba(0,212,170,0.3)" : THEME.cardBorder}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: `${goal.color || THEME.accent}20`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                  }}>{goal.icon || ""}</div>
                  <div>
                    <p style={{ color: THEME.white, fontSize: 15, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
                      {goal.name} {isComplete && ""}
                    </p>
                    <p style={{ color: THEME.white40, fontSize: 12, margin: 0, fontFamily: THEME.font }}>
                      {goal.deadline ? `Due: ${new Date(goal.deadline).toLocaleDateString()}` : "No deadline"}
                    </p>
                  </div>
                </div>
                <button onClick={() => deleteGoal(goal.id)} style={{
                  background: "none", border: "none", color: THEME.white30, fontSize: 16,
                  cursor: "pointer", padding: 4,
                }}>×</button>
              </div>

              {/* Progress */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 10, borderRadius: 5, background: THEME.white10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 5, transition: "width 0.8s ease",
                    width: `${Math.min(progress, 100)}%`,
                    background: isComplete
                      ? `linear-gradient(90deg, ${THEME.accent}, ${THEME.accentDark})`
                      : progress > 50
                        ? `linear-gradient(90deg, ${THEME.accent}, ${THEME.accentDark})`
                        : `linear-gradient(90deg, ${THEME.orange}, ${THEME.orangeLight})`,
                  }} />
                </div>
                <span style={{ color: THEME.accent, fontSize: 14, fontWeight: 800, fontFamily: THEME.font, minWidth: 40, textAlign: "right" }}>
                  {progress}%
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ color: THEME.white50, fontSize: 12, margin: 0, fontFamily: THEME.font }}>
                  {curr.symbol} {goal.saved.toLocaleString()} / {curr.symbol} {goal.target.toLocaleString()}
                </p>
                {!isComplete && (
                  showDeposit === goal.id ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <input value={depositAmount} onChange={e => setDepositAmount(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Amount" inputMode="numeric"
                        style={{
                          width: 80, background: THEME.white06, border: `1px solid ${THEME.white10}`,
                          borderRadius: 8, padding: "6px 8px", color: THEME.white, fontSize: 12,
                          outline: "none", fontFamily: THEME.font,
                        }} />
                      <button onClick={() => handleDeposit(goal.id)} style={{
                        background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                        border: "none", borderRadius: 8, padding: "6px 12px",
                        color: THEME.bg, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
                      }}>Save</button>
                      <button onClick={() => { setShowDeposit(null); setDepositAmount(""); }} style={{
                        background: THEME.white10, border: "none", borderRadius: 8, padding: "6px 8px",
                        color: THEME.white50, fontSize: 11, cursor: "pointer", fontFamily: THEME.font,
                      }}>×</button>
                    </div>
                  ) : (
                    <button onClick={() => setShowDeposit(goal.id)} style={{
                      background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                      border: "none", borderRadius: 10, padding: "6px 14px",
                      color: THEME.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
                    }}>+ Add Money</button>
                  )
                )}
              </div>

              {/* Milestones */}
              {!isComplete && progress > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {[25, 50, 75, 100].map(m => (
                    <div key={m} style={{
                      flex: 1, textAlign: "center", padding: "4px 0",
                      background: progress >= m ? "rgba(0,212,170,0.1)" : THEME.white04,
                      borderRadius: 6, border: `1px solid ${progress >= m ? "rgba(0,212,170,0.2)" : THEME.white06}`,
                    }}>
                      <span style={{
                        color: progress >= m ? THEME.accent : THEME.white30,
                        fontSize: 10, fontWeight: 700, fontFamily: THEME.font,
                      }}>{progress >= m ? "✓" : ""} {m}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Free tier limit notice */}
      {!isPremium && goals.length >= FREE_LIMITS.maxGoals && (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <button onClick={showPaywall} style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,182,72,0.08))",
            border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: "10px 20px",
            color: THEME.gold, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
          }}>
             Upgrade for unlimited goals
          </button>
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreate && (
        <CreateGoalModal curr={curr} onClose={() => setShowCreate(false)} onAdd={(g) => { addGoal(g); setShowCreate(false); }} />
      )}
    </div>
  );
}

function CreateGoalModal({ curr, onClose, onAdd }) {
  const [step, setStep] = useState(0); // 0=template, 1=customize
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");

  const selectTemplate = (t) => {
    setSelected(t);
    setName(t.name);
    setTarget(String(t.suggestedAmount));
    setStep(1);
  };

  const valid = name.trim() && target && Number(target) > 0;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)", zIndex: 200,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: `linear-gradient(180deg, ${THEME.bgTertiary}, ${THEME.bg})`,
        borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 440,
        padding: "28px 24px 40px", border: `1px solid ${THEME.cardBorder}`, borderBottom: "none",
        maxHeight: "85vh", overflowY: "auto",
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: THEME.white10, margin: "0 auto 20px" }} />

        {step === 0 ? (
          <>
            <h3 style={{ color: THEME.white, fontSize: 20, fontWeight: 700, margin: "0 0 6px", fontFamily: THEME.font }}>
              Choose a Goal Template
            </h3>
            <p style={{ color: THEME.white50, fontSize: 13, margin: "0 0 20px", fontFamily: THEME.font }}>
              Pick a template or create your own
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {GOAL_TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => selectTemplate(t)} style={{
                  background: THEME.white04, border: `1.5px solid ${THEME.cardBorder}`,
                  borderRadius: 16, padding: "16px 12px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.2s ease",
                }}>
                  <span style={{ fontSize: 28 }}>{t.icon}</span>
                  <span style={{ color: THEME.white, fontSize: 13, fontWeight: 600, fontFamily: THEME.font, textAlign: "center" }}>
                    {t.name}
                  </span>
                  <span style={{ color: THEME.white30, fontSize: 11, fontFamily: THEME.font }}>
                    {curr.symbol} {t.suggestedAmount.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 style={{ color: THEME.white, fontSize: 20, fontWeight: 700, margin: "0 0 16px", fontFamily: THEME.font }}>
              {selected?.icon || ""} Customize Your Goal
            </h3>

            <p style={{ color: THEME.accent, fontSize: 13, fontWeight: 600, margin: "0 0 6px", fontFamily: THEME.font }}>Goal Name</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="My savings goal"
              style={{
                width: "100%", background: THEME.white06, border: `1px solid ${THEME.white10}`,
                borderRadius: 14, padding: "14px 16px", color: THEME.white, fontSize: 15,
                outline: "none", marginBottom: 14, fontFamily: THEME.font,
              }} />

            <p style={{ color: THEME.accent, fontSize: 13, fontWeight: 600, margin: "0 0 6px", fontFamily: THEME.font }}>
              Target Amount ({curr.symbol})
            </p>
            <input value={target} onChange={e => setTarget(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="10000" inputMode="numeric"
              style={{
                width: "100%", background: THEME.white06, border: `1px solid ${THEME.white10}`,
                borderRadius: 14, padding: "14px 16px", color: THEME.white, fontSize: 15,
                outline: "none", marginBottom: 14, fontFamily: THEME.font,
              }} />

            <p style={{ color: THEME.accent, fontSize: 13, fontWeight: 600, margin: "0 0 6px", fontFamily: THEME.font }}>
              Target Date (optional)
            </p>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              style={{
                width: "100%", background: THEME.white06, border: `1px solid ${THEME.white10}`,
                borderRadius: 14, padding: "14px 16px", color: THEME.white, fontSize: 15,
                outline: "none", marginBottom: 20, fontFamily: THEME.font,
                colorScheme: "dark",
              }} />

            {target && Number(target) > 0 && (
              <div style={{
                background: "rgba(0,212,170,0.08)", borderRadius: 12, padding: "12px",
                border: `1px solid rgba(0,212,170,0.12)`, marginBottom: 20,
              }}>
                <p style={{ color: THEME.accent, fontSize: 12, fontWeight: 600, margin: 0, fontFamily: THEME.font }}>
                   Save {curr.symbol} {Math.ceil(Number(target) / 12).toLocaleString()}/month to reach this in 1 year
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(0)} style={{
                flex: 1, background: THEME.white10, color: THEME.white50,
                border: "none", borderRadius: 16, padding: "16px",
                fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: THEME.font,
              }}>Back</button>
              <button onClick={() => valid && onAdd({
                name: name.trim(), target: Number(target), deadline: deadline || null,
                icon: selected?.icon || "", color: selected?.color || THEME.accent,
              })} disabled={!valid} style={{
                flex: 2,
                background: valid ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : THEME.white10,
                color: valid ? THEME.bg : THEME.white30,
                border: "none", borderRadius: 16, padding: "16px",
                fontSize: 15, fontWeight: 700, cursor: valid ? "pointer" : "default", fontFamily: THEME.font,
              }}>Create Goal</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
