// ─── Merchant AI — Smart categorization & merchant matching ───
// Fuzzy match merchants from SMS/receipts, auto-categorize via patterns + on-device logic

// ─── Merchant Database (MENA-focused) ───
const MERCHANT_DB = [
  // Food & Dining
  { names: ["mcdonald's", "mcdonalds", "ماكدونالدز"], category: "food", icon: "🍔" },
  { names: ["kfc", "كنتاكي", "kentucky"], category: "food", icon: "🍗" },
  { names: ["pizza hut", "بيتزا هت"], category: "food", icon: "🍕" },
  { names: ["burger king", "برجر كينج"], category: "food", icon: "🍔" },
  { names: ["hardee's", "هارديز", "hardees"], category: "food", icon: "🍔" },
  { names: ["subway", "صب واي"], category: "food", icon: "🥪" },
  { names: ["starbucks", "ستاربكس"], category: "food", icon: "☕" },
  { names: ["costa coffee", "كوستا"], category: "food", icon: "☕" },
  { names: ["tim hortons", "تيم هورتنز"], category: "food", icon: "☕" },
  { names: ["domino's", "dominos", "دومينوز"], category: "food", icon: "🍕" },
  { names: ["buffalo burger", "بافلو برجر"], category: "food", icon: "🍔" },
  { names: ["shawerma el reem", "ريم شاورما"], category: "food", icon: "🌯" },
  { names: ["gad", "جاد"], category: "food", icon: "🥙" },
  { names: ["kazoku", "كازوكو"], category: "food", icon: "🍣" },
  { names: ["zooba", "زوبا"], category: "food", icon: "🥙" },
  { names: ["elmenus", "المنيوز", "talabat", "طلبات", "otlob", "اطلب"], category: "food", icon: "🛵" },
  { names: ["hungerstation", "هنقرستيشن", "jahez", "جاهز", "marsool", "مرسول"], category: "food", icon: "🛵" },
  { names: ["deliveroo", "ديليفرو", "careem food", "كريم"], category: "food", icon: "🛵" },
  
  // Transport
  { names: ["uber", "اوبر"], category: "transport", icon: "🚗" },
  { names: ["careem", "كريم"], category: "transport", icon: "🚗" },
  { names: ["swvl", "سويفل"], category: "transport", icon: "🚌" },
  { names: ["indriver", "ان درايفر"], category: "transport", icon: "🚗" },
  { names: ["didi", "ديدي"], category: "transport", icon: "🚗" },
  { names: ["metro", "المترو", "مترو الأنفاق"], category: "transport", icon: "🚇" },
  { names: ["total", "توتال", "mobil", "موبيل", "shell", "شل"], category: "fuel", icon: "⛽" },
  { names: ["wataniya", "وطنية", "misr petrol", "مصر للبترول", "coop"], category: "fuel", icon: "⛽" },
  { names: ["aramco", "ارامكو", "petromin", "بترومين"], category: "fuel", icon: "⛽" },
  { names: ["adnoc", "ادنوك", "enoc", "اينوك"], category: "fuel", icon: "⛽" },
  
  // Shopping
  { names: ["amazon", "أمازون", "amazon.eg", "amazon.sa", "noon", "نون"], category: "shopping", icon: "🛍️" },
  { names: ["jumia", "جوميا"], category: "shopping", icon: "🛍️" },
  { names: ["shein", "شي ان"], category: "shopping", icon: "👗" },
  { names: ["namshi", "نمشي"], category: "shopping", icon: "👗" },
  { names: ["trendyol", "ترنديول", "ali express", "علي اكسبريس"], category: "shopping", icon: "🛍️" },
  { names: ["h&m", "اتش اند ام", "zara", "زارا", "lc waikiki"], category: "shopping", icon: "👗" },
  { names: ["ikea", "ايكيا"], category: "shopping", icon: "🏠" },
  
  // Groceries
  { names: ["carrefour", "كارفور"], category: "groceries", icon: "🛒" },
  { names: ["spinneys", "سبينيز"], category: "groceries", icon: "🛒" },
  { names: ["seoudi", "سعودي", "seoudi market"], category: "groceries", icon: "🛒" },
  { names: ["metro market", "مترو ماركت", "hyper one", "هايبر وان"], category: "groceries", icon: "🛒" },
  { names: ["lulu", "لولو", "lulu hypermarket"], category: "groceries", icon: "🛒" },
  { names: ["panda", "بندة", "tamimi", "التميمي"], category: "groceries", icon: "🛒" },
  { names: ["danube", "الدانوب"], category: "groceries", icon: "🛒" },
  { names: ["kazyon", "كازيون"], category: "groceries", icon: "🛒" },
  { names: ["breadfast", "بريدفاست", "rabbit", "رابيت"], category: "groceries", icon: "🛒" },
  
  // Bills & Utilities
  { names: ["vodafone", "فودافون"], category: "bills", icon: "📱" },
  { names: ["orange", "اورنج"], category: "bills", icon: "📱" },
  { names: ["etisalat", "اتصالات", "e&"], category: "bills", icon: "📱" },
  { names: ["we", "وي", "telecom egypt", "المصرية للاتصالات"], category: "bills", icon: "📱" },
  { names: ["stc", "اس تي سي", "mobily", "موبايلي", "zain", "زين"], category: "bills", icon: "📱" },
  { names: ["du", "دو"], category: "bills", icon: "📱" },
  { names: ["fawry", "فوري"], category: "bills", icon: "💡" },
  { names: ["electricity", "كهرباء", "gas", "غاز", "water", "مياه"], category: "bills", icon: "💡" },
  
  // Entertainment
  { names: ["netflix", "نتفليكس"], category: "entertainment", icon: "📺" },
  { names: ["shahid", "شاهد"], category: "entertainment", icon: "📺" },
  { names: ["spotify", "سبوتيفاي"], category: "entertainment", icon: "🎵" },
  { names: ["anghami", "أنغامي"], category: "entertainment", icon: "🎵" },
  { names: ["apple music", "آبل ميوزك"], category: "entertainment", icon: "🎵" },
  { names: ["youtube premium", "يوتيوب بريميوم"], category: "entertainment", icon: "📺" },
  { names: ["vox cinema", "فوكس سينما", "nova cinema"], category: "entertainment", icon: "🎬" },
  { names: ["empire cinema", "galaxy cinema"], category: "entertainment", icon: "🎬" },
  { names: ["playstation", "بلايستيشن", "xbox", "اكسبوكس"], category: "entertainment", icon: "🎮" },
  
  // Health
  { names: ["pharmacy", "صيدلية", "seif pharmacy", "صيدلية سيف"], category: "health", icon: "💊" },
  { names: ["el ezaby", "العزبي", "roshdy", "رشدي"], category: "health", icon: "💊" },
  { names: ["hospital", "مستشفى", "clinic", "عيادة", "doctor", "دكتور"], category: "health", icon: "🏥" },
  { names: ["nahdi", "النهدي"], category: "health", icon: "💊" },
  { names: ["aster", "أستر"], category: "health", icon: "🏥" },
  { names: ["gym", "جيم", "fitness", "gold's gym", "fitness first"], category: "health", icon: "💪" },
  
  // Education
  { names: ["udemy", "يوديمي", "coursera", "كورسيرا"], category: "education", icon: "📚" },
  { names: ["school", "مدرسة", "university", "جامعة", "tuition", "مصاريف"], category: "education", icon: "🎓" },
  { names: ["books", "كتب", "diwan", "ديوان", "jarir", "جرير"], category: "education", icon: "📖" },
  
  // Insurance
  { names: ["insurance", "تأمين", "allianz", "أليانز", "axa", "اكسا"], category: "insurance", icon: "🛡️" },
  { names: ["bupa", "بوبا", "medgulf", "ميدغلف"], category: "insurance", icon: "🛡️" },
];

// ─── Keyword-based category detection (when no merchant match) ───
const CATEGORY_KEYWORDS = {
  food: ['restaurant', 'مطعم', 'cafe', 'كافيه', 'coffee', 'قهوة', 'breakfast', 'فطار', 'lunch', 'غداء', 'dinner', 'عشاء', 'food', 'أكل', 'delivery', 'توصيل', 'order', 'اوردر'],
  transport: ['uber', 'careem', 'taxi', 'تاكسي', 'ride', 'رحلة', 'trip', 'مشوار', 'bus', 'أتوبيس', 'metro', 'مترو'],
  shopping: ['shop', 'متجر', 'store', 'محل', 'mall', 'مول', 'buy', 'اشتريت', 'online', 'اونلاين', 'purchase', 'شراء'],
  bills: ['bill', 'فاتورة', 'mobile', 'موبايل', 'internet', 'انترنت', 'electric', 'كهرباء', 'water', 'مياه', 'gas', 'غاز', 'recharge', 'شحن'],
  entertainment: ['movie', 'فيلم', 'cinema', 'سينما', 'game', 'لعبة', 'subscription', 'اشتراك', 'netflix', 'spotify', 'stream'],
  health: ['pharmacy', 'صيدلية', 'doctor', 'دكتور', 'hospital', 'مستشفى', 'medicine', 'دواء', 'lab', 'معمل', 'clinic', 'عيادة', 'gym', 'جيم'],
  education: ['school', 'مدرسة', 'course', 'كورس', 'book', 'كتاب', 'university', 'جامعة', 'tuition', 'مصاريف دراسية', 'study'],
  groceries: ['supermarket', 'سوبر ماركت', 'grocery', 'بقالة', 'market', 'سوق', 'vegetables', 'خضار', 'fruits', 'فاكهة'],
  rent: ['rent', 'إيجار', 'ايجار', 'housing', 'سكن', 'apartment', 'شقة', 'maintenance', 'صيانة'],
  fuel: ['fuel', 'وقود', 'petrol', 'بنزين', 'gas station', 'محطة بنزين', 'diesel', 'ديزل'],
  charity: ['charity', 'صدقة', 'zakat', 'زكاة', 'donation', 'تبرع', 'mosque', 'مسجد'],
  personal: ['salon', 'صالون', 'barber', 'حلاق', 'beauty', 'تجميل', 'spa', 'سبا', 'laundry', 'مغسلة'],
  travel: ['flight', 'طيران', 'hotel', 'فندق', 'booking', 'حجز', 'travel', 'سفر', 'airline', 'airport', 'مطار'],
};

/**
 * Fuzzy string similarity (Levenshtein-based)
 */
function similarity(a, b) {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.85;
  
  const len = Math.max(a.length, b.length);
  if (len === 0) return 1;
  
  // Simple Levenshtein distance
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return 1 - matrix[a.length][b.length] / len;
}

/**
 * Match a merchant name against our database
 * @param {string} merchantName - Raw merchant name from SMS/receipt
 * @returns {{ category: string, confidence: number, matchedMerchant: string, icon: string }}
 */
export function matchMerchant(merchantName) {
  if (!merchantName) return { category: 'other', confidence: 30, matchedMerchant: 'Unknown', icon: '📦' };
  
  const name = merchantName.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const merchant of MERCHANT_DB) {
    for (const alias of merchant.names) {
      const score = similarity(name, alias);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = merchant;
      }
    }
  }

  if (bestMatch && bestScore >= 0.65) {
    return {
      category: bestMatch.category,
      confidence: Math.round(bestScore * 100),
      matchedMerchant: bestMatch.names[0],
      icon: bestMatch.icon,
    };
  }

  // Fallback to keyword matching
  return categorizeByKeywords(merchantName);
}

/**
 * Categorize a transaction description using keywords
 * @param {string} text - Transaction description or merchant name
 * @returns {{ category: string, confidence: number, matchedMerchant: string, icon: string }}
 */
export function categorizeByKeywords(text) {
  if (!text) return { category: 'other', confidence: 20, matchedMerchant: text || 'Unknown', icon: '📦' };
  
  const lower = text.toLowerCase();
  let bestCategory = 'other';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        score += keyword.length; // longer keyword matches = more confident
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  const CATEGORY_ICONS = {
    food: '🍔', transport: '🚗', shopping: '🛍️', bills: '💡', entertainment: '🎬',
    health: '💊', education: '📚', groceries: '🛒', rent: '🏠', fuel: '⛽',
    charity: '🕌', personal: '💅', travel: '✈️', savings: '🏦', other: '📦',
    subscriptions: '🔄', insurance: '🛡️', investments: '📈', gifts: '🎁',
  };

  return {
    category: bestCategory,
    confidence: bestScore > 0 ? Math.min(75, 40 + bestScore * 5) : 20,
    matchedMerchant: text,
    icon: CATEGORY_ICONS[bestCategory] || '📦',
  };
}

/**
 * Process a raw transaction and enrich with category + merchant data
 * @param {{ amount: number, merchant: string, rawText?: string }} transaction
 * @returns {object} Enriched transaction
 */
export function enrichTransaction(transaction) {
  const merchantResult = matchMerchant(transaction.merchant);
  
  // If merchant match confidence is low, try keywords on raw text
  if (merchantResult.confidence < 50 && transaction.rawText) {
    const keywordResult = categorizeByKeywords(transaction.rawText);
    if (keywordResult.confidence > merchantResult.confidence) {
      return {
        ...transaction,
        category: keywordResult.category,
        categoryIcon: keywordResult.icon,
        confidence: keywordResult.confidence,
        merchantNormalized: keywordResult.matchedMerchant,
      };
    }
  }

  return {
    ...transaction,
    category: merchantResult.category,
    categoryIcon: merchantResult.icon,
    confidence: merchantResult.confidence,
    merchantNormalized: merchantResult.matchedMerchant,
  };
}
