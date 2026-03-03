/**
 * Ramadan / Salary Cycle Intelligence — Smart Calendar
 * 
 * Knows spending spikes during Ramadan, Eid, and salary week.
 * Shopping downloads spike 30%+ around Ramadan and Black Friday.
 * The app pre-warns users and adjusts budgets.
 * 
 * No competitor in MENA provides seasonal spending intelligence.
 */
import { useState, useMemo } from "react";
import { THEME } from "../constants.js";
import { useApp } from "../WafrApp.jsx";
import { useExpenseStore, useBudgetStore } from "../store/index.js";

// ─── MENA Calendar Events with spending impact ───
const CALENDAR_EVENTS = [
  {
    id: "salary_week", name: "Salary Week", nameAr: "أسبوع القبض",
    icon: "💰", type: "recurring", frequency: "monthly",
    spendingImpact: +40, // +40% spending increase
    tips: [
      "Transfer 20% to savings BEFORE spending",
      "Avoid shopping malls for the first 3 days",
      "Set a clear spending budget for the week",
    ],
    tipsAr: [
      "حوّل ٢٠٪ للادخار قبل ما تصرف",
      "ابعد عن المولات أول ٣ أيام",
      "حدد ميزانية واضحة للأسبوع",
    ],
    color: "#00D4AA",
  },
  {
    id: "ramadan", name: "Ramadan", nameAr: "رمضان",
    icon: "🌙", type: "annual",
    dates2026: { start: "2026-02-18", end: "2026-03-19" },
    spendingImpact: +60,
    tips: [
      "Pre-plan iftar menus to avoid daily ordering",
      "Set a Ramadan-specific budget (typically 50% higher)",
      "Buy groceries in bulk at the start of the month",
      "Beware of late-night online shopping",
    ],
    tipsAr: [
      "خطط لأكل الفطار مسبقاً بدل الأوردر اليومي",
      "حدد ميزانية خاصة برمضان (عادةً أعلى ٥٠٪)",
      "اشتري البقالة بالجملة أول الشهر",
      "حذّر من الشوبينج أونلاين بالليل",
    ],
    color: "#FFD700",
  },
  {
    id: "eid_fitr", name: "Eid al-Fitr", nameAr: "عيد الفطر",
    icon: "🎉", type: "annual",
    dates2026: { start: "2026-03-20", end: "2026-03-23" },
    spendingImpact: +80,
    tips: [
      "Set an Eid gift budget and stick to it",
      "Buy Eid clothes during pre-Eid sales",
      "Eidiya budget: decide amounts per child beforehand",
    ],
    tipsAr: [
      "حدد ميزانية هدايا العيد والتزم بيها",
      "اشتري هدوم العيد في الأوكازيونات قبله",
      "ميزانية العيدية: حدد المبالغ لكل طفل مسبقاً",
    ],
    color: "#FF6B6B",
  },
  {
    id: "eid_adha", name: "Eid al-Adha", nameAr: "عيد الأضحى",
    icon: "🐑", type: "annual",
    dates2026: { start: "2026-05-27", end: "2026-05-30" },
    spendingImpact: +90,
    tips: [
      "Start saving for udhiyah 3 months early",
      "Compare meat prices across butchers",
      "Consider sharing udhiyah with family",
    ],
    tipsAr: [
      "ابدأ ادخار للأضحية قبلها بـ ٣ شهور",
      "قارن أسعار اللحمة بين الجزارين",
      "ممكن تشارك في الأضحية مع العيلة",
    ],
    color: "#4ECDC4",
  },
  {
    id: "back_to_school", name: "Back to School", nameAr: "رجوع المدارس",
    icon: "🎒", type: "annual",
    dates2026: { start: "2026-09-01", end: "2026-09-30" },
    spendingImpact: +55,
    tips: [
      "Buy school supplies in August when cheaper",
      "Check for uniform hand-me-downs",
      "Set a per-child school budget",
    ],
    tipsAr: [
      "اشتري الأدوات المدرسية في أغسطس وهي أرخص",
      "تحقق من اليونيفورم المستعمل",
      "حدد ميزانية لكل طفل للمدرسة",
    ],
    color: "#F7DC6F",
  },
  {
    id: "black_friday", name: "Black Friday / White Friday", nameAr: "الجمعة البيضاء",
    icon: "🏷️", type: "annual",
    dates2026: { start: "2026-11-27", end: "2026-11-29" },
    spendingImpact: +70,
    tips: [
      "Make a wish list BEFORE the sale — only buy listed items",
      "Compare prices now vs during sale (many fake discounts)",
      "Set a hard spending limit and delete payment apps if needed",
    ],
    tipsAr: [
      "اعمل قايمة أمنيات قبل الأوكازيون — اشتري منها بس",
      "قارن الأسعار دلوقتي مع وقت الخصم (كتير خصومات وهمية)",
      "حدد حد أقصى للصرف وامسح تطبيقات الدفع لو لازم",
    ],
    color: "#2C3E50",
  },
  {
    id: "summer", name: "Summer Vacation", nameAr: "إجازة الصيف",
    icon: "🏖️", type: "annual",
    dates2026: { start: "2026-06-15", end: "2026-08-31" },
    spendingImpact: +35,
    tips: [
      "Book early for better prices on flights and hotels",
      "Set a daily vacation spending limit",
      "Consider staycations — explore your own city",
    ],
    tipsAr: [
      "احجز بدري عشان أسعار أحسن",
      "حدد حد يومي للصرف في الإجازة",
      "فكّر في إجازة محلية — اكتشف مدينتك",
    ],
    color: "#3498DB",
  },
];

// Helper to check if a date is within a range
function isWithinRange(date, start, end) {
  const d = new Date(date);
  return d >= new Date(start) && d <= new Date(end);
}

// Get days until an event
function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((target - now) / 86400000);
  return diff;
}

export default function SmartCalendar() {
  const { curr, profile } = useApp();
  const expenses = useExpenseStore(s => s.expenses);
  const [expandedEvent, setExpandedEvent] = useState(null);

  // Current event detection
  const currentEvents = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    
    // Check salary week (assume salary on 1st and 25th)
    const dayOfMonth = now.getDate();
    const isSalaryWeek = dayOfMonth <= 7 || (dayOfMonth >= 25 && dayOfMonth <= 31);

    const active = [];
    const upcoming = [];

    CALENDAR_EVENTS.forEach(event => {
      if (event.id === "salary_week") {
        if (isSalaryWeek) active.push({ ...event, status: "active" });
        else {
          const nextSalaryDay = dayOfMonth < 25 ? 25 : 32; // next month's 1st
          const daysLeft = nextSalaryDay - dayOfMonth;
          upcoming.push({ ...event, daysUntil: daysLeft, status: "upcoming" });
        }
        return;
      }

      if (event.dates2026) {
        if (isWithinRange(today, event.dates2026.start, event.dates2026.end)) {
          active.push({ ...event, status: "active" });
        } else {
          const days = daysUntil(event.dates2026.start);
          if (days > 0 && days <= 90) {
            upcoming.push({ ...event, daysUntil: days, status: "upcoming" });
          }
        }
      }
    });

    // Sort upcoming by days
    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

    return { active, upcoming };
  }, []);

  // Spending pattern analysis
  const spendingPattern = useMemo(() => {
    const now = new Date();
    const dailySpend = {};
    
    expenses.forEach(e => {
      const d = new Date(e.date);
      const dayOfMonth = d.getDate();
      if (!dailySpend[dayOfMonth]) dailySpend[dayOfMonth] = { total: 0, count: 0 };
      dailySpend[dayOfMonth].total += e.amount;
      dailySpend[dayOfMonth].count += 1;
    });

    // Find salary spike days
    const avgAll = Object.values(dailySpend).reduce((s, d) => s + d.total, 0) / Math.max(Object.keys(dailySpend).length, 1);
    const spikeDays = Object.entries(dailySpend)
      .filter(([_, d]) => d.total / Math.max(d.count, 1) > avgAll * 1.5)
      .map(([day]) => Number(day))
      .sort((a, b) => a - b);

    return { dailySpend, avgAll, spikeDays };
  }, [expenses]);

  return (
    <div style={{ padding: "16px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📅</div>
        <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 800, margin: "0 0 4px", fontFamily: THEME.font }}>
          Smart Calendar
        </h2>
        <p style={{ color: THEME.white40, fontSize: 13, margin: 0, fontFamily: THEME.font }}>
          Ramadan, Eid & salary cycle intelligence
        </p>
      </div>

      {/* Active Events — NOW */}
      {currentEvents.active.length > 0 && (
        <>
          <h3 style={{ color: THEME.red, fontSize: 13, fontWeight: 800, margin: "0 0 8px", fontFamily: THEME.font, textTransform: "uppercase", letterSpacing: 1 }}>
            ⚡ Active Now
          </h3>
          {currentEvents.active.map(event => (
            <div key={event.id} onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)} style={{
              background: `linear-gradient(135deg, ${event.color}20, ${event.color}08)`,
              borderRadius: 18, padding: "18px", marginBottom: 8,
              border: `1px solid ${event.color}30`, cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 32 }}>{event.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: THEME.white, fontSize: 16, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
                    {event.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{
                      background: "rgba(255,107,107,0.15)", color: THEME.red,
                      fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                      fontFamily: THEME.font,
                    }}>+{event.spendingImpact}% spending</span>
                    <span style={{
                      background: `${event.color}20`, color: event.color,
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                      fontFamily: THEME.font,
                    }}>HAPPENING NOW</span>
                  </div>
                </div>
              </div>

              {expandedEvent === event.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${THEME.white06}` }}>
                  <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 700, margin: "0 0 8px", fontFamily: THEME.font }}>
                    💡 Smart Tips
                  </p>
                  {event.tips.map((tip, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start",
                    }}>
                      <span style={{ color: THEME.accent, fontSize: 12, lineHeight: 1.5 }}>•</span>
                      <p style={{ color: THEME.white40, fontSize: 12, margin: 0, fontFamily: THEME.font, lineHeight: 1.5 }}>
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Upcoming Events */}
      {currentEvents.upcoming.length > 0 && (
        <>
          <h3 style={{ color: THEME.white, fontSize: 13, fontWeight: 800, margin: "16px 0 8px", fontFamily: THEME.font, textTransform: "uppercase", letterSpacing: 1 }}>
            📆 Coming Up
          </h3>
          {currentEvents.upcoming.map(event => (
            <div key={event.id} onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)} style={{
              background: THEME.cardBg, borderRadius: 16, padding: "14px 16px", marginBottom: 8,
              border: `1px solid ${THEME.cardBorder}`, cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 26 }}>{event.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
                    {event.name}
                  </p>
                  <p style={{ color: THEME.white30, fontSize: 11, margin: "2px 0 0", fontFamily: THEME.font }}>
                    In {event.daysUntil} days · +{event.spendingImpact}% typical spending increase
                  </p>
                </div>
                <div style={{
                  background: event.daysUntil <= 14 ? "rgba(255,107,107,0.15)" : "rgba(255,182,72,0.15)",
                  borderRadius: 10, padding: "6px 10px",
                }}>
                  <span style={{
                    color: event.daysUntil <= 14 ? THEME.red : THEME.orange,
                    fontSize: 12, fontWeight: 800, fontFamily: THEME.font,
                  }}>
                    {event.daysUntil}d
                  </span>
                </div>
              </div>

              {expandedEvent === event.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${THEME.white06}` }}>
                  {/* Preparation Budget */}
                  {profile.income > 0 && (
                    <div style={{
                      background: "rgba(0,212,170,0.08)", borderRadius: 12, padding: "12px",
                      marginBottom: 10, textAlign: "center",
                    }}>
                      <p style={{ color: THEME.white40, fontSize: 10, fontWeight: 600, margin: "0 0 4px" }}>
                        Suggested extra budget for {event.name}
                      </p>
                      <p style={{ color: THEME.accent, fontSize: 20, fontWeight: 900, margin: 0, fontFamily: THEME.font }}>
                        {curr.symbol} {Math.round(profile.income * (event.spendingImpact / 100) * 0.5).toLocaleString()}
                      </p>
                      <p style={{ color: THEME.white20, fontSize: 10, margin: "2px 0 0" }}>
                        Start saving {curr.symbol} {Math.round(profile.income * (event.spendingImpact / 100) * 0.5 / Math.max(event.daysUntil / 30, 1)).toLocaleString()}/month from now
                      </p>
                    </div>
                  )}

                  <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 700, margin: "0 0 8px", fontFamily: THEME.font }}>
                    💡 Prepare Now
                  </p>
                  {event.tips.map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "flex-start" }}>
                      <span style={{ color: THEME.accent, fontSize: 12 }}>•</span>
                      <p style={{ color: THEME.white40, fontSize: 12, margin: 0, fontFamily: THEME.font, lineHeight: 1.5 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Salary Spike Pattern */}
      {spendingPattern.spikeDays.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(108,92,231,0.12), rgba(108,92,231,0.04))",
          borderRadius: 18, padding: "18px", marginTop: 8,
          border: "1px solid rgba(108,92,231,0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <h3 style={{ color: THEME.white, fontSize: 14, fontWeight: 800, margin: 0, fontFamily: THEME.font }}>
              Your Spending Pattern
            </h3>
          </div>
          <p style={{ color: THEME.white40, fontSize: 12, margin: "0 0 10px", fontFamily: THEME.font, lineHeight: 1.5 }}>
            You tend to spend the most on days: <strong style={{ color: THEME.white50 }}>{spendingPattern.spikeDays.join(", ")}</strong> of each month. Consider setting daily limits around these dates.
          </p>

          {/* Mini month bar chart */}
          <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: 40 }}>
            {Array.from({ length: 30 }, (_, i) => {
              const day = i + 1;
              const data = spendingPattern.dailySpend[day];
              const avg = data ? data.total / Math.max(data.count, 1) : 0;
              const maxAvg = Math.max(...Object.values(spendingPattern.dailySpend).map(d => d.total / Math.max(d.count, 1)), 1);
              const h = Math.max((avg / maxAvg) * 36, 2);
              const isSpike = spendingPattern.spikeDays.includes(day);
              return (
                <div key={day} style={{
                  flex: 1, height: h, borderRadius: 1,
                  background: isSpike
                    ? `linear-gradient(180deg, ${THEME.red}, rgba(255,107,107,0.3))`
                    : `linear-gradient(180deg, rgba(108,92,231,0.5), rgba(108,92,231,0.15))`,
                }} />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: THEME.white20, fontSize: 9 }}>1st</span>
            <span style={{ color: THEME.white20, fontSize: 9 }}>15th</span>
            <span style={{ color: THEME.white20, fontSize: 9 }}>30th</span>
          </div>
        </div>
      )}

      {/* Full Calendar Year View */}
      <div style={{ marginTop: 16 }}>
        <h3 style={{ color: THEME.white, fontSize: 14, fontWeight: 800, margin: "0 0 10px", fontFamily: THEME.font }}>
          🗓️ 2026 Financial Calendar
        </h3>
        {CALENDAR_EVENTS.filter(e => e.dates2026).map(event => {
          const days = daysUntil(event.dates2026.start);
          const isPast = days < 0;
          return (
            <div key={event.id} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
              borderBottom: `1px solid ${THEME.white04}`, opacity: isPast ? 0.4 : 1,
            }}>
              <span style={{ fontSize: 20 }}>{event.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: THEME.white, fontSize: 13, fontWeight: 600, margin: 0, fontFamily: THEME.font }}>
                  {event.name}
                </p>
                <p style={{ color: THEME.white20, fontSize: 10, margin: "1px 0 0", fontFamily: THEME.font }}>
                  {new Date(event.dates2026.start).toLocaleDateString("en", { month: "short", day: "numeric" })} – {new Date(event.dates2026.end).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </p>
              </div>
              <span style={{
                background: `${event.color}15`, color: event.color,
                fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                fontFamily: THEME.font,
              }}>+{event.spendingImpact}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
