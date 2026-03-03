import { useState, useEffect, useRef } from "react";

// ─── WAFR (وفّر) — AI Smart Savings Coach for the Middle East ───
// Following Connor Burd's $20K/month framework:
// ✅ Revenue-first (subscription paywall in onboarding)
// ✅ Simple (3 core features: AI analyzer, tracker, daily challenges)
// ✅ Emotional onboarding (hook → pain → solution → paywall)
// ✅ Universal desire: MONEY
// ✅ Built for Middle East (Arabic support, local currencies, cultural context)

const CURRENCIES = {
  EGP: { symbol: "ج.م", name: "Egyptian Pound", rate: 1 },
  SAR: { symbol: "ر.س", name: "Saudi Riyal", rate: 0.08 },
  AED: { symbol: "د.إ", name: "UAE Dirham", rate: 0.075 },
  KWD: { symbol: "د.ك", name: "Kuwaiti Dinar", rate: 0.006 },
  QAR: { symbol: "ر.ق", name: "Qatari Riyal", rate: 0.074 },
};

const CATEGORIES = [
  { id: "food", icon: "🍔", name: "Food & Dining", nameAr: "طعام ومطاعم", color: "#FF6B6B" },
  { id: "transport", icon: "🚗", name: "Transport", nameAr: "مواصلات", color: "#4ECDC4" },
  { id: "shopping", icon: "🛍️", name: "Shopping", nameAr: "تسوق", color: "#FFE66D" },
  { id: "bills", icon: "💡", name: "Bills & Utilities", nameAr: "فواتير", color: "#A8E6CF" },
  { id: "entertainment", icon: "🎬", name: "Entertainment", nameAr: "ترفيه", color: "#DDA0DD" },
  { id: "health", icon: "💊", name: "Health", nameAr: "صحة", color: "#98D8C8" },
  { id: "education", icon: "📚", name: "Education", nameAr: "تعليم", color: "#F7DC6F" },
  { id: "other", icon: "📦", name: "Other", nameAr: "أخرى", color: "#AEB6BF" },
];

const SAVING_TIPS = [
  { tip: "Cancel unused subscriptions — the average person wastes $30/month on forgotten apps.", tipAr: "ألغِ الاشتراكات غير المستخدمة — الشخص العادي يضيع ٣٠$ شهرياً على تطبيقات منسية", saving: 30 },
  { tip: "Cook at home 3 more days/week — save up to $200/month on delivery & dining.", tipAr: "اطبخ في البيت ٣ أيام إضافية أسبوعياً — وفّر حتى ٢٠٠$ شهرياً", saving: 200 },
  { tip: "Use the 24-hour rule: wait a day before any purchase over $50.", tipAr: "استخدم قاعدة الـ ٢٤ ساعة: انتظر يوم قبل أي شراء فوق ٥٠$", saving: 150 },
  { tip: "Switch to a cheaper phone plan — compare providers monthly.", tipAr: "غيّر لباقة موبايل أرخص — قارن بين العروض شهرياً", saving: 25 },
  { tip: "Set up automatic transfers to savings on payday.", tipAr: "فعّل التحويل التلقائي للادخار يوم القبض", saving: 100 },
  { tip: "Bring lunch to work twice a week — save $80+/month easily.", tipAr: "خد غداك الشغل مرتين في الأسبوع — وفّر ٨٠$+ بسهولة", saving: 80 },
];

const DAILY_CHALLENGES = [
  { challenge: "No-Spend Day 🚫💰", desc: "Don't spend any money today!", reward: 50, descAr: "ماتصرفش أي فلوس النهاردة!" },
  { challenge: "Pack Your Lunch 🥗", desc: "Bring food from home instead of ordering", reward: 30, descAr: "خد أكلك من البيت بدل الأوردر" },
  { challenge: "Walk Instead of Ride 🚶", desc: "Skip the taxi for short trips today", reward: 20, descAr: "امشي بدل التاكسي للمشاوير القريبة" },
  { challenge: "Unsubscribe Challenge 📧", desc: "Cancel one unused subscription", reward: 40, descAr: "ألغي اشتراك واحد مش بتستخدمه" },
  { challenge: "Cash-Only Day 💵", desc: "Use only cash — you'll spend less!", reward: 35, descAr: "استخدم كاش بس — هتصرف أقل!" },
  { challenge: "Price Compare 🔍", desc: "Compare prices before your next purchase", reward: 25, descAr: "قارن أسعار قبل ما تشتري" },
];

// Onboarding screens
function OnboardingScreen({ step, onNext, onBack, data, setData }) {
  const screens = {
    0: <WelcomeScreen onNext={onNext} />,
    1: <PainPointScreen onNext={onNext} data={data} setData={setData} />,
    2: <SpendingQuizScreen onNext={onNext} data={data} setData={setData} />,
    3: <ResultsScreen onNext={onNext} data={data} />,
    4: <PaywallScreen onNext={onNext} data={data} />,
  };
  return screens[step] || null;
}

function WelcomeScreen({ onNext }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", padding: "40px 24px",
      background: "linear-gradient(160deg, #0A1628 0%, #0D2137 40%, #132D46 70%, #1A3A5C 100%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 70%)",
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
        {/* Logo */}
        <div style={{
          width: 120, height: 120, borderRadius: 32, margin: "0 auto 32px",
          background: "linear-gradient(135deg, #00D4AA 0%, #00B894 50%, #009B7D 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 20px 60px rgba(0,212,170,0.3), 0 0 0 1px rgba(0,212,170,0.1)",
          fontSize: 56, position: "relative",
        }}>
          💰
          <div style={{
            position: "absolute", inset: -3, borderRadius: 35,
            border: "2px solid rgba(0,212,170,0.2)",
          }} />
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 52, fontWeight: 800, color: "#FFFFFF",
          margin: "0 0 8px", letterSpacing: "-1px",
          textShadow: "0 2px 20px rgba(0,212,170,0.3)",
        }}>
          Wafr
        </h1>
        <p style={{
          fontFamily: "'Noto Sans Arabic', sans-serif",
          fontSize: 28, color: "#00D4AA", margin: "0 0 24px",
          fontWeight: 600,
        }}>
          وفّر
        </p>
        <p style={{
          fontSize: 18, color: "rgba(255,255,255,0.7)", margin: "0 0 48px",
          lineHeight: 1.6, maxWidth: 320, fontFamily: "'DM Sans', sans-serif",
        }}>
          Your AI-powered savings coach.<br />Built for the Middle East.
        </p>

        <button onClick={onNext} style={{
          background: "linear-gradient(135deg, #00D4AA 0%, #00B894 100%)",
          color: "#0A1628", border: "none", borderRadius: 16,
          padding: "18px 64px", fontSize: 18, fontWeight: 700,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 8px 32px rgba(0,212,170,0.4)",
          transition: "all 0.3s ease",
          letterSpacing: "0.5px",
        }}
        onMouseOver={e => e.target.style.transform = "translateY(-2px) scale(1.02)"}
        onMouseOut={e => e.target.style.transform = "translateY(0) scale(1)"}
        >
          Start Saving →
        </button>

        <p style={{
          color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 24,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Join 50,000+ savers across the Middle East
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;600;700&display=swap');
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15px, -20px) scale(1.05); }
          66% { transform: translate(-10px, 10px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

function PainPointScreen({ onNext, data, setData }) {
  const [selected, setSelected] = useState(data.country || "");
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const countries = [
    { code: "EG", name: "Egypt 🇪🇬", currency: "EGP", avgWaste: 3500 },
    { code: "SA", name: "Saudi Arabia 🇸🇦", currency: "SAR", avgWaste: 1200 },
    { code: "AE", name: "UAE 🇦🇪", currency: "AED", avgWaste: 2000 },
    { code: "KW", name: "Kuwait 🇰🇼", currency: "KWD", avgWaste: 150 },
    { code: "QA", name: "Qatar 🇶🇦", currency: "QAR", avgWaste: 1800 },
  ];

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px",
      background: "linear-gradient(160deg, #0A1628 0%, #0D2137 40%, #132D46 100%)",
    }}>
      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease", maxWidth: 400, margin: "0 auto", width: "100%",
      }}>
        <div style={{ marginBottom: 8, color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Step 1 of 3</div>
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", marginBottom: 40 }}>
          <div style={{ height: "100%", width: "33%", borderRadius: 2, background: "linear-gradient(90deg, #00D4AA, #00B894)", transition: "width 0.5s ease" }} />
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 32, fontWeight: 800, color: "#FFFFFF",
          margin: "0 0 12px", lineHeight: 1.2,
        }}>
          Where are you based? 🌍
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.6)", fontSize: 16, margin: "0 0 32px",
          fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
        }}>
          We'll customize your savings experience for your local market and currency.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {countries.map((c, i) => (
            <button
              key={c.code}
              onClick={() => { setSelected(c.code); setData(d => ({ ...d, country: c.code, currency: c.currency, avgWaste: c.avgWaste })); }}
              style={{
                background: selected === c.code
                  ? "linear-gradient(135deg, rgba(0,212,170,0.2) 0%, rgba(0,184,148,0.1) 100%)"
                  : "rgba(255,255,255,0.04)",
                border: selected === c.code ? "2px solid #00D4AA" : "2px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: "18px 20px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "all 0.3s ease",
                opacity: show ? 1 : 0,
                transform: show ? "translateX(0)" : "translateX(-20px)",
                transitionDelay: `${i * 0.08}s`,
              }}
            >
              <span style={{
                color: "#FFFFFF", fontSize: 17, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}>{c.name}</span>
              <span style={{
                color: "rgba(255,255,255,0.4)", fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {CURRENCIES[c.currency].symbol}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!selected}
          style={{
            width: "100%", marginTop: 32,
            background: selected ? "linear-gradient(135deg, #00D4AA, #00B894)" : "rgba(255,255,255,0.1)",
            color: selected ? "#0A1628" : "rgba(255,255,255,0.3)",
            border: "none", borderRadius: 16, padding: "18px",
            fontSize: 17, fontWeight: 700, cursor: selected ? "pointer" : "default",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.3s ease",
            boxShadow: selected ? "0 8px 32px rgba(0,212,170,0.3)" : "none",
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function SpendingQuizScreen({ onNext, data, setData }) {
  const [income, setIncome] = useState(data.income || "");
  const [topSpend, setTopSpend] = useState(data.topSpend || []);
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const incomeRanges = [
    { label: "Under 5,000", value: 4000 },
    { label: "5,000 - 10,000", value: 7500 },
    { label: "10,000 - 20,000", value: 15000 },
    { label: "20,000 - 50,000", value: 35000 },
    { label: "50,000+", value: 60000 },
  ];

  const curr = CURRENCIES[data.currency] || CURRENCIES.EGP;

  const toggleCategory = (id) => {
    setTopSpend(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 3);
      setData(d => ({ ...d, topSpend: next }));
      return next;
    });
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px",
      background: "linear-gradient(160deg, #0A1628 0%, #0D2137 40%, #132D46 100%)",
    }}>
      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease", maxWidth: 400, margin: "0 auto", width: "100%",
      }}>
        <div style={{ marginBottom: 8, color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Step 2 of 3</div>
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", marginBottom: 40 }}>
          <div style={{ height: "100%", width: "66%", borderRadius: 2, background: "linear-gradient(90deg, #00D4AA, #00B894)" }} />
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28, fontWeight: 800, color: "#FFFFFF", margin: "0 0 12px",
        }}>
          Quick spending check 💸
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.6)", fontSize: 15, margin: "0 0 28px",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          This helps our AI find your biggest saving opportunities.
        </p>

        {/* Income */}
        <p style={{ color: "#00D4AA", fontSize: 14, fontWeight: 600, margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif" }}>
          Monthly income range ({curr.symbol})
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {incomeRanges.map((r) => (
            <button
              key={r.value}
              onClick={() => { setIncome(r.value); setData(d => ({ ...d, income: r.value })); }}
              style={{
                background: income === r.value ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.04)",
                border: income === r.value ? "1.5px solid #00D4AA" : "1.5px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "10px 16px", cursor: "pointer",
                color: income === r.value ? "#00D4AA" : "rgba(255,255,255,0.6)",
                fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s ease",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Top spending categories */}
        <p style={{ color: "#00D4AA", fontSize: 14, fontWeight: 600, margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif" }}>
          Where does most of your money go? (Pick up to 3)
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              style={{
                background: topSpend.includes(cat.id) ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.04)",
                border: topSpend.includes(cat.id) ? "1.5px solid #00D4AA" : "1.5px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "14px 12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <span style={{
                color: topSpend.includes(cat.id) ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}>{cat.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!income || topSpend.length === 0}
          style={{
            width: "100%",
            background: (income && topSpend.length > 0) ? "linear-gradient(135deg, #00D4AA, #00B894)" : "rgba(255,255,255,0.1)",
            color: (income && topSpend.length > 0) ? "#0A1628" : "rgba(255,255,255,0.3)",
            border: "none", borderRadius: 16, padding: "18px",
            fontSize: 17, fontWeight: 700, cursor: (income && topSpend.length > 0) ? "pointer" : "default",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: (income && topSpend.length > 0) ? "0 8px 32px rgba(0,212,170,0.3)" : "none",
          }}
        >
          Analyze My Spending →
        </button>
      </div>
    </div>
  );
}

function ResultsScreen({ onNext, data }) {
  const [show, setShow] = useState(false);
  const [counter, setCounter] = useState(0);
  const curr = CURRENCIES[data.currency] || CURRENCIES.EGP;
  const monthlyWaste = data.avgWaste || 3000;
  const yearlyWaste = monthlyWaste * 12;

  useEffect(() => {
    setTimeout(() => setShow(true), 300);
    // Animated counter
    const target = monthlyWaste;
    const duration = 2000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounter(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px",
      background: "linear-gradient(160deg, #0A1628 0%, #0D2137 40%, #132D46 100%)",
    }}>
      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        maxWidth: 400, margin: "0 auto", width: "100%", textAlign: "center",
      }}>
        <div style={{ marginBottom: 8, color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Step 3 of 3</div>
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", marginBottom: 40 }}>
          <div style={{ height: "100%", width: "100%", borderRadius: 2, background: "linear-gradient(90deg, #00D4AA, #00B894)" }} />
        </div>

        <div style={{ fontSize: 48, marginBottom: 16 }}>😱</div>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 26, fontWeight: 800, color: "#FFFFFF",
          margin: "0 0 8px", lineHeight: 1.3,
        }}>
          You could be wasting
        </h2>

        {/* Big animated number */}
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 56, fontWeight: 800, margin: "16px 0",
          background: "linear-gradient(135deg, #FF6B6B, #FF8E8E)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: "-2px",
        }}>
          {curr.symbol} {counter.toLocaleString()}
        </div>
        <p style={{
          color: "rgba(255,255,255,0.5)", fontSize: 16, margin: "0 0 8px",
          fontFamily: "'DM Sans', sans-serif",
        }}>per month on unnecessary spending</p>

        <div style={{
          background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)",
          borderRadius: 16, padding: "16px 20px", margin: "24px 0",
        }}>
          <p style={{
            color: "#FF8E8E", fontSize: 14, fontWeight: 600, margin: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            That's <span style={{ fontSize: 20, fontWeight: 800 }}>{curr.symbol} {yearlyWaste.toLocaleString()}</span> per year!
          </p>
        </div>

        {/* What you could buy */}
        <div style={{
          background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.15)",
          borderRadius: 16, padding: "20px", margin: "16px 0 32px", textAlign: "left",
        }}>
          <p style={{
            color: "#00D4AA", fontSize: 14, fontWeight: 700, margin: "0 0 12px",
            fontFamily: "'DM Sans', sans-serif",
          }}>Instead, you could:</p>
          {[
            `Save ${curr.symbol} ${yearlyWaste.toLocaleString()} for a dream vacation ✈️`,
            `Build a ${curr.symbol} ${(yearlyWaste * 3).toLocaleString()} emergency fund in 3 years 🏦`,
            `Invest and grow your wealth with compound returns 📈`,
          ].map((item, i) => (
            <p key={i} style={{
              color: "rgba(255,255,255,0.7)", fontSize: 14, margin: "8px 0",
              fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
            }}>{item}</p>
          ))}
        </div>

        <button onClick={onNext} style={{
          width: "100%",
          background: "linear-gradient(135deg, #00D4AA, #00B894)",
          color: "#0A1628", border: "none", borderRadius: 16,
          padding: "18px", fontSize: 17, fontWeight: 700,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 8px 32px rgba(0,212,170,0.4)",
        }}>
          Show Me How to Save →
        </button>
      </div>
    </div>
  );
}

function PaywallScreen({ onNext, data }) {
  const [show, setShow] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const curr = CURRENCIES[data.currency] || CURRENCIES.EGP;

  const plans = [
    {
      id: "weekly", label: "Weekly", price: data.currency === "EGP" ? 49 : data.currency === "SAR" ? 9.99 : 9.99,
      period: "/week", badge: null,
    },
    {
      id: "yearly", label: "Yearly", price: data.currency === "EGP" ? 999 : data.currency === "SAR" ? 149 : 149,
      period: "/year", badge: "SAVE 60%", popular: true,
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px",
      background: "linear-gradient(160deg, #0A1628 0%, #0D2137 40%, #132D46 100%)",
    }}>
      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease", maxWidth: 400, margin: "0 auto", width: "100%",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔓</div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 28, fontWeight: 800, color: "#FFFFFF", margin: "0 0 8px",
          }}>
            Unlock Your Savings Plan
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.6)", fontSize: 15, margin: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Start your 3-day free trial
          </p>
        </div>

        {/* Features */}
        <div style={{
          background: "rgba(255,255,255,0.04)", borderRadius: 20,
          padding: "24px", marginBottom: 24,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {[
            ["🤖", "AI Savings Analyzer", "Personalized tips that save you real money"],
            ["📊", "Smart Expense Tracker", "Auto-categorized spending insights"],
            ["🎯", "Daily Challenges", "Gamified savings with streaks & rewards"],
            ["📈", "Savings Goals", "Visual progress toward your dreams"],
            ["🔔", "Smart Alerts", "Warnings before you overspend"],
          ].map(([icon, title, desc], i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "10px 0",
              borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <span style={{ fontSize: 24 }}>{icon}</span>
              <div>
                <p style={{
                  color: "#FFFFFF", fontSize: 15, fontWeight: 600, margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}>{title}</p>
                <p style={{
                  color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                flex: 1, position: "relative",
                background: selectedPlan === plan.id
                  ? "linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,184,148,0.08))"
                  : "rgba(255,255,255,0.03)",
                border: selectedPlan === plan.id
                  ? "2px solid #00D4AA"
                  : "2px solid rgba(255,255,255,0.08)",
                borderRadius: 18, padding: "20px 16px", cursor: "pointer",
                textAlign: "center", transition: "all 0.3s ease",
              }}
            >
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #FFB648, #FF9500)",
                  color: "#0A1628", fontSize: 10, fontWeight: 800,
                  padding: "3px 10px", borderRadius: 8,
                  fontFamily: "'DM Sans', sans-serif",
                }}>{plan.badge}</div>
              )}
              <p style={{
                color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "0 0 8px",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              }}>{plan.label}</p>
              <p style={{
                color: "#FFFFFF", fontSize: 26, fontWeight: 800, margin: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {curr.symbol} {plan.price}
              </p>
              <p style={{
                color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}>{plan.period}</p>
            </button>
          ))}
        </div>

        <button onClick={onNext} style={{
          width: "100%",
          background: "linear-gradient(135deg, #00D4AA, #00B894)",
          color: "#0A1628", border: "none", borderRadius: 16,
          padding: "18px", fontSize: 17, fontWeight: 700,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 8px 32px rgba(0,212,170,0.4)",
          marginBottom: 12,
        }}>
          Start Free Trial →
        </button>

        <button onClick={onNext} style={{
          width: "100%", background: "none", border: "none",
          color: "rgba(255,255,255,0.3)", fontSize: 14,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          padding: 8,
        }}>
          Maybe later
        </button>

        <p style={{
          color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center",
          fontFamily: "'DM Sans', sans-serif", marginTop: 8,
        }}>
          Cancel anytime. No charge during trial period.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───
function Dashboard({ data }) {
  const [tab, setTab] = useState("home");
  const [expenses, setExpenses] = useState([
    { id: 1, name: "Talabat Order", category: "food", amount: 185, date: "Today" },
    { id: 2, name: "Uber Ride", category: "transport", amount: 65, date: "Today" },
    { id: 3, name: "Netflix", category: "entertainment", amount: 250, date: "Yesterday" },
    { id: 4, name: "Noon Shopping", category: "shopping", amount: 890, date: "Yesterday" },
    { id: 5, name: "Electricity Bill", category: "bills", amount: 450, date: "2 days ago" },
    { id: 6, name: "Pharmacy", category: "health", amount: 120, date: "3 days ago" },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [challengeComplete, setChallengeComplete] = useState({});

  const curr = CURRENCIES[data.currency] || CURRENCIES.EGP;
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const budget = data.income || 10000;
  const remaining = budget - totalSpent;
  const pct = Math.min((totalSpent / budget) * 100, 100);
  const todayChallenge = DAILY_CHALLENGES[new Date().getDay() % DAILY_CHALLENGES.length];

  const addExpense = (name, category, amount) => {
    setExpenses(prev => [
      { id: Date.now(), name, category, amount: Number(amount), date: "Just now" },
      ...prev,
    ]);
    setShowAddModal(false);
  };

  const sendAiMessage = () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiChat(prev => [...prev, { role: "user", text: userMsg }]);
    setAiInput("");
    // Simulate AI response
    setTimeout(() => {
      const tip = SAVING_TIPS[Math.floor(Math.random() * SAVING_TIPS.length)];
      setAiChat(prev => [...prev, {
        role: "ai",
        text: `Based on your spending pattern, here's a tip:\n\n💡 ${tip.tip}\n\n📊 Potential savings: ${curr.symbol} ${tip.saving}/month\n\nWant me to set this as a savings goal?`,
      }]);
    }, 1200);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0A1628 0%, #0D2137 40%, #132D46 100%)",
      fontFamily: "'DM Sans', sans-serif",
      paddingBottom: 80,
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>Good morning 👋</p>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 24, color: "#FFFFFF", margin: "4px 0 0", fontWeight: 800,
            }}>Your Savings</h1>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "linear-gradient(135deg, #00D4AA, #00B894)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, cursor: "pointer",
          }}>💰</div>
        </div>
      </div>

      {/* TAB: HOME */}
      {tab === "home" && (
        <div style={{ padding: "0 24px" }}>
          {/* Balance Card */}
          <div style={{
            background: "linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,184,148,0.06))",
            borderRadius: 24, padding: "28px 24px", margin: "20px 0 16px",
            border: "1px solid rgba(0,212,170,0.15)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -30, right: -30, width: 120, height: 120,
              borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,170,0.15), transparent)",
            }} />
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "0 0 6px", fontWeight: 600 }}>
              Monthly Budget
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: "#FFFFFF", fontSize: 36, fontWeight: 800 }}>
                {curr.symbol} {remaining.toLocaleString()}
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>remaining</span>
            </div>

            {/* Progress bar */}
            <div style={{
              height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)",
              marginTop: 16, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 4,
                background: pct > 80 ? "linear-gradient(90deg, #FF6B6B, #FF8E8E)" :
                  pct > 50 ? "linear-gradient(90deg, #FFB648, #FFD93D)" :
                    "linear-gradient(90deg, #00D4AA, #00B894)",
                width: `${pct}%`, transition: "width 1s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                {curr.symbol} {totalSpent.toLocaleString()} spent
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                {curr.symbol} {budget.toLocaleString()} budget
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "18px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "0 0 6px", fontWeight: 600 }}>Savings Goal</p>
              <p style={{ color: "#00D4AA", fontSize: 22, fontWeight: 800, margin: 0 }}>
                {curr.symbol} {Math.floor(budget * 0.2).toLocaleString()}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "4px 0 0" }}>20% of income</p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "18px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "0 0 6px", fontWeight: 600 }}>Streak 🔥</p>
              <p style={{ color: "#FFB648", fontSize: 22, fontWeight: 800, margin: 0 }}>7 Days</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "4px 0 0" }}>Keep it going!</p>
            </div>
          </div>

          {/* Daily Challenge */}
          <div style={{
            background: "linear-gradient(135deg, rgba(255,182,72,0.12), rgba(255,153,0,0.06))",
            borderRadius: 20, padding: "20px", marginBottom: 20,
            border: "1px solid rgba(255,182,72,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "#FFB648", fontSize: 12, fontWeight: 700, margin: "0 0 6px" }}>TODAY'S CHALLENGE</p>
                <p style={{ color: "#FFFFFF", fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>
                  {todayChallenge.challenge}
                </p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
                  {todayChallenge.desc}
                </p>
              </div>
              <button
                onClick={() => setChallengeComplete(p => ({ ...p, [todayChallenge.challenge]: true }))}
                style={{
                  background: challengeComplete[todayChallenge.challenge]
                    ? "linear-gradient(135deg, #00D4AA, #00B894)"
                    : "rgba(255,182,72,0.2)",
                  border: "none", borderRadius: 14, width: 50, height: 50,
                  fontSize: 22, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {challengeComplete[todayChallenge.challenge] ? "✅" : "💪"}
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Expenses</p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: "linear-gradient(135deg, #00D4AA, #00B894)",
                border: "none", borderRadius: 10, padding: "8px 16px",
                color: "#0A1628", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              + Add
            </button>
          </div>

          {expenses.slice(0, 5).map((exp) => {
            const cat = CATEGORIES.find(c => c.id === exp.category) || CATEGORIES[7];
            return (
              <div key={exp.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${cat.color}20`, display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>
                    {cat.icon}
                  </div>
                  <div>
                    <p style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 600, margin: 0 }}>{exp.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>{exp.date}</p>
                  </div>
                </div>
                <span style={{ color: "#FF8E8E", fontSize: 16, fontWeight: 700 }}>
                  -{curr.symbol} {exp.amount.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: AI COACH */}
      {tab === "ai" && (
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
          <div style={{
            background: "rgba(0,212,170,0.08)", borderRadius: 16, padding: "16px",
            border: "1px solid rgba(0,212,170,0.12)", marginBottom: 16,
          }}>
            <p style={{ color: "#00D4AA", fontSize: 13, fontWeight: 700, margin: "0 0 4px" }}>🤖 AI SAVINGS COACH</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>
              Ask me anything about your spending, budgeting, or how to save more money!
            </p>
          </div>

          <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
            {/* Welcome message */}
            {aiChat.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, margin: "0 0 20px" }}>
                  Hi! I'm your AI savings coach. Try asking me:
                </p>
                {[
                  "How can I save more on food?",
                  "Analyze my spending habits",
                  "Help me set a savings goal",
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setAiInput(q); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, padding: "12px 16px", marginBottom: 8,
                      color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            )}

            {aiChat.map((msg, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}>
                <div style={{
                  maxWidth: "80%",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #00D4AA, #00B894)"
                    : "rgba(255,255,255,0.06)",
                  color: msg.role === "user" ? "#0A1628" : "#FFFFFF",
                  borderRadius: 18, padding: "12px 16px",
                  fontSize: 14, lineHeight: 1.6,
                  whiteSpace: "pre-line",
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendAiMessage()}
              placeholder="Ask your AI savings coach..."
              style={{
                flex: 1, background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14, padding: "14px 16px",
                color: "#FFFFFF", fontSize: 15, outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              onClick={sendAiMessage}
              style={{
                background: "linear-gradient(135deg, #00D4AA, #00B894)",
                border: "none", borderRadius: 14, width: 50, height: 50,
                cursor: "pointer", fontSize: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* TAB: INSIGHTS */}
      {tab === "insights" && (
        <div style={{ padding: "20px 24px" }}>
          <h2 style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 700, margin: "0 0 20px" }}>
            Spending Breakdown 📊
          </h2>

          {/* Spending by category */}
          {(() => {
            const catTotals = {};
            expenses.forEach(e => {
              catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
            });
            const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
            const maxVal = sorted[0]?.[1] || 1;

            return sorted.map(([catId, amount]) => {
              const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES[7];
              return (
                <div key={catId} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 600 }}>
                      {cat.icon} {cat.name}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600 }}>
                      {curr.symbol} {amount.toLocaleString()}
                    </span>
                  </div>
                  <div style={{
                    height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                      width: `${(amount / maxVal) * 100}%`,
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                </div>
              );
            });
          })()}

          {/* AI Tips */}
          <h2 style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 700, margin: "32px 0 16px" }}>
            AI Saving Tips 🤖
          </h2>
          {SAVING_TIPS.slice(0, 3).map((tip, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 16,
              padding: "18px", marginBottom: 12,
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <p style={{ color: "#FFFFFF", fontSize: 14, margin: "0 0 8px", lineHeight: 1.5 }}>
                💡 {tip.tip}
              </p>
              <div style={{
                display: "inline-block",
                background: "rgba(0,212,170,0.1)", borderRadius: 8,
                padding: "4px 10px",
              }}>
                <span style={{ color: "#00D4AA", fontSize: 13, fontWeight: 700 }}>
                  Save {curr.symbol} {tip.saving}/mo
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <AddExpenseModal
          curr={curr}
          onClose={() => setShowAddModal(false)}
          onAdd={addExpense}
        />
      )}

      {/* Bottom Navigation */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(10,22,40,0.95)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-around",
        padding: "12px 0 20px", zIndex: 100,
      }}>
        {[
          { id: "home", icon: "🏠", label: "Home" },
          { id: "ai", icon: "🤖", label: "AI Coach" },
          { id: "insights", icon: "📊", label: "Insights" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}
          >
            <span style={{ fontSize: 22, filter: tab === t.id ? "none" : "grayscale(0.5) opacity(0.5)" }}>
              {t.icon}
            </span>
            <span style={{
              color: tab === t.id ? "#00D4AA" : "rgba(255,255,255,0.3)",
              fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}>{t.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        body { margin: 0; background: #0A1628; }
        ::-webkit-scrollbar { width: 0; }
        input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}

function AddExpenseModal({ curr, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)", zIndex: 200,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, #132D46, #0A1628)",
          borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 440,
          padding: "28px 24px 40px",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
        }}
      >
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: "rgba(255,255,255,0.2)", margin: "0 auto 24px",
        }} />
        <h3 style={{
          color: "#FFFFFF", fontSize: 22, fontWeight: 700, margin: "0 0 20px",
          fontFamily: "'DM Sans', sans-serif",
        }}>Add Expense</h3>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="What did you spend on?"
          style={{
            width: "100%", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
            padding: "14px 16px", color: "#FFFFFF", fontSize: 15,
            outline: "none", marginBottom: 12, fontFamily: "'DM Sans', sans-serif",
          }}
        />

        <input
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder={`Amount (${curr.symbol})`}
          style={{
            width: "100%", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
            padding: "14px 16px", color: "#FFFFFF", fontSize: 15,
            outline: "none", marginBottom: 16, fontFamily: "'DM Sans', sans-serif",
          }}
        />

        <p style={{
          color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600,
          margin: "0 0 10px", fontFamily: "'DM Sans', sans-serif",
        }}>Category</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                background: category === cat.id ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.04)",
                border: category === cat.id ? "1.5px solid #00D4AA" : "1.5px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "8px 12px", cursor: "pointer",
                fontSize: 13, color: category === cat.id ? "#00D4AA" : "rgba(255,255,255,0.5)",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => name && amount && onAdd(name, category, amount)}
          disabled={!name || !amount}
          style={{
            width: "100%",
            background: (name && amount) ? "linear-gradient(135deg, #00D4AA, #00B894)" : "rgba(255,255,255,0.1)",
            color: (name && amount) ? "#0A1628" : "rgba(255,255,255,0.3)",
            border: "none", borderRadius: 16, padding: "18px",
            fontSize: 17, fontWeight: 700, cursor: (name && amount) ? "pointer" : "default",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function WafrApp() {
  const [step, setStep] = useState(0);
  const [onboarded, setOnboarded] = useState(false);
  const [data, setData] = useState({
    country: "", currency: "EGP", income: 0,
    topSpend: [], avgWaste: 3000,
  });

  const handleNext = () => {
    if (step >= 4) {
      setOnboarded(true);
    } else {
      setStep(s => s + 1);
    }
  };

  if (onboarded) {
    return <Dashboard data={data} />;
  }

  return (
    <OnboardingScreen
      step={step}
      onNext={handleNext}
      onBack={() => setStep(s => Math.max(0, s - 1))}
      data={data}
      setData={setData}
    />
  );
}
