import React, { useState } from 'react';
import {
  X,
  Globe,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  initialTab?: 'signin' | 'signup' | 'forgot';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  initialTab = 'signin',
  onSuccess
}) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    resetPassword,
    authError,
    clearAuthError
  } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || authError;

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setLocalError(null);
    clearAuthError();
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (tab === 'forgot') {
      setSubmitting(true);
      try {
        await resetPassword(email.trim());
        setResetSent(true);
      } catch (err: any) {
        setLocalError(err.message || 'Failed to send password reset email.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (tab === 'signup') {
      if (!fullName.trim()) {
        setLocalError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }

      setSubmitting(true);
      try {
        await registerWithEmail(fullName.trim(), email.trim(), password);
        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        setLocalError(err.message);
      } finally {
        setSubmitting(false);
      }
    } else {
      // Sign In
      setSubmitting(true);
      try {
        await signInWithEmail(email.trim(), password);
        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        setLocalError(err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/20 mb-1">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white font-serif tracking-tight">
            Go<span className="text-amber-400">Global</span>
          </h2>
          <p className="text-xs text-slate-400">
            {tab === 'signin' && 'Welcome back! Sign in to share and discover cultures.'}
            {tab === 'signup' && 'Create your cultural profile to start contributing.'}
            {tab === 'forgot' && 'Reset your password to regain account access.'}
          </p>
        </div>

        {/* Continue with Google (Real Firebase Auth) */}
        {tab !== 'forgot' && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Or with Email
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
          </div>
        )}

        {/* Error / Success Feedback */}
        {displayError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {resetSent && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Password reset email sent! Check your inbox to set a new password.</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          
          {tab === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">Password</label>
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setLocalError(null);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {tab === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {tab === 'signin' && 'Sign In to GoGlobal'}
                  {tab === 'signup' && 'Create Free Account'}
                  {tab === 'forgot' && 'Send Password Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Tab Toggle Switchers */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          {tab === 'signin' && (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setLocalError(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold ml-1"
              >
                Create Account
              </button>
            </p>
          )}

          {tab === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setLocalError(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold ml-1"
              >
                Sign In
              </button>
            </p>
          )}

          {tab === 'forgot' && (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setLocalError(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold ml-1"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
