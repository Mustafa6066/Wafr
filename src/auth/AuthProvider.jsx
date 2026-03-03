// ─── Auth Provider — Supabase Authentication Context ───
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient.js';
import { useAuthStore, useProfileStore, useSubscriptionStore } from '../store/index.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const { user, setUser, setSession, setLoading, clear } = useAuthStore();
  const { setProfile } = useProfileStore();
  const { setSubscription } = useSubscriptionStore();
  const [initializing, setInitializing] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          await loadUserData(session.user.id);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setSession(session);
        await loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        clear();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data from Supabase
  const loadUserData = async (userId) => {
    try {
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setProfile({
          name: profile.name || '',
          country: profile.country || '',
          currency: profile.currency || 'EGP',
          income: profile.income || 0,
          topSpend: profile.top_spend || [],
          avgWaste: profile.avg_waste || 3000,
          onboarded: profile.onboarded || false,
        });
      }

      // Load subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (sub) {
        setSubscription({
          plan: sub.plan || 'free',
          status: sub.status || 'active',
          startDate: sub.current_period_start,
          trialEnd: sub.trial_end,
          stripeCustomerId: sub.stripe_customer_id,
        });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Sign up with email
  const signUpWithEmail = useCallback(async (email, password, name = '') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    return data;
  }, []);

  // Sign in with email
  const signInWithEmail = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  // Sign in with phone OTP
  const signInWithPhone = useCallback(async (phone) => {
    const { data, error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
    return data;
  }, []);

  // Verify phone OTP
  const verifyOTP = useCallback(async (phone, token) => {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw error;
    return data;
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
  }, []);

  // Sign in with Apple
  const signInWithApple = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clear();
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  }, []);

  // Update profile in Supabase
  const updateProfile = useCallback(async (updates) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        country: updates.country,
        currency: updates.currency,
        income: updates.income,
        top_spend: updates.topSpend,
        avg_waste: updates.avgWaste,
        onboarded: updates.onboarded,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (error) throw error;
    setProfile(updates);
  }, [user]);

  const value = {
    user,
    initializing,
    signUpWithEmail,
    signInWithEmail,
    signInWithPhone,
    verifyOTP,
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
    updateProfile,
    loadUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
