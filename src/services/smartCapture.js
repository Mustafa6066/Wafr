import { Banknote, Star, Smartphone, CreditCard, Apple } from "lucide-react";
import React from 'react';
/**
 * SmartCapture — Universal Payment Capture Engine
 * 
 * Three capture layers that bypass the InstaPay/bank API wall:
 * 
 * 1. Android NotificationListenerService (already in notificationParser.js)
 * 2. iOS Share Extension pipeline (screenshot/share handling)
 * 3. Auto-scan screenshot detection with local OCR
 * 
 * All processing is 100% on-device. No raw data ever leaves the phone.
 * Supports: InstaPay, Fawry, Vodafone Cash, Orange Money, etisalat cash,
 * valU, bank transfers, WhatsApp payment receipts, any Arabic/English receipt.
 */
import { matchMerchant } from './merchantAI.js';

// ═══════════════════════════════════════════════════════════════
//  PAYMENT PLATFORM PATTERNS — InstaPay, wallets, BNPL, banks
// ═══════════════════════════════════════════════════════════════

const PAYMENT_PLATFORMS = [
  {
    id: 'instapay',
    names: ['InstaPay', 'انستاباي', 'انستا باي'],
    icon: React.createElement(Banknote, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    patterns: [
      // "Transfer of EGP 500 to Ahmed successful"
      /(?:transfer|تحويل|sent|إرسال).*?(?:EGP|ج\.?م\.?)\s*([0-9,]+\.?\d*)/i,
      /(?:EGP|ج\.?م\.?)\s*([0-9,]+\.?\d*).*?(?:transfer|تحويل|sent|تم)/i,
      // "تم تحويل مبلغ 500 جنيه بنجاح"
      /(?:تم\s*تحويل|تم\s*إرسال).*?(?:مبلغ\s*)?([0-9,]+\.?\d*)/i,
      // "Successful transfer 500.00 EGP"
      /(?:successful|ناجح|بنجاح).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
      /([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?).*?(?:successful|ناجح|بنجاح)/i,
    ],
    recipientPatterns: [
      /(?:to|إلى|لـ?)\s+([A-Za-z\u0600-\u06FF\s]{2,30})/i,
      /(?:recipient|المستلم|المستفيد)[:\s]*([A-Za-z\u0600-\u06FF\s]{2,30})/i,
    ],
  },
  {
    id: 'fawry',
    names: ['Fawry', 'فوري'],
    icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    patterns: [
      /(?:fawry|فوري).*?(?:EGP|ج\.?م\.?)\s*([0-9,]+\.?\d*)/i,
      /(?:payment|دفع|سداد).*?(?:fawry|فوري).*?([0-9,]+\.?\d*)/i,
      /(?:fawry|فوري).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
      /(?:bill\s*(?:payment|ref)|رقم\s*المرجع).*?([0-9,]+\.?\d*)/i,
    ],
    recipientPatterns: [
      /(?:merchant|التاجر|service|الخدمة)[:\s]*([A-Za-z\u0600-\u06FF\s]{2,40})/i,
    ],
  },
  {
    id: 'vodafone_cash',
    names: ['Vodafone Cash', 'فودافون كاش', 'VF Cash'],
    icon: React.createElement(Smartphone, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    patterns: [
      /(?:vodafone\s*cash|فودافون\s*كاش|VF\s*Cash).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
      /([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?).*?(?:vodafone|فودافون|VF)/i,
      /(?:تم\s*(?:تحويل|سحب|إيداع)).*?([0-9,]+\.?\d*)/i,
    ],
    recipientPatterns: [
      /(?:to|إلى|رقم)\s*(\d{11})/i,
      /(?:to|إلى)\s+([A-Za-z\u0600-\u06FF\s]{2,30})/i,
    ],
  },
  {
    id: 'orange_money',
    names: ['Orange Money', 'اورنج موني', 'Orange Cash'],
    icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    patterns: [
      /(?:orange\s*(?:money|cash)|اورنج).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
      /([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?).*?(?:orange|اورنج)/i,
    ],
    recipientPatterns: [
      /(?:to|إلى)\s*(\d{11})/i,
    ],
  },
  {
    id: 'etisalat_cash',
    names: ['Etisalat Cash', 'اتصالات كاش', 'e& cash', 'e& money'],
    icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    patterns: [
      /(?:etisalat|اتصالات|e&).*?(?:cash|money|كاش).*?([0-9,]+\.?\d*)/i,
      /([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?).*?(?:etisalat|اتصالات|e&)/i,
    ],
    recipientPatterns: [
      /(?:to|إلى)\s*(\d{11})/i,
    ],
  },
  {
    id: 'valu',
    names: ['valU', 'ڤاليو', 'valu'],
    icon: React.createElement(CreditCard, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    patterns: [
      /(?:valu|ڤاليو).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
      /(?:installment|قسط|purchase|شراء).*?(?:valu|ڤاليو).*?([0-9,]+\.?\d*)/i,
    ],
    recipientPatterns: [
      /(?:merchant|التاجر|at|في)\s*([A-Za-z\u0600-\u06FF\s]{2,40})/i,
    ],
  },
  {
    id: 'stc_pay',
    names: ['STC Pay', 'stcpay', 'اس تي سي باي'],
    icon: React.createElement(Star, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    patterns: [
      /(?:stc\s*pay|stcpay).*?(?:SAR|ر\.?س\.?)\s*([0-9,]+\.?\d*)/i,
      /([0-9,]+\.?\d*)\s*(?:SAR|ر\.?س\.?).*?(?:stc|اس تي سي)/i,
    ],
    recipientPatterns: [],
  },
  {
    id: 'apple_pay',
    names: ['Apple Pay'],
    icon: React.createElement(Apple, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    patterns: [
      /(?:apple\s*pay).*?(?:EGP|SAR|AED|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?)\s*([0-9,]+\.?\d*)/i,
    ],
    recipientPatterns: [
      /(?:at|في|to)\s+([A-Za-z\u0600-\u06FF\s]{2,40})/i,
    ],
  },
];

// ─── Generic bank transfer patterns (fallback) ───
const GENERIC_PATTERNS = [
  // "تم خصم / سحب / تحويل مبلغ X من حسابك"
  /(?:تم\s*(?:خصم|سحب|تحويل|دفع|شراء)).*?(?:مبلغ\s*)?([0-9,]+\.?\d*)\s*(?:ج\.?م\.?|EGP)?/i,
  // "Debit of EGP 500 from your account"
  /(?:debit|purchase|payment|charge|withdrawal).*?(?:EGP|SAR|AED|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?)\s*([0-9,]+\.?\d*)/i,
  /(?:EGP|SAR|AED|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?)\s*([0-9,]+\.?\d*).*?(?:debit|purchase|payment|charge|deducted)/i,
  // "Amount: 500.00 EGP"
  /(?:amount|المبلغ|total|المجموع|الإجمالي)[:\s]*(?:EGP|SAR|AED|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?)?\s*([0-9,]+\.?\d*)/i,
  // "500.00 EGP" standalone
  /([0-9,]+\.?\d{2})\s*(?:EGP|SAR|AED|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?)/i,
  /(?:EGP|SAR|AED|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?)\s*([0-9,]+\.?\d{2})/i,
];

// ─── Currency detection from text ───
const CURRENCY_PATTERNS = {
  EGP: /EGP|ج\.?م\.?|جنيه|egyptian\s*pound/i,
  SAR: /SAR|ر\.?س\.?|ريال\s*سعودي|saudi\s*riyal/i,
  AED: /AED|د\.?إ\.?|درهم|dirham/i,
  KWD: /KWD|د\.?ك\.?|دينار\s*كويتي/i,
  QAR: /QAR|ر\.?ق\.?|ريال\s*قطري/i,
};

// ─── OTP blockers (safety check) ───
const OTP_CHECK = [
  /\bOTP\b/i, /\bverification\s*code\b/i, /\bone[\s-]*time\s*(?:password|code|pin)\b/i,
  /رمز\s*التحقق/, /كود\s*التحقق/, /رمز\s*سري/, /لا\s*تشارك/, /\bdo\s*not\s*share\b/i,
  /\bexpires?\s*in\b/i, /صالح\s*لمدة/,
];

/**
 * Parse any text input — SMS, notification, shared message, or OCR result.
 * This is the universal entry point for all capture methods.
 * 
 * @param {string} text - Raw text from any source
 * @param {string} source - 'notification' | 'share' | 'screenshot' | 'paste' | 'message'
 * @returns {{ success: boolean, transaction?: object, platform?: object, blocked?: boolean, reason?: string }}
 */
export function parsePaymentText(text, source = 'paste') {
  if (!text || text.trim().length < 5) {
    return { success: false, reason: 'empty' };
  }

  // Safety: block OTP/verification messages
  for (const pattern of OTP_CHECK) {
    if (pattern.test(text)) {
      return { success: false, blocked: true, reason: 'otp_blocked' };
    }
  }

  // 1. Try platform-specific parsing
  for (const platform of PAYMENT_PLATFORMS) {
    // Check if text mentions this platform
    const mentionsPlatform = platform.names.some(n => text.toLowerCase().includes(n.toLowerCase()));
    if (!mentionsPlatform) continue;

    for (const pattern of platform.patterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat((match[1] || match[2]).replace(/,/g, ''));
        if (amount <= 0 || amount > 10000000) continue;

        // Extract recipient
        let recipient = null;
        for (const rp of platform.recipientPatterns) {
          const rm = text.match(rp);
          if (rm) { recipient = rm[1].trim(); break; }
        }

        // Detect currency
        const currency = detectCurrency(text);

        // Merchant AI matching
        const merchantResult = matchMerchant(recipient || text.substring(0, 100));

        return {
          success: true,
          platform: { id: platform.id, name: platform.names[0], icon: platform.icon },
          transaction: {
            parsedAmount: amount,
            currency: currency,
            parsedMerchant: recipient || merchantResult.matchedMerchant || platform.names[0],
            category: merchantResult.category || 'other',
            bank: platform.names[0],
            source: source,
            confidence: merchantResult.confidence || 70,
            type: 'debit',
            date: new Date().toISOString(),
            raw: text.substring(0, 200), // keep truncated for audit
          },
        };
      }
    }
  }

  // 2. Fallback: generic pattern matching
  for (const pattern of GENERIC_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount <= 0 || amount > 10000000) continue;

      const currency = detectCurrency(text);
      const merchantResult = matchMerchant(text.substring(0, 100));

      // Try to extract merchant name from context
      let merchant = merchantResult.matchedMerchant;
      if (!merchant) {
        const merchantMatch = text.match(/(?:at|في|from|من|to|إلى|merchant|التاجر)[:\s]*([A-Za-z\u0600-\u06FF\s]{2,30})/i);
        if (merchantMatch) merchant = merchantMatch[1].trim();
      }

      return {
        success: true,
        platform: null,
        transaction: {
          parsedAmount: amount,
          currency: currency,
          parsedMerchant: merchant || 'Unknown Transaction',
          category: merchantResult.category || 'other',
          bank: 'Bank',
          source: source,
          confidence: merchantResult.confidence || 50,
          type: 'debit',
          date: new Date().toISOString(),
          raw: text.substring(0, 200),
        },
      };
    }
  }

  return { success: false, reason: 'no_match' };
}

/**
 * Parse screenshot OCR text with enhanced receipt/payment screen patterns
 * Handles InstaPay success screens, bank app transaction confirmations, etc.
 */
export function parseScreenshot(ocrText, source = 'screenshot') {
  // First try the universal parser
  const result = parsePaymentText(ocrText, source);
  if (result.success) return result;

  // Additional patterns for payment app screens (visual layout)
  const screenPatterns = [
    // Amount prominently displayed (often the largest number)
    /(?:^|\n)\s*(?:EGP|SAR|AED|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?)?\s*([0-9,]+\.?\d{2})\s*(?:EGP|SAR|AED|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?)?\s*(?:\n|$)/im,
    // "تم بنجاح" / "Successful" followed by amount
    /(?:بنجاح|successful|completed|done|تمت)[\s\S]{0,50}?([0-9,]+\.?\d*)\s*(?:EGP|SAR|AED|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?)/i,
  ];

  for (const pattern of screenPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0 && amount < 10000000) {
        const currency = detectCurrency(ocrText);
        const merchantResult = matchMerchant(ocrText.substring(0, 100));

        return {
          success: true,
          platform: null,
          transaction: {
            parsedAmount: amount,
            currency,
            parsedMerchant: merchantResult.matchedMerchant || 'Payment',
            category: merchantResult.category || 'other',
            bank: 'Screenshot',
            source: 'screenshot',
            confidence: Math.max(merchantResult.confidence || 0, 40),
            type: 'debit',
            date: new Date().toISOString(),
            raw: ocrText.substring(0, 200),
          },
        };
      }
    }
  }

  return { success: false, reason: 'no_match_in_screenshot' };
}

/**
 * Parse a shared message (WhatsApp, Telegram, etc.)
 * Users often share payment confirmations with friends/merchants.
 */
export function parseSharedMessage(text, source = 'message') {
  return parsePaymentText(text, source);
}

function detectCurrency(text) {
  for (const [code, pattern] of Object.entries(CURRENCY_PATTERNS)) {
    if (pattern.test(text)) return code;
  }
  return 'EGP'; // default for Egypt-first market
}

/**
 * Get list of all supported payment platforms
 */
export function getSupportedPlatforms() {
  return PAYMENT_PLATFORMS.map(p => ({
    id: p.id,
    name: p.names[0],
    icon: p.icon,
    aliases: p.names.slice(1),
  }));
}

/**
 * Simulate a share for demo/testing purposes
 */
export const DEMO_SHARES = [
  { type: 'instapay', text: 'Transfer of EGP 500.00 to Ahmed Mohamed successful via InstaPay. Ref: IP2026030412345', source: 'share' },
  { type: 'fawry', text: 'Fawry payment successful. Amount: EGP 150.00. Merchant: WE Internet. Ref: FW98765432', source: 'share' },
  { type: 'vodafone', text: 'تم تحويل 200.00 جنيه من محفظة فودافون كاش إلى 01012345678 بنجاح', source: 'share' },
  { type: 'valu', text: 'valU purchase approved. Amount: EGP 3,500.00 at Amazon.eg. Installment: 583 EGP/month x 6', source: 'share' },
  { type: 'bank', text: 'تم خصم مبلغ 1,250.00 ج.م من حسابك ببنك مصر. لصالح: كارفور سيتي ستارز', source: 'share' },
  { type: 'screenshot', text: 'InstaPay\nتحويل ناجح\n750.00 ج.م\nإلى: محمد أحمد\nرقم المرجع: IP20260304789', source: 'screenshot' },
  { type: 'orange', text: 'Orange Money: تم تحويل 300 ج.م إلى 01234567890 بنجاح. الرصيد المتبقي: 1,200 ج.م', source: 'share' },
  { type: 'apple_pay', text: 'Apple Pay purchase at Carrefour for EGP 845.50. Card ending 4532.', source: 'share' },
];
