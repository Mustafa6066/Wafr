// ─── Notification Listener Parser — Layer 1 of 5-Layer Security Architecture ───
// Uses NotificationListenerService (Android) to read bank notifications
// WITHOUT needing READ_SMS permission. Zero access to SMS history or OTP codes.
//
// Architecture: Notification → OTP Filter → Sender Whitelist → Parse → On-Device Store
// Privacy guarantee: All processing happens 100% on-device. Raw notification text
// is NEVER uploaded, synced, or transmitted to any server.

import { parseSMS, isFinancialSMS } from './smsParser.js';
import { matchMerchant } from './merchantAI.js';

// ═══════════════════════════════════════════════════════════════
//  LAYER 3: Sender Whitelist — Known bank/fintech sender IDs
// ═══════════════════════════════════════════════════════════════

const TRUSTED_SENDERS = {
  // ── Egypt ──
  'CIB':            { bank: 'CIB',            country: 'EG', type: 'bank' },
  'NBE':            { bank: 'NBE',            country: 'EG', type: 'bank' },
  'QNB':            { bank: 'QNB',            country: 'EG', type: 'bank' },
  'BM':             { bank: 'Banque Misr',    country: 'EG', type: 'bank' },
  'Banque Misr':    { bank: 'Banque Misr',    country: 'EG', type: 'bank' },
  'AAIB':           { bank: 'AAIB',           country: 'EG', type: 'bank' },
  'BankMisr':       { bank: 'Banque Misr',    country: 'EG', type: 'bank' },
  'InstaPay':       { bank: 'InstaPay',       country: 'EG', type: 'payment' },
  'Fawry':          { bank: 'Fawry',          country: 'EG', type: 'payment' },
  'VF Cash':        { bank: 'Vodafone Cash',  country: 'EG', type: 'wallet' },
  'Vodafone Cash':  { bank: 'Vodafone Cash',  country: 'EG', type: 'wallet' },
  'Orange Money':   { bank: 'Orange Money',   country: 'EG', type: 'wallet' },
  'Etisalat Cash':  { bank: 'Etisalat Cash',  country: 'EG', type: 'wallet' },
  'e& cash':        { bank: 'Etisalat Cash',  country: 'EG', type: 'wallet' },
  'valU':           { bank: 'valU',           country: 'EG', type: 'bnpl' },
  'HSBC':           { bank: 'HSBC',           country: 'EG', type: 'bank' },
  'Mashreq':        { bank: 'Mashreq',        country: 'EG', type: 'bank' },
  'Alex Bank':      { bank: 'Alex Bank',      country: 'EG', type: 'bank' },
  // ── Saudi Arabia ──
  'AlRajhi':        { bank: 'Al Rajhi',       country: 'SA', type: 'bank' },
  'Al Rajhi':       { bank: 'Al Rajhi',       country: 'SA', type: 'bank' },
  'SNB':            { bank: 'SNB',            country: 'SA', type: 'bank' },
  'SABB':           { bank: 'SABB',           country: 'SA', type: 'bank' },
  'STC Pay':        { bank: 'STC Pay',        country: 'SA', type: 'wallet' },
  'stcpay':         { bank: 'STC Pay',        country: 'SA', type: 'wallet' },
  'Riyad Bank':     { bank: 'Riyad Bank',     country: 'SA', type: 'bank' },
  // ── UAE ──
  'ENBD':           { bank: 'Emirates NBD',   country: 'AE', type: 'bank' },
  'Emirates NBD':   { bank: 'Emirates NBD',   country: 'AE', type: 'bank' },
  'ADCB':           { bank: 'ADCB',           country: 'AE', type: 'bank' },
  'FAB':            { bank: 'FAB',            country: 'AE', type: 'bank' },
  'DIB':            { bank: 'DIB',            country: 'AE', type: 'bank' },
};

// ═══════════════════════════════════════════════════════════════
//  OTP & SENSITIVE CONTENT FILTER (Hard Block)
// ═══════════════════════════════════════════════════════════════

// These patterns identify OTP / verification messages. If ANY match,
// the notification is IMMEDIATELY discarded — never parsed, never stored.
const OTP_PATTERNS = [
  // English OTP keywords
  /\bOTP\b/i,
  /\bverification\s*code\b/i,
  /\bverify\s*code\b/i,
  /\bone[\s-]*time\s*(?:password|code|pin)\b/i,
  /\b(?:your|the)\s*code\s*(?:is|:)\s*\d{4,8}\b/i,
  /\bpin\s*(?:code|is|:)\s*\d{4,6}\b/i,
  /\b2FA\b/i,
  /\bsecurity\s*code\b/i,
  /\bauthentication\s*code\b/i,
  /\bconfirmation\s*code\b/i,
  /\bdo\s*not\s*share\b/i,
  /\bdon'?t\s*share\b/i,
  /\bexpires?\s*in\s*\d+\s*min/i,
  // Arabic OTP keywords
  /رمز\s*التحقق/,     // verification code
  /رمز\s*التأكيد/,     // confirmation code
  /كلمة\s*السر/,       // password
  /رمز\s*الدخول/,      // login code
  /كود\s*التحقق/,      // verification code (colloquial)
  /لا\s*تشارك/,        // don't share
  /لا\s*تعطي/,         // don't give
  /صالح\s*لمدة/,       // valid for (duration)
  /رمز\s*سري/,         // secret code
  /كلمة\s*مرور/,       // password
  /رقم\s*سري/,         // secret number
];

// 4-8 digit standalone number (common OTP format) without currency context
const BARE_OTP_PATTERN = /(?:^|\s)\d{4,8}(?:\s|$)/;
const HAS_CURRENCY = /EGP|SAR|AED|KWD|QAR|ج\.?م|ر\.?س|د\.?إ|د\.?ك|ر\.?ق/i;

/**
 * Layer 1+3 OTP filter: Returns true if the text is an OTP/verification message.
 * This check runs BEFORE any parsing — OTP content is never processed.
 * @param {string} text - Notification text content
 * @returns {boolean}
 */
export function isOTPMessage(text) {
  if (!text) return false;

  // Check explicit OTP patterns (high confidence)
  for (const pattern of OTP_PATTERNS) {
    if (pattern.test(text)) return true;
  }

  // If it has a bare 4-8 digit number but NO currency indicators, likely OTP
  if (BARE_OTP_PATTERN.test(text) && !HAS_CURRENCY.test(text)) {
    // Additional check: short messages with only digits are likely OTP
    if (text.replace(/\s/g, '').length < 50) return true;
  }

  return false;
}

/**
 * Check if sender is a known trusted financial institution
 * @param {string} sender - Notification sender/app package name
 * @returns {{ trusted: boolean, info: object|null }}
 */
export function checkSender(sender) {
  if (!sender) return { trusted: false, info: null };

  // Direct match
  if (TRUSTED_SENDERS[sender]) {
    return { trusted: true, info: TRUSTED_SENDERS[sender] };
  }

  // Partial match (sender ID may contain extra text)
  const normalized = sender.trim();
  for (const [key, info] of Object.entries(TRUSTED_SENDERS)) {
    if (normalized.toLowerCase().includes(key.toLowerCase())) {
      return { trusted: true, info };
    }
  }

  return { trusted: false, info: null };
}

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATION PROCESSING PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Process a single notification through the full 5-layer security pipeline:
 *
 *  1. OTP Hard Block     → Discard if OTP/verification content detected
 *  2. Sender Whitelist   → Check if from a known bank/fintech
 *  3. Financial Filter   → Quick keyword check for transaction indicators
 *  4. Transaction Parse  → Extract amount, merchant, category using smsParser
 *  5. Merchant Classify  → AI-powered category assignment
 *
 * @param {object} notification
 * @param {string} notification.text      - Notification body text
 * @param {string} notification.sender    - Sender ID or app package name
 * @param {string} [notification.title]   - Notification title (optional)
 * @param {number} [notification.time]    - Timestamp (optional, defaults to now)
 * @returns {{ result: 'blocked'|'ignored'|'parsed', reason: string, transaction: object|null, audit: object }}
 */
export function processNotification(notification) {
  const { text, sender, title = '', time = Date.now() } = notification;
  const fullText = `${title} ${text}`.trim();

  // Audit log entry — what the app saw vs. what it did (transparency feature)
  const audit = {
    timestamp: time,
    sender: sender || 'unknown',
    textLength: fullText.length,
    action: null,
    reason: null,
    // NEVER store raw text in audit — only metadata for privacy
  };

  // ─── Layer 1: OTP Hard Block ───
  if (isOTPMessage(fullText)) {
    audit.action = 'blocked';
    audit.reason = 'OTP/verification content detected';
    return { result: 'blocked', reason: 'otp_detected', transaction: null, audit };
  }

  // ─── Layer 3: Sender Whitelist ───
  const { trusted, info: senderInfo } = checkSender(sender);

  // If sender is unknown AND text doesn't look financial, ignore
  if (!trusted && !isFinancialSMS(fullText)) {
    audit.action = 'ignored';
    audit.reason = 'Unknown sender, non-financial content';
    return { result: 'ignored', reason: 'not_financial', transaction: null, audit };
  }

  // ─── Layer 4: Transaction Parsing ───
  const parsed = parseSMS(fullText, sender);

  if (!parsed) {
    audit.action = 'ignored';
    audit.reason = trusted ? 'Trusted sender but no transaction data found' : 'Could not extract transaction';
    return { result: 'ignored', reason: 'parse_failed', transaction: null, audit };
  }

  // ─── Layer 5: Merchant Classification ───
  let category = 'other';
  let merchantName = parsed.merchant || '';

  if (merchantName) {
    const classification = matchMerchant(merchantName);
    if (classification && classification.confidence >= 50) {
      category = classification.category;
      merchantName = classification.matchedMerchant || merchantName;
    }
  }

  // Boost confidence if sender is trusted
  const confidenceBoost = trusted ? 15 : 0;
  const finalConfidence = Math.min(parsed.confidence + confidenceBoost, 99);

  const transaction = {
    id: crypto.randomUUID(),
    source: 'notification',
    rawText: '', // NEVER store raw notification text — privacy by design
    parsedAmount: parsed.amount,
    parsedMerchant: merchantName,
    parsedDate: parsed.date?.toISOString() || new Date(time).toISOString(),
    categorySuggestion: category,
    confidence: finalConfidence / 100,
    bank: senderInfo?.bank || parsed.bank || 'Unknown',
    country: senderInfo?.country || parsed.country || null,
    currency: parsed.currency || 'EGP',
    type: parsed.type || 'debit',
    processed: false,
    approved: null,
    createdAt: new Date().toISOString(),
  };

  audit.action = 'parsed';
  audit.reason = `Transaction: ${parsed.currency} ${parsed.amount} at ${merchantName}`;

  return { result: 'parsed', reason: 'transaction_found', transaction, audit };
}

/**
 * Process a batch of notifications
 * @param {Array<object>} notifications
 * @returns {{ transactions: Array, blocked: number, ignored: number, parsed: number, auditLog: Array }}
 */
export function processNotificationBatch(notifications) {
  const results = { transactions: [], blocked: 0, ignored: 0, parsed: 0, auditLog: [] };

  for (const notification of notifications) {
    const { result, transaction, audit } = processNotification(notification);

    results.auditLog.push(audit);

    if (result === 'blocked') results.blocked++;
    else if (result === 'ignored') results.ignored++;
    else if (result === 'parsed' && transaction) {
      results.parsed++;
      results.transactions.push(transaction);
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATION LISTENER BRIDGE (Web  Native)
// ═══════════════════════════════════════════════════════════════

// In a PWA/web context, the NotificationListenerService doesn't exist natively.
// This bridge provides the interface that a future React Native / Capacitor
// wrapper or Android WebView bridge would connect to.
//
// For the web MVP, we simulate it with:
// 1. Manual SMS paste (user pastes their bank notification text)
// 2. Push notification subscription (future: bank webhook integration)
// 3. Demo mode with test data

let notificationCallback = null;
let auditLogCallback = null;

/**
 * Register a callback for when new notifications are processed
 */
export function onNotificationProcessed(callback) {
  notificationCallback = callback;
}

/**
 * Register a callback for audit log entries (transparency feature)
 */
export function onAuditLog(callback) {
  auditLogCallback = callback;
}

/**
 * Simulate receiving a notification (for demo mode and manual paste)
 * @param {string} text - The notification/SMS text
 * @param {string} sender - The sender ID
 */
export function simulateNotification(text, sender = '') {
  const result = processNotification({ text, sender, time: Date.now() });

  if (auditLogCallback) {
    auditLogCallback(result.audit);
  }

  if (result.result === 'parsed' && result.transaction && notificationCallback) {
    notificationCallback(result.transaction);
  }

  return result;
}

/**
 * Get the list of all supported banks/fintechs for display
 */
export function getSupportedBanks() {
  const banks = new Map();
  for (const [, info] of Object.entries(TRUSTED_SENDERS)) {
    const key = `${info.bank}-${info.country}`;
    if (!banks.has(key)) {
      banks.set(key, { name: info.bank, country: info.country, type: info.type });
    }
  }
  return Array.from(banks.values());
}

// ═══════════════════════════════════════════════════════════════
//  TEST DATA — Demo notifications for onboarding & testing
// ═══════════════════════════════════════════════════════════════

export const DEMO_NOTIFICATIONS = [
  // Egyptian bank transactions
  { text: "CIB: Purchase of EGP 250.00 at McDonald's on 15/01/2026. Card ending 4532.", sender: "CIB" },
  { text: "NBE: تم سحب مبلغ ج.م 1,500 من حسابك في ماكينة ATM بتاريخ 15/01/2026", sender: "NBE" },
  { text: "InstaPay: تم تحويل 500 ج.م إلى محمد أحمد بنجاح", sender: "InstaPay" },
  { text: "Fawry: Payment of EGP 150.00 for Vodafone bill. Ref: FW123456", sender: "Fawry" },
  { text: "Vodafone Cash: تم تحويل 200 ج.م إلى 01012345678", sender: "VF Cash" },

  // OTP messages that MUST be blocked
  { text: "رمز التحقق الخاص بك هو 4829. لا تشارك هذا الرمز", sender: "CIB" },
  { text: "Your OTP is 583921. Do not share this code with anyone.", sender: "NBE" },
  { text: "Verification code: 7291. Expires in 5 minutes.", sender: "InstaPay" },

  // Non-financial notifications (should be ignored)
  { text: "Your package has been delivered!", sender: "Aramex" },
  { text: "Enjoy 20% off on your next order!", sender: "Talabat" },

  // Saudi transactions
  { text: "Al Rajhi: Purchase of SAR 350 at Jarir Bookstore on 15/01/2026", sender: "AlRajhi" },

  // UAE transactions
  { text: "Emirates NBD: AED 500.00 debited from your account at Carrefour", sender: "ENBD" },
];
