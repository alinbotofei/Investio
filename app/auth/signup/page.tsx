'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

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
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain a number';
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Investio</h1>
          <p className="text-sm text-slate-400">Create your account</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {errors.submit && (
            <div className="rounded-lg bg-red-950 border border-red-800 p-3 text-sm text-red-200">
              {errors.submit}
            </div>
          )}

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
                errors.name ? 'border-red-500' : 'border-slate-600'
              } bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name}</p>
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
                errors.email ? 'border-red-500' : 'border-slate-600'
              } bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email}</p>
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
                errors.password ? 'border-red-500' : 'border-slate-600'
              } bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password}</p>
            )}
            {!errors.password && password && (
              <p className="text-xs text-slate-500">
                Password meets requirements ✓
              </p>
            )}
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
                errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
              } bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 font-medium text-white transition hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="space-y-2 text-center text-sm">
          <p className="text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
