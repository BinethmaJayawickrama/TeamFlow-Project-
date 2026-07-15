'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import api from '../../../services/api';

export default function RegisterPage() {
  const { updateProfile, redirectDashboard } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TEAM_MEMBER'); // Role selector: defaults to TEAM_MEMBER
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        role,
      });

      const { token, user } = response.data;
      
      localStorage.setItem('teamflow_token', token);
      localStorage.setItem('teamflow_user', JSON.stringify(user));
      
      updateProfile(user);
      redirectDashboard(user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Get started with TeamFlow workspace</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs px-4 py-3 rounded-2xl mb-6 font-medium">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 mb-2">First Name</label>
              <input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 mb-2">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="doe@teamflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 mb-2">Select Your Workspace Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-800 dark:text-white font-semibold transition-colors"
            >
              <option value="TEAM_MEMBER">Team Collaborator</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff3b30] hover:bg-[#e02d22] text-white font-semibold text-sm rounded-2xl py-3.5 shadow-lg shadow-red-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800/80 pt-6">
          <p className="text-xs text-slate-400 dark:text-slate-550">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#ff3b30] hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
