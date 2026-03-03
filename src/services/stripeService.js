// ─── Stripe Service — subscription payment integration ───
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabaseClient.js';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise && STRIPE_KEY) {
    stripePromise = loadStripe(STRIPE_KEY);
  }
  return stripePromise;
};

// Subscription plan IDs (set these in Stripe Dashboard)
export const PLAN_IDS = {
  pro_monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY || 'price_pro_monthly',
  pro_yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY || 'price_pro_yearly',
  family_monthly: import.meta.env.VITE_STRIPE_FAMILY_MONTHLY || 'price_family_monthly',
  family_yearly: import.meta.env.VITE_STRIPE_FAMILY_YEARLY || 'price_family_yearly',
};

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'EGP',
    features: [
      '50 manual expenses/month',
      '1 savings goal',
      '3 AI coach messages/day',
      'Basic insights',
      'Daily challenges',
    ],
    limits: {
      expenses: 50,
      goals: 1,
      aiMessages: 3,
      budgets: 3,
      recurring: 0,
      billSplits: 0,
      familyMembers: 0,
      hasReceipts: false,
      hasCashFlow: false,
      hasHealthScore: false,
      hasDebtTracker: false,
      hasZakat: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 49.99,
    yearlyPrice: 399.99,
    currency: 'EGP',
    stripePriceMonthly: PLAN_IDS.pro_monthly,
    stripePriceYearly: PLAN_IDS.pro_yearly,
    badge: 'POPULAR',
    features: [
      'Unlimited expenses',
      'Auto SMS tracking',
      'Receipt scanner (OCR)',
      'Unlimited AI coach',
      'Advanced insights & charts',
      '10 savings goals',
      'Recurring tracker',
      'Cash flow forecast',
      'Financial health score',
      'Debt payoff planner',
      'Zakat calculator',
      'Bill splitting',
      'Data export (CSV/PDF)',
    ],
    limits: {
      expenses: Infinity,
      goals: 10,
      aiMessages: Infinity,
      budgets: Infinity,
      recurring: Infinity,
      billSplits: Infinity,
      familyMembers: 0,
      hasReceipts: true,
      hasCashFlow: true,
      hasHealthScore: true,
      hasDebtTracker: true,
      hasZakat: true,
    },
  },
  {
    id: 'family',
    name: 'Family',
    monthlyPrice: 79.99,
    yearlyPrice: 649.99,
    currency: 'EGP',
    stripePriceMonthly: PLAN_IDS.family_monthly,
    stripePriceYearly: PLAN_IDS.family_yearly,
    badge: 'BEST VALUE',
    features: [
      'Everything in Pro',
      'Up to 6 family members',
      'Individual allowances & limits',
      'Family spending overview',
      'Parental controls',
      'Shared savings pots',
      'Priority support',
    ],
    limits: {
      expenses: Infinity,
      goals: Infinity,
      aiMessages: Infinity,
      budgets: Infinity,
      recurring: Infinity,
      billSplits: Infinity,
      familyMembers: 6,
      hasReceipts: true,
      hasCashFlow: true,
      hasHealthScore: true,
      hasDebtTracker: true,
      hasZakat: true,
    },
  },
];

// ─── Checkout Session ───
// Uses Supabase Edge Function to create Stripe checkout session
export async function createCheckoutSession(planId, billingCycle = 'monthly') {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan || plan.id === 'free') return null;

  const priceId = billingCycle === 'yearly' ? plan.stripePriceYearly : plan.stripePriceMonthly;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Call Supabase Edge Function to create Stripe checkout
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        priceId,
        planId: plan.id,
        billingCycle,
        returnUrl: window.location.origin + '/settings?tab=subscription',
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No checkout URL returned');

    // Redirect to Stripe Checkout
    window.location.href = data.url;
    return data;
  } catch (err) {
    console.error('Checkout error:', err);
    // Fallback: try client-side checkout
    return createClientCheckout(priceId);
  }
}

// Client-side Stripe Checkout fallback
async function createClientCheckout(priceId) {
  const stripe = await getStripe();
  if (!stripe) {
    console.error('Stripe not loaded — check VITE_STRIPE_PUBLISHABLE_KEY');
    return null;
  }

  try {
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: window.location.origin + '/settings?tab=subscription&success=true',
      cancelUrl: window.location.origin + '/settings?tab=subscription&canceled=true',
    });
    if (error) throw error;
  } catch (err) {
    console.error('Client checkout error:', err);
    return null;
  }
}

// ─── Manage Subscription ───
export async function openCustomerPortal() {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal', {
      body: { returnUrl: window.location.origin + '/settings?tab=subscription' },
    });
    if (error) throw error;
    if (data?.url) window.location.href = data.url;
    return data;
  } catch (err) {
    console.error('Portal error:', err);
    return null;
  }
}

// ─── Subscription Status ───
export async function getSubscriptionStatus() {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (err) {
    console.error('Subscription fetch error:', err);
    return null;
  }
}

// ─── Check Feature Access ───
export function canAccess(subscription, feature) {
  const plan = PLANS.find(p => p.id === (subscription?.plan || 'free'));
  if (!plan) return false;

  // Check trial
  if (subscription?.status === 'trialing') {
    const trialEnd = new Date(subscription.trial_end);
    if (trialEnd > new Date()) return true;
  }

  // Check active subscription
  if (subscription?.status !== 'active' && subscription?.status !== 'trialing') {
    return PLANS[0].limits[feature] ?? false; // free plan
  }

  return plan.limits[feature] ?? false;
}

export function getPlan(subscription) {
  return PLANS.find(p => p.id === (subscription?.plan || 'free')) || PLANS[0];
}

export function isProUser(subscription) {
  return canAccess(subscription, 'hasReceipts');
}

export function isFamilyUser(subscription) {
  return (getPlan(subscription).limits.familyMembers || 0) > 0;
}

// ─── Trial Management ───
export function getTrialDaysLeft(subscription) {
  if (subscription?.status !== 'trialing' || !subscription?.trial_end) return 0;
  const end = new Date(subscription.trial_end);
  const now = new Date();
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

// ─── Offline / Demo Mode ───
// When Stripe is not configured, use localStorage for subscription state
export function isStripeConfigured() {
  return !!STRIPE_KEY;
}

export function setDemoSubscription(planId) {
  localStorage.setItem('wafrDemoSub', JSON.stringify({
    plan: planId,
    status: 'active',
    trial_end: null,
    current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

export function getDemoSubscription() {
  try {
    return JSON.parse(localStorage.getItem('wafrDemoSub'));
  } catch {
    return null;
  }
}
