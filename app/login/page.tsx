'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function Login() {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
        setError('Something went wrong. Please try again.');
        return;
      }

      const data = await res.json();

      if (data.exists) {
        setStep('password');
        setError('');
      } else {
        router.push(`/auth/signup?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid password. Please try again.');
        setLoading(false);
        return;
      }

      router.push('/chat');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left Section - Hero (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-800 p-12 xl:p-16 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-xl">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Investio</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-5xl xl:text-6xl font-bold text-white leading-tight">
            AI-Powered<br />Investment Platform
          </h2>
          <p className="text-lg xl:text-xl text-blue-50/90 leading-relaxed max-w-md">
            Real-time market analysis, intelligent insights, and portfolio management in one platform.
          </p>

          <div className="space-y-4 pt-6">
            <div className="flex gap-3 items-center">
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-blue-50/90 text-base xl:text-lg">Real-time data from global markets</span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-blue-50/90 text-base xl:text-lg">AI-powered market analysis</span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-blue-50/90 text-base xl:text-lg">Portfolio tracking and insights</span>
            </div>
          </div>
        </div>

        <div className="relative z-10" />
      </div>

      {/* Right Section - Form */}
      <div className="flex lg:w-1/2 w-full flex-col items-center justify-center px-6 py-12 sm:px-8 sm:py-16 relative">
        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">Investio</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {step === 'email' ? 'Welcome back' : 'Enter your password'}
            </h1>
            <p className="text-slate-400 text-base">
              {step === 'email' 
                ? 'Sign in to your investment dashboard'
                : 'Please verify your identity'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex gap-3 rounded-xl bg-red-500/10 border border-red-500/30 p-4 backdrop-blur-sm">
              <svg className="h-5 w-5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3.5 text-white placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Checking...
                  </span>
                ) : 'Continue'}
              </button>

              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-slate-950 px-4 text-sm text-slate-500">or</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-400 mb-4">New to Investio?</p>
                <button
                  type="button"
                  onClick={() => router.push('/auth/signup')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 text-white font-medium transition-all"
                >
                  Create an account
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setPassword('');
                    setError('');
                  }}
                  className="flex-shrink-0 h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-300 transition-colors"
                  title="Change email"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Email</p>
                  <p className="font-semibold text-white text-sm truncate">{email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3.5 pr-12 text-white placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-500">
            By signing in, you agree to our{' '}
            <Link href="/terms-condition" className="text-blue-400 hover:text-blue-300 transition-colors">
              Terms and Conditions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
