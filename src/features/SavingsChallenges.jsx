import { Trophy, Utensils, Car, Sparkles, Flame, Star, Footprints, Gem, Moon, Banknote, Coins, Target, Bus, CookingPot } from "lucide-react";
import React from 'react';
/**
 * Savings Challenges with Social Proof
 * 
 * "No Delivery Week" challenge with 2,847 other Egyptians.
 * Streaks, leaderboards, country rankings.
 * Makes saving feel like a game, not a chore.
 * 
 * Money Fellows has social but not gamified savings.
 */
import { useState, useMemo } from "react";
import { THEME } from "../constants.js";
import { useApp } from "../WafrApp.jsx";
import { useGamificationStore } from "../store/index.js";

// ─── Challenge Categories ───
const CHALLENGE_CATEGORIES = [
  { id: "all", label: "All", icon: React.createElement(Trophy, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { id: "food", label: "Food", icon: React.createElement(Utensils, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { id: "transport", label: "Transport", icon: React.createElement(Car, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { id: "shopping", label: "Shopping", icon: "" },
  { id: "lifestyle", label: "Lifestyle", icon: React.createElement(Sparkles, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { id: "extreme", label: "Extreme", icon: React.createElement(Flame, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
];

// ─── Community Challenges (simulated social proof) ───
const COMMUNITY_CHALLENGES = [
  {
    id: "no_delivery_week", name: "No Delivery Week", nameAr: "أسبوع بدون دليفري",
    icon: "", category: "food", duration: 7, difficulty: "medium",
    desc: "Cook every meal at home for 7 days. No delivery apps!",
    descAr: "اطبخ كل الأكل في البيت لمدة ٧ أيام. بدون تطبيقات توصيل!",
    estimatedSaving: 700, participants: 2847, completionRate: 42,
    reward: 150, badge: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
  },
  {
    id: "coffee_detox", name: "Coffee Shop Detox", nameAr: "ديتوكس الكافيهات",
    icon: "", category: "food", duration: 14, difficulty: "hard",
    desc: "No coffee shops for 2 weeks. Home brew only!",
    descAr: "١٤ يوم بدون كافيهات. القهوة من البيت بس!",
    estimatedSaving: 900, participants: 1523, completionRate: 31,
    reward: 200, badge: "",
  },
  {
    id: "walk_to_work", name: "Walk/Metro Challenge", nameAr: "تحدي المشي/المترو",
    icon: React.createElement(Footprints, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "transport", duration: 5, difficulty: "easy",
    desc: "Use public transport or walk for 5 days straight.",
    descAr: "استخدم المواصلات العامة أو امشي لمدة ٥ أيام",
    estimatedSaving: 400, participants: 4102, completionRate: 68,
    reward: 100, badge: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
  },
  {
    id: "no_shopping_month", name: "No Shopping Month", nameAr: "شهر بدون شوبينج",
    icon: "", category: "shopping", duration: 30, difficulty: "extreme",
    desc: "No non-essential purchases for 30 days. Essentials only!",
    descAr: "٣٠ يوم بدون شراء أي حاجة مش ضرورية",
    estimatedSaving: 3000, participants: 891, completionRate: 18,
    reward: 500, badge: React.createElement(Gem, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
  },
  {
    id: "ramadan_saver", name: "Ramadan Super Saver", nameAr: "موفّر رمضان",
    icon: React.createElement(Moon, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "lifestyle", duration: 30, difficulty: "hard",
    desc: "Stay under budget throughout Ramadan despite the temptations.",
    descAr: "التزم بالميزانية طول رمضان رغم الإغراءات",
    estimatedSaving: 5000, participants: 6234, completionRate: 25,
    reward: 400, badge: "",
  },
  {
    id: "cash_only_week", name: "Cash Only Week", nameAr: "أسبوع كاش فقط",
    icon: React.createElement(Banknote, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "lifestyle", duration: 7, difficulty: "medium",
    desc: "Use only cash for all purchases — you'll naturally spend less.",
    descAr: "استخدم كاش بس لكل المشتريات — هتصرف أقل طبيعي",
    estimatedSaving: 500, participants: 3156, completionRate: 55,
    reward: 120, badge: React.createElement(Coins, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
  },
  {
    id: "500_challenge", name: "500 EGP Challenge", nameAr: "تحدي ال ٥٠٠ جنيه",
    icon: React.createElement(Target, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "extreme", duration: 7, difficulty: "hard",
    desc: "Live on just 500 EGP for an entire week (excluding rent/bills).",
    descAr: "عيش بـ ٥٠٠ جنيه بس لمدة أسبوع (بدون الإيجار والفواتير)",
    estimatedSaving: 1500, participants: 2089, completionRate: 22,
    reward: 300, badge: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
  },
  {
    id: "no_uber", name: "No Ride-Hailing Week", nameAr: "أسبوع بدون أوبر",
    icon: "", category: "transport", duration: 7, difficulty: "medium",
    desc: "No Uber, Careem, or InDrive for a full week.",
    descAr: "بدون أوبر أو كريم أو إندرايف لمدة أسبوع كامل",
    estimatedSaving: 600, participants: 1876, completionRate: 38,
    reward: 130, badge: React.createElement(Bus, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
  },
  {
    id: "meal_prep_master", name: "Meal Prep Master", nameAr: "ماستر تحضير الأكل",
    icon: React.createElement(CookingPot, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), category: "food", duration: 7, difficulty: "medium",
    desc: "Prep all your meals for the week on Sunday.",
    descAr: "جهز كل أكل الأسبوع يوم الأحد",
    estimatedSaving: 800, participants: 1342, completionRate: 45,
    reward: 140, badge: "",
  },
  {
    id: "digital_detox", name: "Subscription Freeze", nameAr: "تجميد الاشتراكات",
    icon: "", category: "lifestyle", duration: 30, difficulty: "medium",
    desc: "Pause or cancel one subscription you rarely use.",
    descAr: "جمّد أو ألغي اشتراك واحد مش بتستخدمه كتير",
    estimatedSaving: 150, participants: 5621, completionRate: 72,
    reward: 80, badge: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
  },
];

export default function SavingsChallenges() {
  const { curr } = useApp();
  const { challengeLog, completeChallenge } = useGamificationStore();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [showDetails, setShowDetails] = useState(null);

  const filteredChallenges = useMemo(() => {
    if (selectedCategory === "all") return COMMUNITY_CHALLENGES;
    return COMMUNITY_CHALLENGES.filter(c => c.category === selectedCategory);
  }, [selectedCategory]);

  const joinChallenge = (challengeId) => {
    if (activeChallenges.includes(challengeId)) return;
    setActiveChallenges(prev => [...prev, challengeId]);
  };

  const markComplete = (challenge) => {
    completeChallenge(challenge.id, challenge.reward);
    setActiveChallenges(prev => prev.filter(id => id !== challenge.id));
  };

  const difficultyColor = (d) => {
    if (d === "easy") return THEME.accent;
    if (d === "medium") return THEME.orange;
    if (d === "hard") return THEME.red;
    return "#9B59B6";
  };

  return (
    <div style={{ padding: "16px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}><Trophy size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
        <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 800, margin: "0 0 4px", fontFamily: THEME.font }}>
          Savings Challenges
        </h2>
        <p style={{ color: THEME.white40, fontSize: 13, margin: 0, fontFamily: THEME.font }}>
          Join thousands of savers across Egypt
        </p>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 16,
      }}>
        <div style={{
          flex: 1, background: THEME.cardBg, borderRadius: 14, padding: "12px",
          border: `1px solid ${THEME.cardBorder}`, textAlign: "center",
        }}>
          <p style={{ color: THEME.accent, fontSize: 20, fontWeight: 900, margin: 0, fontFamily: THEME.font }}>
            {challengeLog.streak}
          </p>
          <p style={{ color: THEME.white30, fontSize: 10, margin: "2px 0 0" }}>Day Streak</p>
        </div>
        <div style={{
          flex: 1, background: THEME.cardBg, borderRadius: 14, padding: "12px",
          border: `1px solid ${THEME.cardBorder}`, textAlign: "center",
        }}>
          <p style={{ color: THEME.orange, fontSize: 20, fontWeight: 900, margin: 0, fontFamily: THEME.font }}>
            {challengeLog.points}
          </p>
          <p style={{ color: THEME.white30, fontSize: 10, margin: "2px 0 0" }}>Points</p>
        </div>
        <div style={{
          flex: 1, background: THEME.cardBg, borderRadius: 14, padding: "12px",
          border: `1px solid ${THEME.cardBorder}`, textAlign: "center",
        }}>
          <p style={{ color: THEME.white, fontSize: 20, fontWeight: 900, margin: 0, fontFamily: THEME.font }}>
            {activeChallenges.length}
          </p>
          <p style={{ color: THEME.white30, fontSize: 10, margin: "2px 0 0" }}>Active</p>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {CHALLENGE_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{
            background: selectedCategory === cat.id ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : THEME.cardBg,
            color: selectedCategory === cat.id ? THEME.bg : THEME.white50,
            border: `1px solid ${selectedCategory === cat.id ? "transparent" : THEME.cardBorder}`,
            borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: THEME.font, whiteSpace: "nowrap", flexShrink: 0,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{ fontSize: 12 }}>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <>
          <h3 style={{ color: THEME.white, fontSize: 14, fontWeight: 800, margin: "0 0 10px", fontFamily: THEME.font }}>
             Your Active Challenges
          </h3>
          {activeChallenges.map(id => {
            const challenge = COMMUNITY_CHALLENGES.find(c => c.id === id);
            if (!challenge) return null;
            return (
              <div key={id} style={{
                background: "linear-gradient(135deg, rgba(0,212,170,0.1), rgba(0,212,170,0.03))",
                borderRadius: 16, padding: "16px", marginBottom: 8,
                border: "1px solid rgba(0,212,170,0.15)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 28 }}>{challenge.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
                      {challenge.name}
                    </p>
                    <p style={{ color: THEME.white40, fontSize: 11, margin: "2px 0 0", fontFamily: THEME.font }}>
                      {challenge.duration} days · +{challenge.reward} pts
                    </p>
                  </div>
                  <button onClick={() => markComplete(challenge)} style={{
                    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                    color: THEME.bg, border: "none", borderRadius: 10, padding: "8px 14px",
                    fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: THEME.font,
                  }}>Complete ✓</button>
                </div>
              </div>
            );
          })}
          <div style={{ height: 12 }} />
        </>
      )}

      {/* Challenge List */}
      <h3 style={{ color: THEME.white, fontSize: 14, fontWeight: 800, margin: "0 0 10px", fontFamily: THEME.font }}>
         Community Challenges
      </h3>

      {filteredChallenges.map(challenge => {
        const isActive = activeChallenges.includes(challenge.id);
        const isExpanded = showDetails === challenge.id;

        return (
          <div key={challenge.id} style={{
            background: THEME.cardBg, borderRadius: 16, padding: "16px", marginBottom: 8,
            border: `1px solid ${THEME.cardBorder}`, cursor: "pointer",
          }} onClick={() => setShowDetails(isExpanded ? null : challenge.id)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{challenge.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
                    {challenge.name}
                  </p>
                  <span style={{
                    background: `${difficultyColor(challenge.difficulty)}20`,
                    color: difficultyColor(challenge.difficulty),
                    fontSize: 9, fontWeight: 800, padding: "2px 6px",
                    borderRadius: 4, fontFamily: THEME.font, textTransform: "uppercase",
                  }}>{challenge.difficulty}</span>
                </div>
                <p style={{ color: THEME.white30, fontSize: 11, margin: "2px 0 0", fontFamily: THEME.font }}>
                  {challenge.duration} days · Save ~{curr.symbol} {challenge.estimatedSaving.toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: THEME.orange, fontSize: 13, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
                  +{challenge.reward}
                </p>
                <p style={{ color: THEME.white20, fontSize: 9, margin: "1px 0 0" }}>pts</p>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${THEME.white06}` }}>
                <p style={{ color: THEME.white50, fontSize: 12, lineHeight: 1.5, margin: "0 0 12px", fontFamily: THEME.font }}>
                  {challenge.desc}
                </p>

                {/* Social Proof */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <div style={{
                    flex: 1, background: THEME.white04, borderRadius: 10, padding: "8px", textAlign: "center",
                  }}>
                    <p style={{ color: THEME.accent, fontSize: 15, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
                      {challenge.participants.toLocaleString()}
                    </p>
                    <p style={{ color: THEME.white20, fontSize: 9, margin: "1px 0 0" }}>participants</p>
                  </div>
                  <div style={{
                    flex: 1, background: THEME.white04, borderRadius: 10, padding: "8px", textAlign: "center",
                  }}>
                    <p style={{ color: THEME.orange, fontSize: 15, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
                      {challenge.completionRate}%
                    </p>
                    <p style={{ color: THEME.white20, fontSize: 9, margin: "1px 0 0" }}>completed</p>
                  </div>
                  <div style={{
                    flex: 1, background: THEME.white04, borderRadius: 10, padding: "8px", textAlign: "center",
                  }}>
                    <p style={{ color: THEME.white, fontSize: 15, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
                      {challenge.badge}
                    </p>
                    <p style={{ color: THEME.white20, fontSize: 9, margin: "1px 0 0" }}>badge</p>
                  </div>
                </div>

                {!isActive ? (
                  <button onClick={(e) => { e.stopPropagation(); joinChallenge(challenge.id); }} style={{
                    width: "100%",
                    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                    color: THEME.bg, border: "none", borderRadius: 12, padding: "12px",
                    fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: THEME.font,
                  }}>
                    Join Challenge 
                  </button>
                ) : (
                  <div style={{
                    background: "rgba(0,212,170,0.1)", borderRadius: 12, padding: "12px",
                    textAlign: "center",
                  }}>
                    <p style={{ color: THEME.accent, fontSize: 13, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
                       You're in! Keep going!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Leaderboard Teaser */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,182,72,0.04))",
        borderRadius: 18, padding: "20px", marginTop: 8, textAlign: "center",
        border: "1px solid rgba(255,215,0,0.12)",
      }}>
        <p style={{ fontSize: 28, margin: "0 0 8px" }}><Star size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></p>
        <p style={{ color: THEME.white, fontSize: 15, fontWeight: 800, margin: "0 0 4px", fontFamily: THEME.font }}>
          Leaderboard Coming Soon
        </p>
        <p style={{ color: THEME.white40, fontSize: 12, margin: 0, fontFamily: THEME.font }}>
          Compete with savers in your city. Top 10 win real prizes!
        </p>
      </div>
    </div>
  );
}
