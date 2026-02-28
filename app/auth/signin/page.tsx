'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-2xl">
        <h1 className="mb-8 text-center text-2xl font-bold text-white">Investio</h1>

        <form onSubmit={handleSignIn} className="space-y-4">
          {error && (
            <div className="rounded bg-red-900 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center justify-between">
          <div className="h-px flex-1 bg-gray-600" />
          <span className="px-2 text-sm text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-600" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full rounded border border-gray-600 bg-gray-700 py-2 font-medium text-white hover:bg-gray-600"
        >
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-blue-400 hover:text-blue-300">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
