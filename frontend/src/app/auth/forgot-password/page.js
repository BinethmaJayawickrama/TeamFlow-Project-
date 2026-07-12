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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-100/50 dark:shadow-none">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl mb-4 shadow-lg shadow-indigo-500/30">
            T
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Reset Password</h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Recover access to your account</p>
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
              className="inline-block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-2xl py-3.5 shadow-lg shadow-indigo-500/20 transition-all"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Enter the email address associated with your account and we will email you a link to reset your password.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="e.g. member@teamflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold text-sm rounded-2xl py-3.5 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-2">
              <Link href="/auth/login" className="text-xs text-indigo-500 hover:underline font-semibold">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
