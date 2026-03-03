import { Lock } from "lucide-react";
import React from 'react';
// ─── Privacy Engine — Layer 2 of 5-Layer Security Architecture ───
// On-device processing guarantees. Data classification & redaction.
// This module ensures that sensitive financial data NEVER leaves the device
// unless the user explicitly triggers a sync/export.
//
// Principles:
//  1. All notification/SMS parsing → 100% on-device
//  2. Raw bank text → NEVER stored, NEVER transmitted
//  3. AI Coach → only receives aggregated categories, never raw SMS
//  4. Audit log → metadata only (action + timestamp, no content)
//  5. User has full control: toggle auto-tracking, view/clear audit log

// ═══════════════════════════════════════════════════════════════
//  DATA CLASSIFICATION
// ═══════════════════════════════════════════════════════════════

const SENSITIVITY_LEVELS = {
  PUBLIC: 0,        // App version, theme preference
  INTERNAL: 1,      // Aggregated spending by category
  CONFIDENTIAL: 2,  // Individual transaction amounts
  RESTRICTED: 3,    // Bank names, account references
  FORBIDDEN: 4,     // OTP codes, raw SMS text, account numbers
};

/**
 * Classify what data can be sent to external APIs (AI Coach, analytics)
 * and what must remain strictly on-device.
 */
const DATA_RULES = {
  // ── What CAN be sent to AI Coach API ──
  ai_allowed: [
    'spending_by_category',      // "You spent 3000 EGP on food"
    'total_monthly_spending',    // "Your total spending is 15000 EGP"
    'savings_rate',              // "You save 20% of income"
    'goal_progress',             // "Emergency fund: 60% complete"
    'budget_status',             // "Over budget in food by 500 EGP"
    'user_name',                 // "Hey Mohamed"
    'user_country',              // "EG" — for localized advice
    'income_range',              // "medium" — not exact amount
    'top_spending_categories',   // ["food", "transport", "entertainment"]
    'streak_days',               // "7 day streak"
  ],

  // ── What must NEVER be sent to external APIs ──
  ai_blocked: [
    'raw_sms_text',              // Original bank SMS content
    'raw_notification_text',     // Original notification content
    'bank_account_number',       // Any account reference
    'card_number',               // Even last 4 digits
    'otp_code',                  // Verification codes
    'exact_income',              // Exact salary amount
    'merchant_raw_name',         // Raw merchant from SMS (use normalized only)
    'phone_number',              // User's phone
    'transaction_id',            // Bank reference numbers
  ],

  // ── What can be stored on-device ──
  local_storage: [
    'parsed_transaction_amount',
    'normalized_merchant_name',
    'transaction_category',
    'transaction_date',
    'transaction_source',        // "notification" | "receipt" | "manual"
    'audit_metadata',            // timestamp + action, no content
  ],
};

/**
 * Sanitize data before sending to AI Coach API.
 * Strips all restricted/forbidden fields, returns only aggregated data.
 *
 * @param {object} rawContext - Full user financial context
 * @returns {object} - Sanitized context safe for API transmission
 */
export function sanitizeForAI(rawContext) {
  return {
    // Safe aggregated data only
    userName: rawContext.name || 'User',
    country: rawContext.country || 'EG',
    incomeRange: categorizeIncome(rawContext.income),
    monthlySpending: rawContext.totalSpent || 0,
    savingsRate: rawContext.income > 0
      ? Math.round(((rawContext.income - rawContext.totalSpent) / rawContext.income) * 100)
      : 0,
    topCategories: rawContext.topCategories || [],
    goalCount: rawContext.goalCount || 0,
    goalProgress: rawContext.goalProgress || 0,
    streakDays: rawContext.streakDays || 0,
    budgetStatus: rawContext.budgetStatus || 'on_track',
    // Explicitly NOT included: raw SMS, bank details, account numbers, OTPs
  };
}

/**
 * Convert exact income to a range for privacy
 */
function categorizeIncome(income) {
  if (!income || income <= 0) return 'not_set';
  if (income < 5000) return 'low';
  if (income < 15000) return 'medium';
  if (income < 35000) return 'high';
  return 'very_high';
}

// ═══════════════════════════════════════════════════════════════
//  AUDIT LOG — Transparency Feature
// ═══════════════════════════════════════════════════════════════

const AUDIT_STORAGE_KEY = 'wafr-privacy-audit';
const MAX_AUDIT_ENTRIES = 200;

/**
 * Get the privacy audit log — shows what notifications the app saw
 * and what it did with each one (blocked/ignored/parsed).
 * Contains metadata ONLY, never raw content.
 */
export function getAuditLog() {
  try {
    const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Add an entry to the audit log
 * @param {object} entry - { timestamp, sender, textLength, action, reason }
 */
export function addAuditEntry(entry) {
  const log = getAuditLog();
  log.unshift({
    timestamp: entry.timestamp || Date.now(),
    sender: entry.sender || 'unknown',
    textLength: entry.textLength || 0,
    action: entry.action, // 'blocked' | 'ignored' | 'parsed'
    reason: entry.reason,
  });

  // Keep only last N entries
  if (log.length > MAX_AUDIT_ENTRIES) {
    log.length = MAX_AUDIT_ENTRIES;
  }

  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(log));
}

/**
 * Clear the audit log
 */
export function clearAuditLog() {
  localStorage.removeItem(AUDIT_STORAGE_KEY);
}

/**
 * Get audit statistics for the Trust Dashboard
 */
export function getAuditStats() {
  const log = getAuditLog();
  const stats = {
    total: log.length,
    blocked: 0,     // OTP messages that were hard-blocked
    ignored: 0,     // Non-financial notifications ignored
    parsed: 0,      // Transactions successfully parsed
    lastActivity: log.length > 0 ? log[0].timestamp : null,
  };

  for (const entry of log) {
    if (entry.action === 'blocked') stats.blocked++;
    else if (entry.action === 'ignored') stats.ignored++;
    else if (entry.action === 'parsed') stats.parsed++;
  }

  return stats;
}

// ═══════════════════════════════════════════════════════════════
//  PRIVACY POLICY HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Human-readable privacy guarantees for the Trust Screen
 */
export const PRIVACY_GUARANTEES = [
  {
    id: 'on_device',
    icon: React.createElement(Lock, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }),
    title: 'On-Device Processing',
    titleAr: 'معالجة على الجهاز',
    description: 'All bank notification parsing happens 100% on your device. Your raw bank messages never leave your phone.',
    descriptionAr: 'كل عمليات تحليل إشعارات البنك تتم 100% على جهازك. رسائل البنك الخام لا تغادر هاتفك أبداً.',
  },
  {
    id: 'no_otp',
    icon: '',
    title: 'OTP Auto-Block',
    titleAr: 'حظر تلقائي لرموز التحقق',
    description: 'Verification codes and OTPs are automatically detected and immediately discarded. We never see them.',
    descriptionAr: 'رموز التحقق يتم كشفها تلقائياً وحذفها فوراً. نحن لا نراها أبداً.',
  },
  {
    id: 'no_cloud',
    icon: '',
    title: 'No Cloud Upload',
    titleAr: 'بدون رفع سحابي',
    description: 'Your financial data stays on YOUR phone. We never upload your bank messages to any server.',
    descriptionAr: 'بياناتك المالية تبقى على هاتفك أنت. نحن لا نرفع رسائل البنك لأي خادم.',
  },
  {
    id: 'transparency',
    icon: '',
    title: 'Full Transparency',
    titleAr: 'شفافية كاملة',
    description: 'View a real-time log of every notification we processed — see exactly what was blocked, ignored, or parsed.',
    descriptionAr: 'اطلع على سجل فوري لكل إشعار تمت معالجته — شاهد بالضبط ما تم حظره أو تجاهله أو تحليله.',
  },
  {
    id: 'user_control',
    icon: '',
    title: 'You\'re in Control',
    titleAr: 'أنت المتحكم',
    description: 'Auto-tracking is OFF by default. You choose when to enable it, and can revoke access anytime.',
    descriptionAr: 'التتبع التلقائي مغلق افتراضياً. أنت تختار متى تفعّله، ويمكنك إيقافه في أي وقت.',
  },
];

/**
 * Get data rules for display in settings
 */
export function getDataRules() {
  return {
    sentToAI: DATA_RULES.ai_allowed,
    neverSent: DATA_RULES.ai_blocked,
    storedLocally: DATA_RULES.local_storage,
  };
}

export { SENSITIVITY_LEVELS, DATA_RULES };
