'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
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
        router.push(`/auth/signin?email=${encodeURIComponent(email)}`);
      } else {
        router.push(`/auth/signup?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Investio</h1>
          <p className="text-sm text-slate-400">
            Welcome back to your investment dashboard
          </p>
        </div>

        <form onSubmit={handleCheckUser} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-950 border border-red-800 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={loading}
            />
            <p className="text-xs text-slate-500">
              Enter your email to continue
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 font-medium text-white transition hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>

        <div className="space-y-2 text-center text-sm">
          <p className="text-slate-400">
            New to Investio?{' '}
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
