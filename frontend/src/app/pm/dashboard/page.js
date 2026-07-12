'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { 
  FolderKanban, CheckSquare, Clock, AlertTriangle, 
  User, Calendar, CheckCircle2, TrendingUp 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';

export default function PMDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    teamProgressPercent: 0,
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [charts, setCharts] = useState({
    tasksByStatus: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/pm-stats');
        setStats(res.data.stats);
        setUpcomingDeadlines(res.data.upcomingDeadlines);
        setCharts(res.data.charts);
      } catch (err) {
        setError('Failed to load project manager metrics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#10b981']; // Indigo, Amber, Blue, Emerald
  const STATUS_COLORS = {
    'TODO': '#6366f1',
    'IN_PROGRESS': '#f59e0b',
    'REVIEW': '#3b82f6',
    'COMPLETED': '#10b981'
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={['PROJECT_MANAGER']}>
        <Layout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </Layout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['PROJECT_MANAGER']}>
      <Layout>
        <div className="space-y-6">
          
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Project Management Console</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Overview of projects, upcoming timelines, and team accomplishments.</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-800/50 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Managed Projects */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">My Projects</span>
                <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{stats.totalProjects}</span>
              </div>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/5">
                <FolderKanban size={22} />
              </div>
            </div>

            {/* Total Tasks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Tasks</span>
                <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{stats.totalTasks}</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/5">
                <CheckSquare size={22} />
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Completed</span>
                <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{stats.completedTasks}</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/5">
                <CheckCircle2 size={22} />
              </div>
            </div>

            {/* Team Progress */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between w-full">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Team Progress</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats.teamProgressPercent}%</span>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${stats.teamProgressPercent}%` }}
                ></div>
              </div>
            </div>

          </div>

          {/* Dash Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart: Status breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-1">
              <h3 className="font-bold text-base mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <TrendingUp size={18} className="text-indigo-500" />
                Tasks by Status
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                {charts.tasksByStatus.length > 0 && charts.tasksByStatus.some(c => c.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.tasksByStatus.filter(t => t.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {charts.tasksByStatus.filter(t => t.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#cbd5e1'} />
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
                  <p className="text-slate-400 text-sm">No tasks assigned to your projects yet.</p>
                )}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-2">
              <h3 className="font-bold text-base mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <AlertTriangle size={18} className="text-amber-500" />
                Upcoming Deadlines (Next 7 Days)
              </h3>
              <div className="space-y-4">
                {upcomingDeadlines.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No urgent task deadlines in your projects.
                  </div>
                ) : (
                  upcomingDeadlines.map((task) => (
                    <div key={task.id} className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">
                          {task.project?.name}
                        </span>
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{task.title}</h4>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            Assignee: {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
                          task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 mt-2">
                          <Calendar size={12} />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </Layout>
    </RouteGuard>
  );
}
