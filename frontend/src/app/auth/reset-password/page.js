'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../services/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid or missing password reset token.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      setSuccess(true);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dev_reset_token');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[2rem] p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-full border-2 border-[#ff3b30] flex items-center justify-center font-black text-lg select-none shadow-md mb-4 bg-white dark:bg-[#1e1f25]">
          <span className="text-slate-900 dark:text-white">T</span>
          <span className="text-[#ff3b30] -ml-0.5">F</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Set New Password</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter your new workspace credentials</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs px-4 py-3 rounded-2xl mb-6 font-medium">
          {error}
        </div>
      )}

      {success ? (
        <div className="space-y-6 text-center">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-xs px-4 py-4 rounded-2xl leading-relaxed text-left font-medium">
            <strong>Password Reset Successful!</strong>
            <p className="mt-2">Your password has been successfully updated. You can now use your new password to sign in.</p>
          </div>
          
          <Link
            href="/auth/login"
            className="inline-block w-full text-center bg-[#ff3b30] hover:bg-[#e02d22] text-white font-semibold text-sm rounded-2xl py-3.5 shadow-lg shadow-red-500/10 transition-all"
          >
            Go to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 mb-2">New Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
              required
              disabled={!token}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 mb-2">Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
              required
              disabled={!token}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-[#ff3b30] hover:bg-[#e02d22] text-white font-semibold text-sm rounded-2xl py-3.5 shadow-lg shadow-red-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Update Password'
            )}
          </button>

          <div className="text-center pt-2">
            <Link href="/auth/login" className="text-xs text-[#ff3b30] hover:underline font-semibold">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#18191e] px-4 transition-colors duration-200">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[2rem] p-8 shadow-xl flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-[#ff3b30] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-4">Verifying reset parameters...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
