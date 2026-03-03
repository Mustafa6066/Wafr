// ─── Login Screen — Phone OTP + Email + Social Auth ───
import { useState } from 'react';
import { useAuth } from './AuthProvider.jsx';
import { THEME } from '../constants.js';

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithPhone, verifyOTP, signInWithGoogle, signInWithApple, resetPassword } = useAuth();
  const [mode, setMode] = useState('login'); // login | signup | phone | otp | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailAuth = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, name);
        setMessage('Check your email for verification link!');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    setError(''); setLoading(true);
    try {
      await signInWithPhone(phone);
      setMode('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError(''); setLoading(true);
    try {
      await verifyOTP(phone, otp);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(''); setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Password reset link sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: THEME.white06, border: `1px solid ${THEME.white10}`,
    borderRadius: 14, padding: '14px 16px', color: THEME.white, fontSize: 15,
    outline: 'none', marginBottom: 12, fontFamily: THEME.font, boxSizing: 'border-box',
  };

  const btnPrimary = {
    width: '100%', background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: THEME.bg, border: 'none', borderRadius: 16, padding: '16px',
    fontSize: 16, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
    fontFamily: THEME.font, boxShadow: `0 8px 32px ${THEME.accentGlow}`,
    opacity: loading ? 0.7 : 1, marginBottom: 12,
  };

  const btnSocial = {
    width: '100%', background: THEME.white06, border: `1px solid ${THEME.white10}`,
    borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', fontFamily: THEME.font, color: THEME.white,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10,
  };

  const linkBtn = {
    background: 'none', border: 'none', color: THEME.accent, fontSize: 14,
    cursor: 'pointer', fontFamily: THEME.font, fontWeight: 600, padding: 4,
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', padding: '40px 24px',
      background: `linear-gradient(160deg, ${THEME.bg} 0%, ${THEME.bgSecondary} 40%, ${THEME.bgTertiary} 100%)`,
    }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, margin: '0 auto 16px',
            background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
            boxShadow: `0 16px 48px ${THEME.accentGlow}`,
          }}>💰</div>
          <h1 style={{ fontFamily: THEME.fontSerif, fontSize: 36, color: THEME.white, margin: '0 0 4px' }}>Wafr</h1>
          <p style={{ fontFamily: THEME.fontArabic, fontSize: 20, color: THEME.accent, margin: 0 }}>وفّر</p>
        </div>

        {/* Error / Success messages */}
        {error && (
          <div style={{
            background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 16,
          }}>
            <p style={{ color: THEME.red, fontSize: 13, margin: 0, fontFamily: THEME.font }}>{error}</p>
          </div>
        )}
        {message && (
          <div style={{
            background: 'rgba(0,212,170,0.1)', border: `1px solid rgba(0,212,170,0.3)`,
            borderRadius: 12, padding: '12px 16px', marginBottom: 16,
          }}>
            <p style={{ color: THEME.accent, fontSize: 13, margin: 0, fontFamily: THEME.font }}>{message}</p>
          </div>
        )}

        {/* Phone OTP Flow */}
        {mode === 'phone' && (
          <>
            <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 700, margin: '0 0 8px', fontFamily: THEME.font }}>
              Sign in with Phone
            </h2>
            <p style={{ color: THEME.white50, fontSize: 14, margin: '0 0 20px', fontFamily: THEME.font }}>
              We'll send you a verification code
            </p>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+20 1XX XXX XXXX" type="tel" style={inputStyle} />
            <button onClick={handlePhoneAuth} disabled={loading || !phone} style={btnPrimary}>
              {loading ? 'Sending...' : 'Send Code'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setMode('login')} style={linkBtn}>Use email instead</button>
            </div>
          </>
        )}

        {/* OTP Verification */}
        {mode === 'otp' && (
          <>
            <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 700, margin: '0 0 8px', fontFamily: THEME.font }}>
              Enter Verification Code
            </h2>
            <p style={{ color: THEME.white50, fontSize: 14, margin: '0 0 20px', fontFamily: THEME.font }}>
              Sent to {phone}
            </p>
            <input value={otp} onChange={e => setOtp(e.target.value)}
              placeholder="Enter 6-digit code" inputMode="numeric" maxLength={6} style={{
                ...inputStyle, textAlign: 'center', fontSize: 24, letterSpacing: 8,
              }} />
            <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6} style={btnPrimary}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setMode('phone')} style={linkBtn}>Resend code</button>
            </div>
          </>
        )}

        {/* Forgot Password */}
        {mode === 'forgot' && (
          <>
            <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 700, margin: '0 0 8px', fontFamily: THEME.font }}>
              Reset Password
            </h2>
            <p style={{ color: THEME.white50, fontSize: 14, margin: '0 0 20px', fontFamily: THEME.font }}>
              Enter your email to receive a reset link
            </p>
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" type="email" style={inputStyle} />
            <button onClick={handleForgotPassword} disabled={loading || !email} style={btnPrimary}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setMode('login')} style={linkBtn}>Back to login</button>
            </div>
          </>
        )}

        {/* Email Login / Signup */}
        {(mode === 'login' || mode === 'signup') && (
          <>
            <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 700, margin: '0 0 8px', fontFamily: THEME.font }}>
              {mode === 'login' ? 'Welcome back!' : 'Create your account'}
            </h2>
            <p style={{ color: THEME.white50, fontSize: 14, margin: '0 0 24px', fontFamily: THEME.font }}>
              {mode === 'login' ? 'Sign in to continue saving' : 'Start your savings journey'}
            </p>

            {mode === 'signup' && (
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name" style={inputStyle} />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" type="email" style={inputStyle} />
            <input value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" type="password" style={inputStyle} />

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: 12 }}>
                <button onClick={() => { setMode('forgot'); setError(''); setMessage(''); }} style={linkBtn}>
                  Forgot password?
                </button>
              </div>
            )}

            <button onClick={handleEmailAuth} disabled={loading || !email || !password} style={btnPrimary}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 16px' }}>
              <div style={{ flex: 1, height: 1, background: THEME.white10 }} />
              <span style={{ color: THEME.white30, fontSize: 12, fontFamily: THEME.font }}>or</span>
              <div style={{ flex: 1, height: 1, background: THEME.white10 }} />
            </div>

            {/* Phone button */}
            <button onClick={() => { setMode('phone'); setError(''); setMessage(''); }} style={btnSocial}>
              📱 Continue with Phone
            </button>

            {/* Social buttons */}
            <button onClick={signInWithGoogle} style={btnSocial}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <button onClick={signInWithApple} style={btnSocial}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Continue with Apple
            </button>

            {/* Toggle login/signup */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span style={{ color: THEME.white40, fontSize: 14, fontFamily: THEME.font }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}
                style={linkBtn}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>

            {/* Skip auth for demo */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button onClick={() => {
                // Set a demo flag in localStorage to bypass auth
                localStorage.setItem('wafr-demo-mode', 'true');
                window.location.reload();
              }} style={{
                background: 'none', border: `1px solid ${THEME.white10}`, borderRadius: 12,
                padding: '10px 24px', color: THEME.white30, fontSize: 13, cursor: 'pointer',
                fontFamily: THEME.font,
              }}>
                Try without account (Demo Mode)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
