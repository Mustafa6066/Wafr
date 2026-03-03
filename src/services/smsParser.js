// ─── SMS Parser — Auto-detect bank transactions from SMS messages ───
// Part of Layer 1+3 of the 5-Layer Security Architecture.
// Supports: CIB, NBE, QNB, Banque Misr, AAIB, InstaPay, Fawry, Vodafone Cash, Orange Money, Etisalat Cash
// Also supports: Al Rajhi, SNB, SABB (Saudi), Emirates NBD, ADCB (UAE)
//
// Security: OTP messages are pre-filtered before reaching this parser.
// See notificationParser.js for the full security pipeline.

const BANK_PATTERNS = [
  // ══════════════ EGYPT ══════════════
  // CIB Egypt
  {
    bank: 'CIB',
    country: 'EG',
    patterns: [
      /(?:CIB|سي آي بي).*?(?:purchase|شراء|مشتريات).*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:CIB|سي آي بي).*?(?:withdrawal|سحب).*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:CIB|سي آي بي).*?(?:transfer|تحويل).*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /CIB.*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
    ],
    merchantExtractor: /(?:at|في|عند|from|من)\s+(.+?)(?:\s+on|\s+في|\s+بتاريخ|\.|$)/i,
    type: 'debit',
  },
  // NBE (National Bank of Egypt)
  {
    bank: 'NBE',
    country: 'EG',
    patterns: [
      /(?:NBE|الأهلي|الاهلي).*?(?:purchase|شراء).*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:NBE|الأهلي|الاهلي).*?(?:withdrawal|سحب).*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:NBE|الأهلي).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
    ],
    merchantExtractor: /(?:at|في|عند|from|من)\s+(.+?)(?:\s+on|\s+في|\.|$)/i,
    type: 'debit',
  },
  // QNB AlAhli (Egypt)
  {
    bank: 'QNB',
    country: 'EG',
    patterns: [
      /(?:QNB|كيو إن بي).*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /QNB.*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
    ],
    merchantExtractor: /(?:at|في)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'debit',
  },
  // Banque Misr
  {
    bank: 'Banque Misr',
    country: 'EG',
    patterns: [
      /(?:Banque Misr|بنك مصر).*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:BM|بنك مصر).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
    ],
    merchantExtractor: /(?:at|في)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'debit',
  },
  // AAIB (Arab African International Bank)
  {
    bank: 'AAIB',
    country: 'EG',
    patterns: [
      /AAIB.*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /AAIB.*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
    ],
    merchantExtractor: /(?:at|في)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'debit',
  },
  // InstaPay Egypt
  {
    bank: 'InstaPay',
    country: 'EG',
    patterns: [
      /(?:InstaPay|انستاباي).*?(?:sent|أرسلت|تم ارسال|transferred|تحويل).*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:InstaPay|انستاباي).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?).*?(?:sent|أرسلت|تحويل)/i,
      /(?:تم تحويل|تم ارسال)\s*([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?).*?(?:InstaPay|انستاباي)/i,
      /InstaPay.*?(?:debit|خصم).*?([0-9,]+\.?\d*)/i,
    ],
    merchantExtractor: /(?:to|إلى|الى|ل)\s+(.+?)(?:\s+on|\s+في|\.|$)/i,
    type: 'transfer',
  },
  // InstaPay Received
  {
    bank: 'InstaPay',
    country: 'EG',
    patterns: [
      /(?:InstaPay|انستاباي).*?(?:received|استلمت|تم استلام).*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:تم استلام)\s*([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?).*?(?:InstaPay|انستاباي)/i,
    ],
    merchantExtractor: /(?:from|من)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'credit',
  },
  // Fawry
  {
    bank: 'Fawry',
    country: 'EG',
    patterns: [
      /(?:Fawry|فوري).*?(?:payment|دفع|سداد).*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:Fawry|فوري).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
      /(?:تم السداد|تم الدفع).*?(?:Fawry|فوري).*?([0-9,]+\.?\d*)/i,
    ],
    merchantExtractor: /(?:for|عن|ل)\s+(.+?)(?:\s+ref|\s+مرجع|\.|$)/i,
    type: 'debit',
  },
  // Vodafone Cash
  {
    bank: 'Vodafone Cash',
    country: 'EG',
    patterns: [
      /(?:Vodafone Cash|فودافون كاش).*?(?:sent|أرسلت|تحويل).*?(?:EGP|ج\.?م\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:Vodafone Cash|فودافون كاش).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
      /(?:VF Cash|VF-Cash).*?([0-9,]+\.?\d*)/i,
    ],
    merchantExtractor: /(?:to|إلى)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'transfer',
  },
  // Orange Money Egypt
  {
    bank: 'Orange Money',
    country: 'EG',
    patterns: [
      /(?:Orange Money|اورنج موني).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
    ],
    merchantExtractor: /(?:to|إلى)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'transfer',
  },
  // Etisalat Cash (e&)
  {
    bank: 'Etisalat Cash',
    country: 'EG',
    patterns: [
      /(?:Etisalat Cash|اتصالات كاش|e& cash).*?([0-9,]+\.?\d*)\s*(?:EGP|ج\.?م\.?)/i,
    ],
    merchantExtractor: /(?:to|إلى)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'transfer',
  },
  // ══════════════ SAUDI ARABIA ══════════════
  // Al Rajhi Bank
  {
    bank: 'Al Rajhi',
    country: 'SA',
    patterns: [
      /(?:AlRajhi|Al Rajhi|الراجحي).*?(?:SAR|ر\.?س\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:AlRajhi|الراجحي).*?([0-9,]+\.?\d*)\s*(?:SAR|ر\.?س\.?)/i,
    ],
    merchantExtractor: /(?:at|في|عند)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'debit',
  },
  // SNB (Saudi National Bank)
  {
    bank: 'SNB',
    country: 'SA',
    patterns: [
      /(?:SNB|البنك الأهلي السعودي|الاهلي).*?(?:SAR|ر\.?س\.?)[\s]*([0-9,]+\.?\d*)/i,
      /SNB.*?([0-9,]+\.?\d*)\s*(?:SAR|ر\.?س\.?)/i,
    ],
    merchantExtractor: /(?:at|في)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'debit',
  },
  // SABB (Saudi British Bank)
  {
    bank: 'SABB',
    country: 'SA',
    patterns: [
      /SABB.*?(?:SAR|ر\.?س\.?)[\s]*([0-9,]+\.?\d*)/i,
      /SABB.*?([0-9,]+\.?\d*)\s*(?:SAR|ر\.?س\.?)/i,
    ],
    merchantExtractor: /(?:at|في)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'debit',
  },
  // STC Pay
  {
    bank: 'STC Pay',
    country: 'SA',
    patterns: [
      /(?:STC Pay|stcpay).*?(?:SAR|ر\.?س\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:STC Pay|stcpay).*?([0-9,]+\.?\d*)\s*(?:SAR|ر\.?س\.?)/i,
    ],
    merchantExtractor: /(?:to|إلى)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'transfer',
  },
  // ══════════════ UAE ══════════════
  // Emirates NBD
  {
    bank: 'Emirates NBD',
    country: 'AE',
    patterns: [
      /(?:Emirates NBD|ENBD).*?(?:AED|د\.?إ\.?)[\s]*([0-9,]+\.?\d*)/i,
      /(?:ENBD).*?([0-9,]+\.?\d*)\s*(?:AED|د\.?إ\.?)/i,
    ],
    merchantExtractor: /(?:at|في)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'debit',
  },
  // ADCB
  {
    bank: 'ADCB',
    country: 'AE',
    patterns: [
      /ADCB.*?(?:AED|د\.?إ\.?)[\s]*([0-9,]+\.?\d*)/i,
      /ADCB.*?([0-9,]+\.?\d*)\s*(?:AED|د\.?إ\.?)/i,
    ],
    merchantExtractor: /(?:at|في)\s+(.+?)(?:\s+on|\.|$)/i,
    type: 'debit',
  },
];

// Generic amount + currency fallback patterns
const GENERIC_PATTERNS = [
  // "EGP 1,234.56" or "1,234.56 EGP"
  /(?:EGP|SAR|AED|KWD|QAR|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?|د\.?ك\.?|ر\.?ق\.?)\s*([0-9,]+\.?\d*)/i,
  /([0-9,]+\.?\d*)\s*(?:EGP|SAR|AED|KWD|QAR|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?|د\.?ك\.?|ر\.?ق\.?)/i,
];

// Currency detection
const CURRENCY_MAP = {
  'EGP': 'EGP', 'ج.م': 'EGP', 'جم': 'EGP',
  'SAR': 'SAR', 'ر.س': 'SAR', 'رس': 'SAR',
  'AED': 'AED', 'د.إ': 'AED', 'دإ': 'AED',
  'KWD': 'KWD', 'د.ك': 'KWD', 'دك': 'KWD',
  'QAR': 'QAR', 'ر.ق': 'QAR', 'رق': 'QAR',
};

function detectCurrency(text) {
  for (const [pattern, currency] of Object.entries(CURRENCY_MAP)) {
    if (text.includes(pattern)) return currency;
  }
  return 'EGP'; // default
}

// Date extraction
function extractDate(text) {
  // Try common date formats
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,  // DD/MM/YYYY or DD-MM-YYYY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,      // YYYY-MM-DD
  ];
  for (const p of datePatterns) {
    const m = text.match(p);
    if (m) {
      try {
        if (m[1].length === 4) {
          return new Date(`${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`);
        }
        const year = m[3].length === 2 ? `20${m[3]}` : m[3];
        return new Date(`${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`);
      } catch { /* continue */ }
    }
  }
  return new Date(); // fallback to now
}

// Determine transaction type
function isDebitSMS(text) {
  const debitKeywords = /purchase|شراء|مشتريات|withdrawal|سحب|payment|دفع|سداد|sent|أرسلت|تحويل|debit|خصم|spent|صرف/i;
  const creditKeywords = /received|استلمت|استلام|credit|إيداع|salary|راتب|refund|استرداد|deposit/i;
  if (creditKeywords.test(text)) return false;
  if (debitKeywords.test(text)) return true;
  return true; // assume debit by default
}

/**
 * Parse an SMS message and extract transaction data
 * @param {string} smsBody - The SMS text content
 * @param {string} sender - The SMS sender ID (optional)
 * @returns {object|null} - Parsed transaction or null if not a financial SMS
 */
export function parseSMS(smsBody, sender = '') {
  if (!smsBody || smsBody.length < 10) return null;

  const text = smsBody.trim();
  let result = null;

  // Try bank-specific patterns first (higher confidence)
  for (const bankConfig of BANK_PATTERNS) {
    for (const pattern of bankConfig.patterns) {
      const match = text.match(pattern);
      if (match) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0 || amount > 10000000) continue;

        let merchant = '';
        if (bankConfig.merchantExtractor) {
          const merchantMatch = text.match(bankConfig.merchantExtractor);
          if (merchantMatch) merchant = merchantMatch[1].trim();
        }

        result = {
          amount,
          currency: detectCurrency(text),
          bank: bankConfig.bank,
          merchant: merchant || bankConfig.bank,
          type: bankConfig.type === 'credit' ? 'credit' : (isDebitSMS(text) ? 'debit' : 'credit'),
          date: extractDate(text),
          source: 'sms',
          confidence: 85, // bank-specific patterns = high confidence
          rawText: text,
          country: bankConfig.country,
        };
        break;
      }
    }
    if (result) break;
  }

  // Fallback to generic patterns (lower confidence)
  if (!result) {
    for (const pattern of GENERIC_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0 || amount > 10000000) continue;

        result = {
          amount,
          currency: detectCurrency(text),
          bank: 'Unknown',
          merchant: sender || 'Unknown',
          type: isDebitSMS(text) ? 'debit' : 'credit',
          date: extractDate(text),
          source: 'sms',
          confidence: 55, // generic pattern = lower confidence
          rawText: text,
          country: null,
        };
        break;
      }
    }
  }

  // Filter out non-financial SMS
  if (!result) return null;

  // Only track debits (expenses) — filter credits unless specifically needed
  return result;
}

/**
 * Parse multiple SMS messages at once
 * @param {Array<{body: string, sender: string, date?: Date}>} messages
 * @returns {Array} Parsed transactions
 */
export function parseSMSBatch(messages) {
  return messages
    .map(msg => {
      const parsed = parseSMS(msg.body, msg.sender);
      if (parsed && msg.date) parsed.date = msg.date;
      return parsed;
    })
    .filter(Boolean);
}

/**
 * Check if an SMS is likely financial (quick pre-filter)
 */
export function isFinancialSMS(text) {
  if (!text || text.length < 15) return false;
  const financialKeywords = /EGP|SAR|AED|KWD|QAR|ج\.?م|ر\.?س|د\.?إ|purchase|شراء|payment|دفع|transfer|تحويل|withdrawal|سحب|debit|credit|خصم|إيداع|InstaPay|Fawry|فوري|Vodafone Cash|فودافون/i;
  return financialKeywords.test(text);
}

// Example test data for development
export const SMS_TEST_DATA = [
  { body: "CIB: Purchase of EGP 250.00 at McDonald's on 15/01/2025. Card ending 4532.", sender: "CIB" },
  { body: "NBE: تم سحب مبلغ ج.م 1,500 من حسابك في ماكينة ATM بتاريخ 15/01/2025", sender: "NBE" },
  { body: "InstaPay: تم تحويل 500 ج.م إلى محمد أحمد بنجاح", sender: "InstaPay" },
  { body: "Fawry: Payment of EGP 150.00 for Vodafone bill. Ref: FW123456", sender: "Fawry" },
  { body: "Vodafone Cash: تم تحويل 200 ج.م إلى 01012345678", sender: "VF Cash" },
  { body: "Al Rajhi: Purchase of SAR 350 at Jarir Bookstore on 15/01/2025", sender: "AlRajhi" },
  { body: "Emirates NBD: AED 500.00 debited from your account at Carrefour", sender: "ENBD" },
  { body: "InstaPay: تم استلام 3,000 ج.م من شركة ABC المرتبات", sender: "InstaPay" },
];
