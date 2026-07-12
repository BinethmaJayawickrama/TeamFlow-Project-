'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { 
  Users, FolderKanban, CheckCircle, Clock, 
  BarChart4, ArrowUpRight, TrendingUp 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    completedProjects: 0,
    pendingTasks: 0,
  });
  const [charts, setCharts] = useState({
    tasksByStatus: [],
    projectsByProgress: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/admin-stats');
        setStats(res.data.stats);
        setCharts(res.data.charts);
      } catch (err) {
        setError('Failed to load dashboard metrics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#10b981']; // Indigo, Amber, Blue, Emerald

  if (loading) {
    return (
      <RouteGuard allowedRoles={['ADMIN']}>
        <Layout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </Layout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <Layout>
        <div className="space-y-6">
          
          {/* Welcome section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">System Statistics</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time oversight of all TeamFlow resources.</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-800/50 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Users */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Users</span>
                <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{stats.totalUsers}</span>
              </div>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/5">
                <Users size={22} />
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Projects</span>
                <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{stats.totalProjects}</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/5">
                <FolderKanban size={22} />
              </div>
            </div>

            {/* Completed Projects */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Completed Projects</span>
                <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{stats.completedProjects}</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/5">
                <CheckCircle size={22} />
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Pending Tasks</span>
                <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{stats.pendingTasks}</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/5">
                <Clock size={22} />
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Tasks by Status */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-base mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <TrendingUp size={18} className="text-indigo-500" />
                Tasks by Status
              </h3>
              <div className="h-72 w-full flex items-center justify-center">
                {charts.tasksByStatus.length > 0 && charts.tasksByStatus.some(c => c.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.tasksByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {charts.tasksByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(15, 23, 42, 0.95)', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-sm">No tasks recorded in the database.</p>
                )}
              </div>
            </div>

            {/* Chart 2: Projects by Progress */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-base mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <BarChart4 size={18} className="text-indigo-500" />
                Projects Progress Range
              </h3>
              <div className="h-72 w-full">
                {charts.projectsByProgress.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={charts.projectsByProgress}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ 
                          background: 'rgba(15, 23, 42, 0.95)', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                        {charts.projectsByProgress.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 3 ? '#10b981' : '#6366f1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-sm flex items-center justify-center h-full">No project progress distribution data available.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </Layout>
    </RouteGuard>
  );
}
