'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      newErrors.password = 'Must contain uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Must contain a number';
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

            <form onSubmit={handleSignUp} className="space-y-4">
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
                  } px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={loading}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="flex items-center gap-1 text-xs text-red-400">
                    <svg
                      className="h-3 w-3"
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
                  } px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-red-400">
                    <svg
                      className="h-3 w-3"
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
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border ${
                    errors.password
                      ? 'border-red-500/50 bg-red-950/20'
                      : 'border-slate-600/50 bg-slate-900/50'
                  } px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={loading}
                  autoComplete="new-password"
                />
                {errors.password ? (
                  <p className="flex items-center gap-1 text-xs text-red-400">
                    <svg
                      className="h-3 w-3"
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
                      className="h-3 w-3"
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
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border ${
                    errors.confirmPassword
                      ? 'border-red-500/50 bg-red-950/20'
                      : 'border-slate-600/50 bg-slate-900/50'
                  } px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={loading}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-xs text-red-400">
                    <svg
                      className="h-3 w-3"
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
