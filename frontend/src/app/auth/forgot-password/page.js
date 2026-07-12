'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reset Password</h2>
          <p className="text-slate-550 dark:text-slate-400 text-sm mt-1">Recover access to your account</p>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-xs px-4 py-4 rounded-2xl leading-relaxed text-left font-medium">
              <strong>Password Reset Link Sent!</strong>
              <p className="mt-2">An email has been sent to <strong>{email}</strong> with instructions to reset your password.</p>
              <hr className="my-3 border-emerald-100 dark:border-emerald-800/50" />
              <p className="text-[11px] opacity-90">💡 <strong>Quick Demo Note:</strong> You can log in instantly with the seeded account: <br /><strong>Email:</strong> admin@teamflow.com <br /><strong>Password:</strong> admin123</p>
            </div>
            
            <Link
              href="/auth/login"
              className="inline-block w-full text-center bg-[#ff3b30] hover:bg-[#e02d22] text-white font-semibold text-sm rounded-2xl py-3.5 shadow-lg shadow-red-500/10 transition-all animate-pulse"
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
              className="w-full bg-[#ff3b30] hover:bg-[#e02d22] text-white font-semibold text-sm rounded-2xl py-3.5 shadow-lg shadow-red-500/10 active:scale-[0.98] transition-all"
            >
              Send Reset Link
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
