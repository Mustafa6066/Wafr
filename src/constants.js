// ─── WAFR (وفّر) — Constants & Data ───

export const CURRENCIES = {
  EGP: { symbol: "ج.م", name: "Egyptian Pound", nameAr: "جنيه مصري", rate: 1, flag: "🇪🇬" },
  SAR: { symbol: "ر.س", name: "Saudi Riyal", nameAr: "ريال سعودي", rate: 0.08, flag: "🇸🇦" },
  AED: { symbol: "د.إ", name: "UAE Dirham", nameAr: "درهم إماراتي", rate: 0.075, flag: "🇦🇪" },
  KWD: { symbol: "د.ك", name: "Kuwaiti Dinar", nameAr: "دينار كويتي", rate: 0.006, flag: "🇰🇼" },
  QAR: { symbol: "ر.ق", name: "Qatari Riyal", nameAr: "ريال قطري", rate: 0.074, flag: "🇶🇦" },
};

export const COUNTRIES = [
  { code: "EG", name: "Egypt", nameAr: "مصر", flag: "🇪🇬", currency: "EGP", avgWaste: 3500 },
  { code: "SA", name: "Saudi Arabia", nameAr: "السعودية", flag: "🇸🇦", currency: "SAR", avgWaste: 1200 },
  { code: "AE", name: "UAE", nameAr: "الإمارات", flag: "🇦🇪", currency: "AED", avgWaste: 2000 },
  { code: "KW", name: "Kuwait", nameAr: "الكويت", flag: "🇰🇼", currency: "KWD", avgWaste: 150 },
  { code: "QA", name: "Qatar", nameAr: "قطر", flag: "🇶🇦", currency: "QAR", avgWaste: 1800 },
];

export const CATEGORIES = [
  { id: "food", icon: "🍔", name: "Food & Dining", nameAr: "طعام ومطاعم", color: "#FF6B6B" },
  { id: "transport", icon: "🚗", name: "Transport", nameAr: "مواصلات", color: "#4ECDC4" },
  { id: "shopping", icon: "🛍️", name: "Shopping", nameAr: "تسوق", color: "#FFE66D" },
  { id: "bills", icon: "💡", name: "Bills & Utilities", nameAr: "فواتير", color: "#A8E6CF" },
  { id: "entertainment", icon: "🎬", name: "Entertainment", nameAr: "ترفيه", color: "#DDA0DD" },
  { id: "health", icon: "💊", name: "Health", nameAr: "صحة", color: "#98D8C8" },
  { id: "education", icon: "📚", name: "Education", nameAr: "تعليم", color: "#F7DC6F" },
  { id: "groceries", icon: "🛒", name: "Groceries", nameAr: "بقالة", color: "#82E0AA" },
  { id: "rent", icon: "🏠", name: "Rent & Housing", nameAr: "إيجار وسكن", color: "#85C1E9" },
  { id: "savings", icon: "🏦", name: "Savings", nameAr: "ادخار", color: "#00D4AA" },
  { id: "other", icon: "📦", name: "Other", nameAr: "أخرى", color: "#AEB6BF" },
];

export const INCOME_RANGES = [
  { label: "Under 5,000", value: 4000 },
  { label: "5,000 - 10,000", value: 7500 },
  { label: "10,000 - 20,000", value: 15000 },
  { label: "20,000 - 50,000", value: 35000 },
  { label: "50,000+", value: 60000 },
];

export const SAVING_TIPS = [
  { tip: "Cancel unused subscriptions — the average person wastes $30/month on forgotten apps.", tipAr: "ألغِ الاشتراكات غير المستخدمة — الشخص العادي يضيع ٣٠$ شهرياً على تطبيقات منسية", saving: 30, category: "bills" },
  { tip: "Cook at home 3 more days/week — save up to $200/month on delivery & dining.", tipAr: "اطبخ في البيت ٣ أيام إضافية أسبوعياً — وفّر حتى ٢٠٠$ شهرياً", saving: 200, category: "food" },
  { tip: "Use the 24-hour rule: wait a day before any purchase over $50.", tipAr: "استخدم قاعدة الـ ٢٤ ساعة: انتظر يوم قبل أي شراء فوق ٥٠$", saving: 150, category: "shopping" },
  { tip: "Switch to a cheaper phone plan — compare providers monthly.", tipAr: "غيّر لباقة موبايل أرخص — قارن بين العروض شهرياً", saving: 25, category: "bills" },
  { tip: "Set up automatic transfers to savings on payday.", tipAr: "فعّل التحويل التلقائي للادخار يوم القبض", saving: 100, category: "savings" },
  { tip: "Bring lunch to work twice a week — save $80+/month easily.", tipAr: "خد غداك الشغل مرتين في الأسبوع — وفّر ٨٠$+ بسهولة", saving: 80, category: "food" },
  { tip: "Use public transport one more day per week.", tipAr: "استخدم المواصلات العامة يوم إضافي في الأسبوع", saving: 60, category: "transport" },
  { tip: "Negotiate your internet and phone bills — most providers offer retention discounts.", tipAr: "فاوض على فاتورة النت والموبايل — أغلب الشركات عندها خصومات", saving: 40, category: "bills" },
  { tip: "Buy groceries in bulk for staples — saves 20-30% over time.", tipAr: "اشتري البقالة بالجملة للأساسيات — وفّر ٢٠-٣٠٪", saving: 90, category: "groceries" },
  { tip: "Set a weekly cash allowance for discretionary spending.", tipAr: "حدد مصروف أسبوعي كاش للمصاريف الشخصية", saving: 120, category: "shopping" },
  { tip: "Review and cancel streaming services you don't watch weekly.", tipAr: "راجع وألغي خدمات البث اللي مش بتتفرج عليها أسبوعياً", saving: 35, category: "entertainment" },
  { tip: "Use a reusable water bottle instead of buying drinks daily.", tipAr: "استخدم زجاجة مية قابلة لإعادة الاستخدام بدل ما تشتري كل يوم", saving: 45, category: "food" },
];

export const DAILY_CHALLENGES = [
  { id: "no_spend", challenge: "No-Spend Day", icon: "🚫", desc: "Don't spend any money today!", descAr: "ماتصرفش أي فلوس النهاردة!", reward: 50, difficulty: "hard" },
  { id: "pack_lunch", challenge: "Pack Your Lunch", icon: "🥗", desc: "Bring food from home instead of ordering", descAr: "خد أكلك من البيت بدل الأوردر", reward: 30, difficulty: "easy" },
  { id: "walk", challenge: "Walk Instead of Ride", icon: "🚶", desc: "Skip the taxi for short trips today", descAr: "امشي بدل التاكسي للمشاوير القريبة", reward: 20, difficulty: "easy" },
  { id: "unsubscribe", challenge: "Unsubscribe Challenge", icon: "📧", desc: "Cancel one unused subscription", descAr: "ألغي اشتراك واحد مش بتستخدمه", reward: 40, difficulty: "medium" },
  { id: "cash_only", challenge: "Cash-Only Day", icon: "💵", desc: "Use only cash — you'll spend less!", descAr: "استخدم كاش بس — هتصرف أقل!", reward: 35, difficulty: "medium" },
  { id: "price_compare", challenge: "Price Compare", icon: "🔍", desc: "Compare prices before your next purchase", descAr: "قارن أسعار قبل ما تشتري", reward: 25, difficulty: "easy" },
  { id: "track_all", challenge: "Track Everything", icon: "📝", desc: "Log every single expense today", descAr: "سجل كل مصروف النهاردة", reward: 30, difficulty: "medium" },
  { id: "coffee_skip", challenge: "Skip the Coffee Shop", icon: "☕", desc: "Make coffee at home today", descAr: "اعمل القهوة في البيت النهاردة", reward: 20, difficulty: "easy" },
  { id: "meal_prep", challenge: "Meal Prep Sunday", icon: "🍳", desc: "Prepare meals for the week ahead", descAr: "جهز أكل الأسبوع مقدماً", reward: 45, difficulty: "hard" },
  { id: "budget_review", challenge: "Budget Check-in", icon: "📊", desc: "Review your budget and adjust categories", descAr: "راجع ميزانيتك وعدّل الفئات", reward: 35, difficulty: "medium" },
];

export const GOAL_TEMPLATES = [
  { id: "emergency", name: "Emergency Fund", nameAr: "صندوق طوارئ", icon: "🛡️", suggestedAmount: 30000, color: "#FF6B6B" },
  { id: "vacation", name: "Dream Vacation", nameAr: "إجازة الأحلام", icon: "✈️", suggestedAmount: 15000, color: "#4ECDC4" },
  { id: "car", name: "New Car", nameAr: "سيارة جديدة", icon: "🚗", suggestedAmount: 200000, color: "#FFE66D" },
  { id: "wedding", name: "Wedding", nameAr: "زفاف", icon: "💍", suggestedAmount: 100000, color: "#DDA0DD" },
  { id: "hajj", name: "Hajj / Umrah", nameAr: "حج / عمرة", icon: "🕋", suggestedAmount: 50000, color: "#F7DC6F" },
  { id: "house", name: "House Down Payment", nameAr: "مقدم شقة", icon: "🏠", suggestedAmount: 500000, color: "#85C1E9" },
  { id: "education", name: "Education Fund", nameAr: "صندوق تعليم", icon: "🎓", suggestedAmount: 80000, color: "#82E0AA" },
  { id: "gadget", name: "New Gadget", nameAr: "جهاز جديد", icon: "📱", suggestedAmount: 20000, color: "#AEB6BF" },
  { id: "custom", name: "Custom Goal", nameAr: "هدف مخصص", icon: "⭐", suggestedAmount: 10000, color: "#00D4AA" },
];

export const ACHIEVEMENTS = [
  { id: "first_expense", name: "First Step", nameAr: "الخطوة الأولى", icon: "👣", desc: "Log your first expense", condition: (s) => s.totalExpenses >= 1 },
  { id: "ten_expenses", name: "Getting Serious", nameAr: "بدأت الجد", icon: "📊", desc: "Log 10 expenses", condition: (s) => s.totalExpenses >= 10 },
  { id: "fifty_expenses", name: "Tracking Pro", nameAr: "محترف تتبع", icon: "🏆", desc: "Log 50 expenses", condition: (s) => s.totalExpenses >= 50 },
  { id: "first_goal", name: "Goal Setter", nameAr: "واضع أهداف", icon: "🎯", desc: "Create your first savings goal", condition: (s) => s.totalGoals >= 1 },
  { id: "goal_25", name: "Quarter Way", nameAr: "ربع الطريق", icon: "🌱", desc: "Reach 25% of any savings goal", condition: (s) => s.maxGoalProgress >= 25 },
  { id: "goal_50", name: "Halfway There", nameAr: "نص الطريق", icon: "🌿", desc: "Reach 50% of any savings goal", condition: (s) => s.maxGoalProgress >= 50 },
  { id: "goal_100", name: "Goal Crusher", nameAr: "محقق أهداف", icon: "🌳", desc: "Complete a savings goal!", condition: (s) => s.maxGoalProgress >= 100 },
  { id: "streak_3", name: "On a Roll", nameAr: "مستمر", icon: "🔥", desc: "Complete 3 daily challenges in a row", condition: (s) => s.streak >= 3 },
  { id: "streak_7", name: "Week Warrior", nameAr: "محارب الأسبوع", icon: "⚡", desc: "7-day challenge streak", condition: (s) => s.streak >= 7 },
  { id: "streak_30", name: "Monthly Master", nameAr: "سيد الشهر", icon: "👑", desc: "30-day challenge streak!", condition: (s) => s.streak >= 30 },
  { id: "budget_set", name: "Budget Boss", nameAr: "رئيس الميزانية", icon: "💼", desc: "Set up your first budget", condition: (s) => s.hasBudget },
  { id: "under_budget", name: "Under Budget", nameAr: "تحت الميزانية", icon: "🎉", desc: "Stay under budget for a full month", condition: (s) => s.monthsUnderBudget >= 1 },
  { id: "save_1000", name: "First Thousand", nameAr: "الألف الأول", icon: "💰", desc: "Save 1,000 in total", condition: (s) => s.totalSaved >= 1000 },
  { id: "save_10000", name: "Five Figures", nameAr: "خمس أرقام", icon: "💎", desc: "Save 10,000 in total", condition: (s) => s.totalSaved >= 10000 },
  { id: "ai_chat", name: "Coached Up", nameAr: "متدرب", icon: "🤖", desc: "Have 10 conversations with AI Coach", condition: (s) => s.aiChats >= 10 },
  { id: "challenge_10", name: "Challenger", nameAr: "متحدي", icon: "💪", desc: "Complete 10 daily challenges", condition: (s) => s.challengesCompleted >= 10 },
];

export const LEVELS = [
  { level: 1, name: "Beginner", nameAr: "مبتدئ", icon: "🌱", minPoints: 0 },
  { level: 2, name: "Saver", nameAr: "موفّر", icon: "🌿", minPoints: 200 },
  { level: 3, name: "Smart Saver", nameAr: "موفّر ذكي", icon: "🌳", minPoints: 500 },
  { level: 4, name: "Expert", nameAr: "خبير", icon: "⭐", minPoints: 1000 },
  { level: 5, name: "Master", nameAr: "محترف", icon: "🏆", minPoints: 2000 },
  { level: 6, name: "Legend", nameAr: "أسطورة", icon: "👑", minPoints: 5000 },
];

export const SUBSCRIPTION_PLANS = {
  weekly: {
    id: "weekly",
    label: "Weekly",
    prices: { EGP: 49, SAR: 9.99, AED: 9.99, KWD: 0.99, QAR: 9.99 },
    period: "/week",
  },
  monthly: {
    id: "monthly",
    label: "Monthly",
    prices: { EGP: 149, SAR: 29.99, AED: 29.99, KWD: 2.99, QAR: 29.99 },
    period: "/month",
    badge: "POPULAR",
  },
  yearly: {
    id: "yearly",
    label: "Yearly",
    prices: { EGP: 999, SAR: 149, AED: 149, KWD: 14.99, QAR: 149 },
    period: "/year",
    badge: "SAVE 60%",
  },
};

export const FREE_LIMITS = {
  maxExpenses: 15,
  maxAiMessages: 3,
  maxGoals: 1,
  insightsDays: 7,
  hasBudgetPlanner: false,
  hasRecurringTracker: false,
  hasAdvancedInsights: false,
  hasExport: false,
  hasArabic: false,
};

// Theme colors
export const THEME = {
  bg: "#0A1628",
  bgSecondary: "#0D2137",
  bgTertiary: "#132D46",
  accent: "#00D4AA",
  accentDark: "#00B894",
  accentGlow: "rgba(0,212,170,0.3)",
  red: "#FF6B6B",
  redLight: "#FF8E8E",
  orange: "#FFB648",
  orangeLight: "#FFD93D",
  gold: "#FFD700",
  white: "#FFFFFF",
  white70: "rgba(255,255,255,0.7)",
  white50: "rgba(255,255,255,0.5)",
  white40: "rgba(255,255,255,0.4)",
  white30: "rgba(255,255,255,0.3)",
  white10: "rgba(255,255,255,0.1)",
  white06: "rgba(255,255,255,0.06)",
  white04: "rgba(255,255,255,0.04)",
  cardBg: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.06)",
  font: "'DM Sans', sans-serif",
  fontSerif: "'Playfair Display', Georgia, serif",
  fontArabic: "'Noto Sans Arabic', sans-serif",
};
