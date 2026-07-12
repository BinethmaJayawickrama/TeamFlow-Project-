'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { useTheme } from '../../../context/ThemeContext';
import { 
  FolderKanban, CheckSquare, Clock, AlertTriangle, 
  User, Calendar, CheckCircle2, TrendingUp 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';

export default function PMDashboard() {
  const { theme } = useTheme();
  
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

  const COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#10b981']; // Red, Orange, Yellow, Emerald
  const STATUS_COLORS = {
    'TODO': '#ff3b30',
    'IN_PROGRESS': '#ff9500',
    'REVIEW': '#ffcc00',
    'COMPLETED': '#10b981'
  };

  const isDark = theme === 'dark';
  const tooltipBg = isDark ? '#1c1d21' : '#ffffff';
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#cbd5e1';
  const tooltipColor = isDark ? '#ffffff' : '#0f172a';

  if (loading) {
    return (
      <RouteGuard allowedRoles={['PROJECT_MANAGER']}>
        <Layout>
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-3 border-[#ff3b30]/10 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-[#ff3b30] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </Layout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['PROJECT_MANAGER']}>
      <Layout>
        {/* Outer Console Shell - Dynamic bg and text colors for dark and light modes */}
        <div className="space-y-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200 min-h-[80vh] pb-12">
          
          {/* Glow Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b30]/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header Banner */}
          <div className="p-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Project Management Console</h2>
            <p className="text-slate-550 dark:text-slate-400 text-sm mt-0.5">Overview of active projects, upcoming deadlines, and team accomplishments.</p>
          </div>

          {error && (
            <div className="mx-4 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-800/50 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Core Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            
            {/* Managed Projects */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors">
              <div>
                <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">My Projects</span>
                <span className="text-2xl sm:text-3xl font-extrabold block mt-2 text-slate-900 dark:text-white">{stats.totalProjects}</span>
              </div>
              <div className="w-10 h-10 bg-red-500/10 text-[#ff3b30] rounded-xl flex items-center justify-center">
                <FolderKanban size={18} />
              </div>
            </div>

            {/* Total Tasks */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors">
              <div>
                <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Total Tasks</span>
                <span className="text-2xl sm:text-3xl font-extrabold block mt-2 text-slate-900 dark:text-white">{stats.totalTasks}</span>
              </div>
              <div className="w-10 h-10 bg-amber-550/10 text-[#ff9500] rounded-xl flex items-center justify-center">
                <CheckSquare size={18} />
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors">
              <div>
                <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Completed</span>
                <span className="text-2xl sm:text-3xl font-extrabold block mt-2 text-slate-900 dark:text-white">{stats.completedTasks}</span>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
            </div>

            {/* Team Progress Card */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-colors">
              <div className="flex items-center justify-between w-full">
                <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Team Progress</span>
                <span className="text-sm font-extrabold text-[#ff3b30]">{stats.teamProgressPercent}%</span>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-[#18191e] h-1.5 rounded-full overflow-hidden mt-4">
                <div 
                  className="bg-[#ff3b30] h-full rounded-full transition-all duration-300"
                  style={{ width: `${stats.teamProgressPercent}%` }}
                ></div>
              </div>
            </div>

          </div>

          {/* Dash Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
            
            {/* Chart Card */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm lg:col-span-1 transition-colors">
              <h3 className="font-bold text-xs uppercase tracking-wider mb-6 flex items-center gap-2 text-slate-850 dark:text-white">
                <TrendingUp size={16} className="text-[#ff3b30]" />
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
                          background: tooltipBg, 
                          border: `1px solid ${tooltipBorder}`, 
                          borderRadius: '12px',
                          color: tooltipColor,
                          fontSize: '10px'
                        }} 
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 text-xs text-center py-16">No tasks assigned to your projects yet.</p>
                )}
              </div>
            </div>

            {/* Upcoming Deadlines List */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm lg:col-span-2 transition-colors">
              <h3 className="font-bold text-xs uppercase tracking-wider mb-6 flex items-center gap-2 text-slate-850 dark:text-white">
                <AlertTriangle size={16} className="text-[#ff9500]" />
                Upcoming Deadlines (Next 7 Days)
              </h3>
              <div className="space-y-4">
                {upcomingDeadlines.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl">
                    No urgent task deadlines in your projects.
                  </div>
                ) : (
                  upcomingDeadlines.map((task) => (
                    <div key={task.id} className="bg-slate-50/60 dark:bg-[#1c1d21]/30 hover:bg-slate-100 dark:hover:bg-[#1c1d21]/50 border border-slate-200 dark:border-slate-800/65 rounded-2xl p-4 flex items-center justify-between gap-4 transition-colors">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold text-[#ff3b30] uppercase tracking-wider block">
                          {task.project?.name}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">{task.title}</h4>
                        
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 dark:text-slate-550 mt-2 font-semibold">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            Assignee: {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                          task.priority === 'HIGH' ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-[#ff3b30]' :
                          task.priority === 'MEDIUM' ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-[#ff9500]' :
                          'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#ff3b30] mt-2 justify-end">
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
