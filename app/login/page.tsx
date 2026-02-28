'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

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

      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
      {/* Animated gradient background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative flex w-full flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="mb-10 space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Investio
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              Professional investment dashboard
            </p>
          </div>

          {/* Main Card */}
          <div className="space-y-6 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-800/40 to-slate-900/60 p-8 backdrop-blur-xl shadow-2xl shadow-slate-900/50">
            {/* Error Alert */}
            {error && (
              <div className="flex gap-3 rounded-xl bg-red-950/40 border border-red-900/60 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            )}

            {step === 'email' ? (
              /* Email Step */
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-200">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-slate-600/50 bg-slate-900/50 px-4 py-3 text-base text-white placeholder-slate-500 transition-all duration-200 focus:border-blue-500/50 focus:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:border-slate-500/70"
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    We'll check if you have an account
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white text-base transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Checking...</span>
                    </span>
                  ) : (
                    'Continue'
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700/50" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-slate-900/60 px-3 text-xs text-slate-500 font-medium">
                      Don't have an account?
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/auth/signup')}
                  className="w-full rounded-xl border border-slate-600/50 bg-slate-900/20 py-3 font-medium text-slate-300 text-base transition-all duration-200 hover:bg-slate-900/40 hover:border-slate-500/70 active:bg-slate-900/50"
                >
                  Create Account
                </button>
              </form>
            ) : (
              /* Password Step */
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Email Display and Back Button */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setPassword('');
                      setError('');
                    }}
                    className="flex-shrink-0 h-9 w-9 rounded-lg border border-slate-600/50 bg-slate-900/50 flex items-center justify-center text-slate-400 hover:text-slate-300 hover:bg-slate-900/70 transition-all duration-200"
                    title="Go back to email"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 font-medium">Signing in to</p>
                    <p className="font-semibold text-white text-sm truncate">{email}</p>
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-200">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-600/50 bg-slate-900/50 px-4 py-3 pr-12 text-base text-white placeholder-slate-500 transition-all duration-200 focus:border-blue-500/50 focus:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:border-slate-500/70"
                      disabled={loading}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200 p-1 rounded hover:bg-slate-800/50"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 1.657-.672 3.157-1.757 4.243A6 6 0 0121 12a6 6 0 00-9.757-5.657M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white text-base transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-600 font-medium">
            By signing in, you agree to our <a href="#" className="text-slate-400 hover:text-slate-300 underline transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}

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

      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex w-full flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 space-y-3 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Investio</h1>
            </div>
            <p className="text-sm text-slate-400">
              Professional investment dashboard
            </p>
          </div>

          {/* Form Container */}
          <div className="space-y-6 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-800/50 to-slate-900/80 p-8 backdrop-blur-sm">
            {error && (
              <div className="flex gap-3 rounded-lg bg-red-950/40 border border-red-900/60 p-4">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-600/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-blue-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    disabled={loading}
                    autoComplete="email"
                  />
                  <p className="text-xs text-slate-500">
                    Enter your email to get started
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Checking...
                    </span>
                  ) : (
                    'Continue'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700" />
                  </div>
                  <div className="relative flex justify-center items-center text-sm">
                    <span className="bg-slate-800 px-2 text-slate-500">
                      or
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push('/auth/signup')
                  }
                  className="w-full rounded-lg border border-slate-600/50 bg-slate-900/30 py-3 font-medium text-slate-300 transition-all hover:bg-slate-900/50 hover:border-slate-500"
                >
                  Create New Account
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setPassword('');
                        setError('');
                      }}
                      className="h-8 w-8 rounded-lg border border-slate-600/50 bg-slate-900/50 flex items-center justify-center text-slate-400 hover:text-slate-300 transition"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <div className="flex-1">
                      <p className="text-sm text-slate-400">
                        Signing in as
                      </p>
                      <p className="font-medium text-white break-all text-sm">{email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-600/50 bg-slate-900/50 px-4 py-3 pr-12 text-white placeholder-slate-500 transition-all focus:border-blue-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 4.5c2.613 0 5.088.875 7.082 2.338a1 1 0 00.894-1.788C14.172 3.156 12.115 2.5 10 2.5a9 9 0 00-7.082 3.938 1 1 0 10.894 1.788C4.912 5.375 7.387 4.5 10 4.5zm6.084 9.116c.177.269.348.547.504.835a1 1 0 01-1.788.894c-.143-.214-.28-.43-.41-.647m-2.906-2.906a1 1 0 10-1.414-1.414 3 3 0 104.242 4.242 1 1 0 10-1.414-1.414 1 1 0 00-.414.914z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-500">
            By signing in, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
