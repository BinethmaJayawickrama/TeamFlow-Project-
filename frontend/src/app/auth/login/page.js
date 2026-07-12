'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
 
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#18191e] px-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[2rem] p-8 shadow-xl">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          {/* Logo with split white/red background matching the brand design system */}
          <div className="w-12 h-12 rounded-full border-2 border-[#ff3b30] overflow-hidden flex shadow-md mb-4">
            <div className="w-1/2 h-full bg-white flex items-center justify-end text-black font-extrabold text-xl pr-[1px]">T</div>
            <div className="w-1/2 h-full bg-[#ff3b30] flex items-center justify-start text-white font-extrabold text-xl pl-[1px]">F</div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome to TeamFlow</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to manage your workspace</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs px-4 py-3 rounded-2xl mb-6 font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="e.g. member@teamflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-[#ff3b30] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff3b30] hover:bg-[#e02d22] text-white font-semibold text-sm rounded-2xl py-3.5 shadow-lg shadow-red-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800/80 pt-6">
          <p className="text-xs text-slate-400 dark:text-slate-550">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-[#ff3b30] hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
