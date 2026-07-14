'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import api from '../../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.resetToken) {
        // Expose token to local storage so user can click a helper link to reset page directly
        localStorage.setItem('dev_reset_token', res.data.resetToken);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#18191e] px-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[2rem] p-8 shadow-xl">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          {/* Logo matches sidebar custom design */}
          <div className="w-12 h-12 rounded-full border-2 border-[#ff3b30] flex items-center justify-center font-black text-lg select-none shadow-md mb-4 bg-white dark:bg-[#1e1f25]">
            <span className="text-slate-900 dark:text-white">T</span>
            <span className="text-[#ff3b30] -ml-0.5">F</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reset Password</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Recover access to your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs px-4 py-3 rounded-2xl mb-6 font-medium">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-xs px-4 py-4 rounded-2xl leading-relaxed text-left font-medium">
              <strong>Password Reset Link Sent!</strong>
              <p className="mt-2">An email has been sent to <strong>{email}</strong> with instructions to reset your password.</p>
              
              <hr className="my-3 border-emerald-100 dark:border-emerald-800/50" />
              <p className="text-[11px] opacity-90 mb-2">💡 <strong>Quick Demo Note:</strong> Click the direct reset button below to simulate opening the reset email link in dev environment.</p>
              
              <Link
                href={`/auth/reset-password?token=${typeof window !== 'undefined' ? localStorage.getItem('dev_reset_token') || '' : ''}`}
                className="inline-block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xl px-3 py-1.5 transition-all w-full text-center"
              >
                Go to Reset Password Form
              </Link>
            </div>
            
            <Link
              href="/auth/login"
              className="inline-block w-full text-center bg-[#ff3b30] hover:bg-[#e02d22] text-white font-semibold text-sm rounded-2xl py-3.5 shadow-lg shadow-red-500/10 transition-all"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium">
              Enter the email address associated with your account and we will email you a link to reset your password.
            </p>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff3b30] hover:bg-[#e02d22] text-white font-semibold text-sm rounded-2xl py-3.5 shadow-lg shadow-red-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/auth/login" className="text-xs text-[#ff3b30] hover:underline font-semibold">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
