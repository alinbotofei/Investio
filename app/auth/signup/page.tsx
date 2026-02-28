'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const validatePassword = (pwd: string) => {
    if (!pwd) return 'Password is required';
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Must contain uppercase letter (A-Z)';
    if (!/[0-9]/.test(pwd)) return 'Must contain a number (0-9)';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Must contain special char (!@#$%^&*...)';
    return '';
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!name) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || 'Registration failed' });
        setLoading(false);
        return;
      }

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setErrors({ submit: 'Sign in failed. Please try again.' });
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
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
              Create your account
            </p>
          </div>

          {/* Main Card */}
          <div className="space-y-6 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-800/40 to-slate-900/60 p-8 backdrop-blur-xl shadow-2xl shadow-slate-900/50">
            {/* Error Alert */}
            {errors.submit && (
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
                <p className="text-sm text-red-300 font-medium">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={`w-full rounded-xl border transition-all duration-200 px-4 py-3 text-base text-white placeholder-slate-500 focus:outline-none ${
                    errors.name
                      ? 'border-red-500/50 bg-red-950/20 focus:ring-2 focus:ring-red-500/30'
                      : 'border-slate-600/50 bg-slate-900/50 hover:border-slate-500/70 focus:border-blue-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-blue-500/30'
                  }`}
                  disabled={loading}
                  autoComplete="name"
                  required
                />
                {errors.name && (
                  <p className="flex items-center gap-1 text-xs text-red-400 font-medium">
                    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586 5.314 11.9a1 1 0 10-1.414 1.414l6 6a1 1 0 001.414 0l8.101-8.1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border transition-all duration-200 px-4 py-3 text-base text-white placeholder-slate-500 focus:outline-none ${
                    errors.email
                      ? 'border-red-500/50 bg-red-950/20 focus:ring-2 focus:ring-red-500/30'
                      : 'border-slate-600/50 bg-slate-900/50 hover:border-slate-500/70 focus:border-blue-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-blue-500/30'
                  }`}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-red-400 font-medium">
                    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586 5.314 11.9a1 1 0 10-1.414 1.414l6 6a1 1 0 001.414 0l8.101-8.1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
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
                    placeholder="Create a strong password"
                    className={`w-full rounded-xl border transition-all duration-200 px-4 py-3 pr-12 text-base text-white placeholder-slate-500 focus:outline-none ${
                      errors.password
                        ? 'border-red-500/50 bg-red-950/20 focus:ring-2 focus:ring-red-500/30'
                        : 'border-slate-600/50 bg-slate-900/50 hover:border-slate-500/70 focus:border-blue-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-blue-500/30'
                    }`}
                    disabled={loading}
                    autoComplete="new-password"
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
                {errors.password ? (
                  <p className="flex items-center gap-1 text-xs text-red-400 font-medium">
                    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586 5.314 11.9a1 1 0 10-1.414 1.414l6 6a1 1 0 001.414 0l8.101-8.1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                ) : password ? (
                  <p className="flex items-center gap-1 text-xs text-green-400 font-medium">
                    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Password is valid
                  </p>
                ) : null}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full rounded-xl border transition-all duration-200 px-4 py-3 pr-12 text-base text-white placeholder-slate-500 focus:outline-none ${
                      errors.confirmPassword
                        ? 'border-red-500/50 bg-red-950/20 focus:ring-2 focus:ring-red-500/30'
                        : 'border-slate-600/50 bg-slate-900/50 hover:border-slate-500/70 focus:border-blue-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-blue-500/30'
                    }`}
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200 p-1 rounded hover:bg-slate-800/50"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
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
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-xs text-red-400 font-medium">
                    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586 5.314 11.9a1 1 0 10-1.414 1.414l6 6a1 1 0 001.414 0l8.101-8.1z" clipRule="evenodd" />
                    </svg>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white text-base transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating account...</span>
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Sign in link */}
            <div className="pt-4 border-t border-slate-700/30">
              <p className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-600 font-medium">
            By creating an account, you agree to our <a href="#" className="text-slate-400 hover:text-slate-300 underline transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!name) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Must contain uppercase letter (A-Z)';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Must contain a number (0-9)';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = 'Must contain special char (!@#$%^&*...)';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || 'Registration failed' });
        setLoading(false);
        return;
      }

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setErrors({ submit: 'Sign in failed. Please try again.' });
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
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
              Create your account to get started
            </p>
          </div>

          {/* Form Container */}
          <div className="space-y-6 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-800/50 to-slate-900/80 p-8 backdrop-blur-sm">
            {errors.submit && (
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
                <p className="text-sm text-red-300">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={`w-full rounded-lg border ${
                    errors.name
                      ? 'border-red-500/50 bg-red-950/20'
                      : 'border-slate-600/50 bg-slate-900/50'
                  } px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-blue-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={loading}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="flex items-center gap-1 text-xs text-red-400">
                    <svg
                      className="h-3 w-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586 5.314 11.9a1 1 0 10-1.414 1.414l6 6a1 1 0 001.414 0l8.101-8.1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-lg border ${
                    errors.email
                      ? 'border-red-500/50 bg-red-950/20'
                      : 'border-slate-600/50 bg-slate-900/50'
                  } px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-blue-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-red-400">
                    <svg
                      className="h-3 w-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586 5.314 11.9a1 1 0 10-1.414 1.414l6 6a1 1 0 001.414 0l8.101-8.1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.email}
                  </p>
                )}
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
                    className={`w-full rounded-lg border ${
                      errors.password
                        ? 'border-red-500/50 bg-red-950/20'
                        : 'border-slate-600/50 bg-slate-900/50'
                    } px-4 py-3 pr-12 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    disabled={loading}
                    autoComplete="new-password"
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
                {errors.password ? (
                  <p className="flex items-center gap-1 text-xs text-red-400">
                    <svg
                      className="h-3 w-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586 5.314 11.9a1 1 0 10-1.414 1.414l6 6a1 1 0 001.414 0l8.101-8.1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.password}
                  </p>
                ) : password ? (
                  <p className="flex items-center gap-1 text-xs text-green-400">
                    <svg
                      className="h-3 w-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Password is valid
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-lg border ${
                      errors.confirmPassword
                        ? 'border-red-500/50 bg-red-950/20'
                        : 'border-slate-600/50 bg-slate-900/50'
                    } px-4 py-3 pr-12 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? (
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
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-xs text-red-400">
                    <svg
                      className="h-3 w-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586 5.314 11.9a1 1 0 10-1.414 1.414l6 6a1 1 0 001.414 0l8.101-8.1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <p className="text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-blue-400 hover:text-blue-300 transition font-medium"
              >
                Sign in
              </button>
            </p>
            <p className="mt-4 text-xs text-slate-500">
              By creating an account, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
