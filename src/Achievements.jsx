import { useApp } from "./WafrApp.jsx";
import { ACHIEVEMENTS, LEVELS, DAILY_CHALLENGES, THEME } from "./constants.js";
import { ProgressRing, SectionHeader } from "./Shared.jsx";

export default function Achievements() {
  const { isPremium, unlockedAchievements, totalPoints, currentLevel, challengeLog, showPaywall } = useApp();

  const nextLevel = LEVELS.find(l => l.minPoints > totalPoints) || LEVELS[LEVELS.length - 1];
  const levelProgress = nextLevel.minPoints > currentLevel.minPoints
    ? ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  return (
    <div style={{ padding: "16px 24px" }}>
      <SectionHeader title="Achievements & Rewards" />

      {/* Level Card */}
      <div style={{
        background: `linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,182,72,0.05))`,
        borderRadius: 20, padding: "20px", marginBottom: 16,
        border: "1px solid rgba(255,215,0,0.15)",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <ProgressRing progress={levelProgress} size={72} strokeWidth={5} color={THEME.gold}>
          <span style={{ fontSize: 24 }}>{currentLevel.icon}</span>
        </ProgressRing>
        <div style={{ flex: 1 }}>
          <p style={{ color: THEME.gold, fontSize: 12, fontWeight: 700, margin: "0 0 2px", fontFamily: THEME.font }}>
            LEVEL {currentLevel.level}
          </p>
          <p style={{ color: THEME.white, fontSize: 20, fontWeight: 800, margin: "0 0 4px", fontFamily: THEME.font }}>
            {currentLevel.name}
          </p>
          <p style={{ color: THEME.white40, fontSize: 12, margin: "0 0 8px", fontFamily: THEME.font }}>
            {totalPoints} points · Next: {nextLevel.name} ({nextLevel.minPoints} pts)
          </p>
          <div style={{ height: 6, borderRadius: 3, background: THEME.white10, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              background: "linear-gradient(90deg, #FFD700, #FFB648)",
              width: `${levelProgress}%`, transition: "width 0.8s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ background: THEME.cardBg, borderRadius: 14, padding: "14px 8px", border: `1px solid ${THEME.cardBorder}`, textAlign: "center" }}>
          <p style={{ color: THEME.accent, fontSize: 20, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
            {unlockedAchievements.length}
          </p>
          <p style={{ color: THEME.white40, fontSize: 10, margin: "2px 0 0", fontFamily: THEME.font }}>Badges</p>
        </div>
        <div style={{ background: THEME.cardBg, borderRadius: 14, padding: "14px 8px", border: `1px solid ${THEME.cardBorder}`, textAlign: "center" }}>
          <p style={{ color: THEME.orange, fontSize: 20, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
            {challengeLog.streak}
          </p>
          <p style={{ color: THEME.white40, fontSize: 10, margin: "2px 0 0", fontFamily: THEME.font }}>Day Streak</p>
        </div>
        <div style={{ background: THEME.cardBg, borderRadius: 14, padding: "14px 8px", border: `1px solid ${THEME.cardBorder}`, textAlign: "center" }}>
          <p style={{ color: THEME.gold, fontSize: 20, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
            {challengeLog.totalCompleted}
          </p>
          <p style={{ color: THEME.white40, fontSize: 10, margin: "2px 0 0", fontFamily: THEME.font }}>Challenges</p>
        </div>
      </div>

      {/* All Challenges */}
      <SectionHeader title="Daily Challenges" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {DAILY_CHALLENGES.map((ch) => {
          const done = Object.values(challengeLog.completed).includes(ch.id);
          return (
            <div key={ch.id} style={{
              background: done ? "rgba(0,212,170,0.08)" : THEME.cardBg,
              borderRadius: 14, padding: "14px", border: `1px solid ${done ? "rgba(0,212,170,0.15)" : THEME.cardBorder}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <span style={{ fontSize: 24 }}>{ch.icon}</span>
                <span style={{
                  background: ch.difficulty === "hard" ? "rgba(255,107,107,0.15)"
                    : ch.difficulty === "medium" ? "rgba(255,182,72,0.15)" : "rgba(0,212,170,0.15)",
                  color: ch.difficulty === "hard" ? THEME.red
                    : ch.difficulty === "medium" ? THEME.orange : THEME.accent,
                  fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                  fontFamily: THEME.font,
                }}>{ch.difficulty.toUpperCase()}</span>
              </div>
              <p style={{ color: THEME.white, fontSize: 12, fontWeight: 700, margin: "6px 0 2px", fontFamily: THEME.font }}>
                {ch.challenge}
              </p>
              <p style={{ color: THEME.white40, fontSize: 10, margin: "0 0 4px", fontFamily: THEME.font }}>
                {ch.desc}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: THEME.orange, fontSize: 10, fontWeight: 700, fontFamily: THEME.font }}>
                  +{ch.reward} pts
                </span>
                {done && <span style={{ color: THEME.accent, fontSize: 10, fontWeight: 700, fontFamily: THEME.font }}>✓ Done</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievement Badges */}
      <SectionHeader title={`Badges (${unlockedAchievements.length}/${ACHIEVEMENTS.length})`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ACHIEVEMENTS.map((a) => {
          const unlocked = unlockedAchievements.includes(a.id);
          const locked = !unlocked && !isPremium && ACHIEVEMENTS.indexOf(a) > 7;
          return (
            <div key={a.id} style={{
              background: unlocked ? "rgba(0,212,170,0.08)" : THEME.cardBg,
              borderRadius: 14, padding: "14px",
              border: `1px solid ${unlocked ? "rgba(0,212,170,0.15)" : THEME.cardBorder}`,
              opacity: locked ? 0.4 : unlocked ? 1 : 0.7,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 24, filter: unlocked ? "none" : "grayscale(1)" }}>{a.icon}</span>
                <div>
                  <p style={{ color: unlocked ? THEME.accent : THEME.white50, fontSize: 12, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
                    {a.name}
                  </p>
                  <p style={{ color: THEME.white30, fontSize: 10, margin: 0, fontFamily: THEME.font }}>{a.desc}</p>
                </div>
              </div>
              {unlocked && (
                <div style={{ marginTop: 4 }}>
                  <span style={{
                    background: "rgba(0,212,170,0.15)", color: THEME.accent,
                    fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, fontFamily: THEME.font,
                  }}>UNLOCKED +50 pts</span>
                </div>
              )}
              {locked && (
                <div style={{ marginTop: 4 }}>
                  <span style={{
                    background: "rgba(255,215,0,0.1)", color: THEME.gold,
                    fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, fontFamily: THEME.font,
                    cursor: "pointer",
                  }} onClick={showPaywall}>🔒 PRO</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
