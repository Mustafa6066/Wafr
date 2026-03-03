import { Utensils, Drumstick, Pizza, Sandwich, Coffee, Fish, Bike, Car, Bus, Star, Fuel, Shirt, Home, ShoppingCart, Smartphone, Lightbulb, Tv, Clapperboard, Gamepad, Pill, HeartPulse, Dumbbell, BookOpen, GraduationCap, Package, Brush, Landmark, RefreshCcw, TrendingUp, Gift } from "lucide-react";
import React from 'react';
// ─── Merchant AI — Smart categorization & merchant matching ───
// Fuzzy match merchants from SMS/receipts, auto-categorize via patterns + on-device logic

// ─── Merchant Database (MENA-focused) ───
const MERCHANT_DB = [
  // Food & Dining
  { names: ["mcdonald's", "mcdonalds", "ماكدونالدز"], category: "food", icon: React.createElement(Utensils, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["kfc", "كنتاكي", "kentucky"], category: "food", icon: React.createElement(Drumstick, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["pizza hut", "بيتزا هت"], category: "food", icon: React.createElement(Pizza, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["burger king", "برجر كينج"], category: "food", icon: React.createElement(Utensils, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["hardee's", "هارديز", "hardees"], category: "food", icon: React.createElement(Utensils, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["subway", "صب واي"], category: "food", icon: React.createElement(Sandwich, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["starbucks", "ستاربكس"], category: "food", icon: React.createElement(Coffee, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["costa coffee", "كوستا"], category: "food", icon: React.createElement(Coffee, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["tim hortons", "تيم هورتنز"], category: "food", icon: React.createElement(Coffee, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["domino's", "dominos", "دومينوز"], category: "food", icon: React.createElement(Pizza, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["buffalo burger", "بافلو برجر"], category: "food", icon: React.createElement(Utensils, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["shawerma el reem", "ريم شاورما"], category: "food", icon: React.createElement(Sandwich, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["gad", "جاد"], category: "food", icon: React.createElement(Sandwich, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["kazoku", "كازوكو"], category: "food", icon: React.createElement(Fish, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["zooba", "زوبا"], category: "food", icon: React.createElement(Sandwich, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["elmenus", "المنيوز", "talabat", "طلبات", "otlob", "اطلب"], category: "food", icon: React.createElement(Bike, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["hungerstation", "هنقرستيشن", "jahez", "جاهز", "marsool", "مرسول"], category: "food", icon: React.createElement(Bike, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["deliveroo", "ديليفرو", "careem food", "كريم"], category: "food", icon: React.createElement(Bike, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  
  // Transport
  { names: ["uber", "اوبر"], category: "transport", icon: React.createElement(Car, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["careem", "كريم"], category: "transport", icon: React.createElement(Car, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["swvl", "سويفل"], category: "transport", icon: React.createElement(Bus, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["indriver", "ان درايفر"], category: "transport", icon: React.createElement(Car, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["didi", "ديدي"], category: "transport", icon: React.createElement(Car, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["metro", "المترو", "مترو الأنفاق"], category: "transport", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["total", "توتال", "mobil", "موبيل", "shell", "شل"], category: "fuel", icon: React.createElement(Fuel, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["wataniya", "وطنية", "misr petrol", "مصر للبترول", "coop"], category: "fuel", icon: React.createElement(Fuel, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["aramco", "ارامكو", "petromin", "بترومين"], category: "fuel", icon: React.createElement(Fuel, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["adnoc", "ادنوك", "enoc", "اينوك"], category: "fuel", icon: React.createElement(Fuel, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  
  // Shopping
  { names: ["amazon", "أمازون", "amazon.eg", "amazon.sa", "noon", "نون"], category: "shopping", icon: "" },
  { names: ["jumia", "جوميا"], category: "shopping", icon: "" },
  { names: ["shein", "شي ان"], category: "shopping", icon: React.createElement(Shirt, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["namshi", "نمشي"], category: "shopping", icon: React.createElement(Shirt, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["trendyol", "ترنديول", "ali express", "علي اكسبريس"], category: "shopping", icon: "" },
  { names: ["h&m", "اتش اند ام", "zara", "زارا", "lc waikiki"], category: "shopping", icon: React.createElement(Shirt, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["ikea", "ايكيا"], category: "shopping", icon: React.createElement(Home, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  
  // Groceries
  { names: ["carrefour", "كارفور"], category: "groceries", icon: React.createElement(ShoppingCart, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["spinneys", "سبينيز"], category: "groceries", icon: React.createElement(ShoppingCart, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["seoudi", "سعودي", "seoudi market"], category: "groceries", icon: React.createElement(ShoppingCart, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["metro market", "مترو ماركت", "hyper one", "هايبر وان"], category: "groceries", icon: React.createElement(ShoppingCart, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["lulu", "لولو", "lulu hypermarket"], category: "groceries", icon: React.createElement(ShoppingCart, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["panda", "بندة", "tamimi", "التميمي"], category: "groceries", icon: React.createElement(ShoppingCart, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["danube", "الدانوب"], category: "groceries", icon: React.createElement(ShoppingCart, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["kazyon", "كازيون"], category: "groceries", icon: React.createElement(ShoppingCart, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["breadfast", "بريدفاست", "rabbit", "رابيت"], category: "groceries", icon: React.createElement(ShoppingCart, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  
  // Bills & Utilities
  { names: ["vodafone", "فودافون"], category: "bills", icon: React.createElement(Smartphone, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["orange", "اورنج"], category: "bills", icon: React.createElement(Smartphone, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["etisalat", "اتصالات", "e&"], category: "bills", icon: React.createElement(Smartphone, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["we", "وي", "telecom egypt", "المصرية للاتصالات"], category: "bills", icon: React.createElement(Smartphone, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["stc", "اس تي سي", "mobily", "موبايلي", "zain", "زين"], category: "bills", icon: React.createElement(Smartphone, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["du", "دو"], category: "bills", icon: React.createElement(Smartphone, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["fawry", "فوري"], category: "bills", icon: React.createElement(Lightbulb, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["electricity", "كهرباء", "gas", "غاز", "water", "مياه"], category: "bills", icon: React.createElement(Lightbulb, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  
  // Entertainment
  { names: ["netflix", "نتفليكس"], category: "entertainment", icon: React.createElement(Tv, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["shahid", "شاهد"], category: "entertainment", icon: React.createElement(Tv, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["spotify", "سبوتيفاي"], category: "entertainment", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["anghami", "أنغامي"], category: "entertainment", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["apple music", "آبل ميوزك"], category: "entertainment", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["youtube premium", "يوتيوب بريميوم"], category: "entertainment", icon: React.createElement(Tv, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["vox cinema", "فوكس سينما", "nova cinema"], category: "entertainment", icon: React.createElement(Clapperboard, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["empire cinema", "galaxy cinema"], category: "entertainment", icon: React.createElement(Clapperboard, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["playstation", "بلايستيشن", "xbox", "اكسبوكس"], category: "entertainment", icon: React.createElement(Gamepad, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  
  // Health
  { names: ["pharmacy", "صيدلية", "seif pharmacy", "صيدلية سيف"], category: "health", icon: React.createElement(Pill, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["el ezaby", "العزبي", "roshdy", "رشدي"], category: "health", icon: React.createElement(Pill, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["hospital", "مستشفى", "clinic", "عيادة", "doctor", "دكتور"], category: "health", icon: React.createElement(HeartPulse, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["nahdi", "النهدي"], category: "health", icon: React.createElement(Pill, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["aster", "أستر"], category: "health", icon: React.createElement(HeartPulse, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["gym", "جيم", "fitness", "gold's gym", "fitness first"], category: "health", icon: React.createElement(Dumbbell, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  
  // Education
  { names: ["udemy", "يوديمي", "coursera", "كورسيرا"], category: "education", icon: React.createElement(BookOpen, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["school", "مدرسة", "university", "جامعة", "tuition", "مصاريف"], category: "education", icon: React.createElement(GraduationCap, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  { names: ["books", "كتب", "diwan", "ديوان", "jarir", "جرير"], category: "education", icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
  
  // Insurance
  { names: ["insurance", "تأمين", "allianz", "أليانز", "axa", "اكسا"], category: "insurance", icon: "" },
  { names: ["bupa", "بوبا", "medgulf", "ميدغلف"], category: "insurance", icon: "" },
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
  if (!merchantName) return { category: 'other', confidence: 30, matchedMerchant: 'Unknown', icon: React.createElement(Package, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) };
  
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
  if (!text) return { category: 'other', confidence: 20, matchedMerchant: text || 'Unknown', icon: React.createElement(Package, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) };
  
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
    food: React.createElement(Utensils, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), transport: React.createElement(Car, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), shopping: '', bills: React.createElement(Lightbulb, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), entertainment: React.createElement(Clapperboard, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    health: React.createElement(Pill, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), education: React.createElement(BookOpen, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), groceries: React.createElement(ShoppingCart, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), rent: React.createElement(Home, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), fuel: React.createElement(Fuel, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    charity: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), personal: React.createElement(Brush, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), travel: '', savings: React.createElement(Landmark, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), other: React.createElement(Package, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    subscriptions: React.createElement(RefreshCcw, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), insurance: '', investments: React.createElement(TrendingUp, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), gifts: React.createElement(Gift, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
  };

  return {
    category: bestCategory,
    confidence: bestScore > 0 ? Math.min(75, 40 + bestScore * 5) : 20,
    matchedMerchant: text,
    icon: CATEGORY_ICONS[bestCategory] || '',
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
