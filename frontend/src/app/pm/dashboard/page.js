'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { useTheme } from '../../../context/ThemeContext';
import {
  FolderKanban, CheckSquare, Clock, AlertTriangle,
  User, Calendar, CheckCircle2, TrendingUp, History,
  ListChecks, Users, Target
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line
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
  const [charts, setCharts] = useState({ tasksByStatus: [] });
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    try {
      const res = await api.get('/reports/pm-stats');
      setStats(res.data.stats);
      setUpcomingDeadlines(res.data.upcomingDeadlines || []);
      setCharts(res.data.charts || { tasksByStatus: [] });
    } catch (err) {
      console.error('Failed to load PM stats:', err);
    }

    try {
      const projRes = await api.get('/projects');
      setAllProjects(projRes.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    init();
  }, []);

  const STATUS_COLORS = {
    'TODO': '#ff3b30',
    'IN_PROGRESS': '#ff9500',
    'REVIEW': '#ffcc00',
    'COMPLETED': '#10b981'
  };
  const DONUT_COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#10b981'];

  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#1b1c22' : '#e2e8f0';
  const axisStroke = isDark ? '#475569' : '#94a3b8';
  const tooltipBg = isDark ? '#1c1d21' : '#ffffff';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1';
  const tooltipColor = isDark ? '#ffffff' : '#0f172a';

  const totalTasks = charts.tasksByStatus?.reduce((acc, t) => acc + t.value, 0) || stats.totalTasks;

  // Build project progress bar chart data
  const progressChartData = allProjects.slice(0, 6).map(p => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + '…' : p.name,
    value: p.progress || 0,
  }));

  // Build weekly sparkline from upcoming deadlines (proxy)
  const weeklySparkline = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    day,
    val: upcomingDeadlines.length > 0 ? Math.max(1, upcomingDeadlines.length - i) : 1,
  }));

  // Timeline capsules for top 3 projects
  const projectTimelines = allProjects.slice(0, 3).map((proj, i) => {
    const startPercent = 5 + i * 10;
    const widthPercent = Math.max(50, 95 - startPercent);
    const color = i === 0 ? '#ff9500' : i === 1 ? '#ff3b30' : '#ffcc00';
    return { id: proj.id, name: proj.name, progress: proj.progress, startPercent: `${startPercent}%`, widthPercent: `${widthPercent}%`, color };
  });

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
        {/* Outer Dashboard Shell — matches admin layout */}
        <div className="flex flex-col xl:flex-row gap-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200">

          {/* ── LEFT MAIN PANEL ── */}
          <div className="flex-1 p-2 sm:p-4 space-y-6">

            {/* Title & Navigation Subtabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  PM Console
                </h2>

                {/* Subtab Navigation */}
                <div className="flex items-center gap-6 mt-6 border-b border-slate-200 dark:border-slate-800/60 pb-1 w-fit">
                  {['overview', 'projects', 'deadlines'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs uppercase tracking-widest font-bold pb-2 transition-all relative ${
                        activeTab === tab
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#ff3b30] rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Row 1: Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: My Projects */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm transition-colors">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">{stats.totalProjects}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-1">My Projects</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-[#ff3b30] flex items-center justify-center">
                  <FolderKanban size={18} />
                </div>
              </div>

              {/* Card 2: Total Tasks */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm transition-colors">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">{stats.totalTasks}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-1">Total Tasks</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#ff9500]/10 text-[#ff9500] flex items-center justify-center">
                  <ListChecks size={18} />
                </div>
              </div>

              {/* Card 3: Completed Tasks */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm transition-colors">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">{stats.completedTasks}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-1">Completed</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
              </div>

              {/* Card 4: Pending Tasks */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm transition-colors">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">{stats.pendingTasks}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-1">Pending Tasks</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#ffcc00]/10 text-[#ffcc00] flex items-center justify-center">
                  <Clock size={18} />
                </div>
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 lg:col-span-2 flex flex-col justify-between transition-colors">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-bold text-xs text-slate-855 dark:text-white">Project Progress Telemetry</h4>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Completion % per managed project</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#202127] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1">
                        Telemetry
                      </span>
                    </div>
                    <div className="h-56 w-full">
                      {progressChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={progressChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                            <XAxis dataKey="name" stroke={axisStroke} fontSize={8} tickLine={false} />
                            <YAxis stroke={axisStroke} fontSize={8} tickLine={false} domain={[0, 100]} />
                            <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', color: tooltipColor, fontSize: '10px' }} formatter={(v) => [`${v}%`, 'Progress']} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {progressChartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index % 3 === 0 ? '#ff3b30' : index % 3 === 1 ? '#ff9500' : '#ffcc00'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-slate-400 dark:text-slate-500 text-xs text-center py-16">No projects yet.</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 lg:col-span-1 flex flex-col justify-between transition-colors">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-855 dark:text-white">Task Telemetry</h4>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Phases breakdown</p>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-455 uppercase tracking-widest">Tasks</span>
                      </div>
                      {/* Team roster */}
                      <div className="flex items-center mt-3 mb-4">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#1e1f25] border border-slate-250 dark:border-slate-800 flex items-center justify-center text-[9px] font-bold overflow-hidden -ml-2 first:ml-0" title="Alice User">
                          AU
                        </div>
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#1e1f25] border border-slate-250 dark:border-slate-800 flex items-center justify-center text-[9px] font-bold overflow-hidden -ml-2" title="John Dev">
                          JD
                        </div>
                      </div>
                    </div>
                    <div className="relative w-full h-32 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={charts.tasksByStatus || []} cx="50%" cy="50%" innerRadius={36} outerRadius={48} paddingAngle={4} dataKey="value">
                            {(charts.tasksByStatus || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#cbd5e1'} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-base font-extrabold leading-none text-slate-900 dark:text-white">{stats.totalTasks}</span>
                        <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Tasks</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 lg:col-span-2 transition-colors">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-150 dark:border-slate-800/40 pb-2">
                      <h4 className="font-bold text-xs text-slate-850 dark:text-white">Active Project Schedules</h4>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-450 uppercase tracking-widest">Timelines</span>
                    </div>
                    {projectTimelines.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No active projects yet.</p>
                    ) : (
                      <div className="space-y-3 pt-2 text-[9px] text-slate-400 dark:text-slate-500">
                        <div className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-800/60 pb-1.5 text-center font-bold text-[8px] uppercase tracking-wider text-slate-450 dark:text-slate-500">
                          <div>Wk 1</div><div>Wk 2</div><div>Wk 3</div><div>Wk 4</div><div>Wk 5</div><div>Wk 6</div>
                        </div>
                        {projectTimelines.map((proj) => (
                          <div key={proj.id} className="relative h-8 flex items-center group">
                            <div className="absolute h-5 rounded-full flex items-center justify-center text-[8.5px] text-black font-extrabold transition-all group-hover:opacity-90 overflow-hidden px-2 truncate" style={{ left: proj.startPercent, width: proj.widthPercent, backgroundColor: proj.color }} title={proj.name}>
                              {proj.name} ({proj.progress}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 lg:col-span-1 flex flex-col justify-between transition-colors">
                    <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800/40 pb-2">
                      <h4 className="font-bold text-xs text-slate-855 dark:text-white">Delivery Health</h4>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">•••</span>
                    </div>
                    <div className="space-y-4 pt-3">
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5 font-bold">
                          <span>Task Completion</span>
                          <span className="text-[#ff3b30] font-extrabold">{stats.teamProgressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-[#18191e] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#ff3b30] h-full rounded-full" style={{ width: `${stats.teamProgressPercent}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5 font-bold">
                          <span>Projects On Track</span>
                          <span className="text-[#ff9500] font-extrabold">{allProjects.length > 0 ? `${Math.round((allProjects.filter(p => (p.progress || 0) >= 50).length / allProjects.length) * 100)}%` : '0%'}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-[#18191e] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#ff9500] h-full rounded-full" style={{ width: allProjects.length > 0 ? `${Math.round((allProjects.filter(p => (p.progress || 0) >= 50).length / allProjects.length) * 100)}%` : '0%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'projects' && (
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-6 space-y-4 transition-colors">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-850 dark:text-white border-b border-slate-150 dark:border-slate-800/40 pb-3">Managed Projects ({allProjects.length})</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[500px] overflow-y-auto pr-1">
                  {allProjects.length === 0 ? (
                    <p className="text-slate-400 dark:text-slate-500 text-xs text-center py-12">You are not managing any projects.</p>
                  ) : (
                    allProjects.map((p) => (
                      <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0">
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-850 dark:text-white">{p.name}</h4>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold line-clamp-2 max-w-lg">{p.description || 'No description.'}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-[#ff3b30]">{p.progress}%</span>
                            <div className="w-20 bg-slate-100 dark:bg-[#18191e] h-1 rounded-full overflow-hidden mt-1.5">
                              <div className="bg-[#ff3b30] h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'deadlines' && (
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-6 space-y-4 transition-colors">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-850 dark:text-white border-b border-slate-150 dark:border-slate-800/40 pb-3">Complete Deadlines Registry</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {upcomingDeadlines.length === 0 ? (
                    <p className="text-slate-400 dark:text-slate-500 text-xs text-center py-12">No deadlines recorded.</p>
                  ) : (
                    upcomingDeadlines.map((task) => (
                      <div key={task.id} className="bg-slate-50 dark:bg-[#1c1d21]/30 border border-slate-200 dark:border-slate-800/60 p-4 rounded-2xl flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-slate-850 dark:text-white">{task.title}</h4>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${task.priority === 'HIGH' ? 'bg-red-50 dark:bg-red-950/20 text-[#ff3b30]' : task.priority === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-950/20 text-[#ff9500]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{task.priority} Priority</span>
                        </div>
                        <span className="text-[10px] text-[#ff3b30] flex items-center gap-1 font-bold whitespace-nowrap">
                          <Calendar size={12} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {activeTab === 'overview' && (
            <div className="w-full xl:w-72 bg-slate-50/50 dark:bg-[#1c1d21]/60 border-t xl:border-t-0 xl:border-l border-slate-200 dark:border-slate-800/40 p-4 rounded-[2rem] space-y-6 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800/60">
                  <h4 className="font-bold text-xs text-slate-905 dark:text-white uppercase tracking-wider">Upcoming Deadlines</h4>
                  <AlertTriangle size={12} className="text-[#ff9500]" />
                </div>
                <div className="max-h-52 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {upcomingDeadlines.length === 0 ? (
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center py-6">No urgent deadlines in the next 7 days.</p>
                  ) : (
                    upcomingDeadlines.slice(0, 6).map((task) => (
                      <div key={task.id} className="text-[10px] bg-slate-50 dark:bg-[#1e1f25]/50 border border-slate-200 dark:border-slate-850 p-2.5 rounded-xl space-y-1 hover:border-slate-300 dark:hover:border-slate-800 transition-colors text-slate-800 dark:text-slate-200">
                        <p className="font-semibold leading-snug line-clamp-2">{task.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${task.priority === 'HIGH' ? 'bg-red-50 dark:bg-red-950/20 text-[#ff3b30]' : task.priority === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-950/20 text-[#ff9500]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{task.priority}</span>
                          <span className="text-[8px] text-[#ff3b30] flex items-center gap-0.5 font-bold">
                            <Calendar size={9} />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.8rem] p-5 space-y-3 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Weekly Deadlines</span>
                    <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white mt-1 block">
                      {upcomingDeadlines.length} Due Soon
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-extrabold text-xs shadow-sm">
                    PM
                  </div>
                </div>
                <div className="h-12 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklySparkline}>
                      <Line type="monotone" dataKey="val" stroke="#ff9500" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-[7px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </RouteGuard>
  );
}
