'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { 
  Users, FolderKanban, CheckCircle2, Clock, 
  Activity, Calendar, ShieldAlert, RefreshCw, ChevronDown,
  Server, LogOut, ArrowUp, ArrowDown, Shield, History
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line
} from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  
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
  const [logs, setLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/reports/admin-stats');
      setStats(statsRes.data.stats);
      setCharts(statsRes.data.charts);
      
      const usersRes = await api.get('/users');
      setUsersList(usersRes.data.users);

      const projectsRes = await api.get('/projects');
      setAllProjects(projectsRes.data.projects);

      const logsRes = await api.get('/activity-logs');
      setLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Failed to sync dashboard telemetry:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    init();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Weekly sparkline data (Mon - Sun) matching log activity volume
  const getWeeklySparklineData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const logCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    logs.forEach(log => {
      const logDate = new Date(log.createdAt);
      if (logDate >= sevenDaysAgo) {
        const dayName = days[logDate.getDay()];
        logCounts[dayName]++;
      }
    });

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      val: logCounts[day] || 1 // Fallback to 1 for visual line rendering in empty state
    }));
  };

  // Project timelines horizontal capsules
  const getProjectTimelineSchedules = () => {
    return allProjects.slice(0, 3).map((proj, i) => {
      const startPercent = 10 + (i * 15);
      const widthPercent = Math.max(30, 80 - startPercent);
      const color = i === 1 ? '#ff3b30' : (i === 2 ? '#ffcc00' : '#ff9500');

      return {
        id: proj.id,
        name: proj.name,
        progress: proj.progress,
        startPercent: `${startPercent}%`,
        widthPercent: `${widthPercent}%`,
        color
      };
    });
  };

  const weeklySparkline = getWeeklySparklineData();
  const projectTimelines = getProjectTimelineSchedules();

  const DONUT_COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#3b82f6'];
  const STATUS_COLORS = {
    'TODO': '#ff3b30',
    'IN_PROGRESS': '#ff9500',
    'REVIEW': '#3b82f6',
    'COMPLETED': '#10b981'
  };

  const activeUsers = usersList.filter(u => u.isActive).length;
  const pmRoster = usersList.filter(u => u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN');
  const totalTasks = charts.tasksByStatus.reduce((acc, t) => acc + t.value, 0) || stats.pendingTasks;

  // Chart theme colors mapping
  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#1b1c22' : '#e2e8f0';
  const axisStroke = isDark ? '#475569' : '#94a3b8';
  const tooltipBg = isDark ? '#1c1d21' : '#ffffff';
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#cbd5e1';
  const tooltipColor = isDark ? '#ffffff' : '#0f172a';

  if (loading) {
    return (
      <RouteGuard allowedRoles={['ADMIN']}>
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
    <RouteGuard allowedRoles={['ADMIN']}>
      <Layout>
        {/* Outer Dashboard Shell - Dynamic bg and text colors for dark and light modes */}
        <div className="flex flex-col xl:flex-row gap-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200">
          
          {/* LEFT MAIN PANEL */}
          <div className="flex-1 p-2 sm:p-4 space-y-6">
            
            {/* Title & Navigation Tabs row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Main Dashboard</h2>
                
                {/* Secondary Navigation Subtabs */}
                <div className="flex items-center gap-6 mt-6 border-b border-slate-200 dark:border-slate-800/60 pb-1 w-fit">
                  {['overview', 'projects', 'users', 'logs'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs uppercase tracking-widest font-bold pb-2 transition-all relative ${
                        activeTab === tab ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
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

            {/* Row 1: Core Statistics Cards (Total Users, Total Projects, Completed Projects, Pending Tasks) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Users */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm transition-colors">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">{stats.totalUsers}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-1">Total Users</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-[#ff3b30] flex items-center justify-center">
                  <Users size={18} />
                </div>
              </div>

              {/* Card 2: Projects */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm transition-colors">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">{stats.totalProjects}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-1">Total Projects</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#ff9500]/10 text-[#ff9500] flex items-center justify-center">
                  <FolderKanban size={18} />
                </div>
              </div>

              {/* Card 3: Completed Projects */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm transition-colors">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold block text-slate-900 dark:text-white">{stats.completedProjects}</span>
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

            {/* Row 2: Visual Charts & Analytics (Project Progress Telemetry & Tasks breakdown) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Chart: Project Progress Telemetry BarChart */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 lg:col-span-2 flex flex-col justify-between transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-850 dark:text-white">Project Progress Telemetry</h4>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Projects count by status completion range</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#202127] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1">
                    Telemetry
                  </span>
                </div>

                {/* Recharts BarChart styled to fit the theme color */}
                <div className="h-56 w-full">
                  {charts.projectsByProgress && charts.projectsByProgress.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={charts.projectsByProgress} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                        <XAxis dataKey="name" stroke={axisStroke} fontSize={8} tickLine={false} />
                        <YAxis stroke={axisStroke} fontSize={8} tickLine={false} />
                        <Tooltip
                          contentStyle={{ 
                            background: tooltipBg, 
                            border: `1px solid ${tooltipBorder}`, 
                            borderRadius: '12px',
                            color: tooltipColor,
                            fontSize: '10px'
                          }} 
                        />
                        <Bar dataKey="value" fill="#ff3b30" radius={[4, 4, 0, 0]}>
                          {charts.projectsByProgress.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 3 ? '#ffcc00' : (index === 2 ? '#ff9500' : '#ff3b30')} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 text-xs text-center py-16">No progress range data recorded.</p>
                  )}
                </div>
              </div>

              {/* Right Chart: Tasks by Status Donut Chart */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 lg:col-span-1 flex flex-col justify-between transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-850 dark:text-white">Workflow Metrics</h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Tasks breakdown by active phase</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-[#202127] flex items-center justify-center text-[10px] text-slate-450 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-800">
                      ↗
                    </div>
                  </div>

                  {/* PMs Avatars Roster */}
                  <div className="flex items-center mt-3 mb-4">
                    {pmRoster.slice(0, 4).map((usr) => (
                      <div 
                        key={usr.id} 
                        className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#1e1f25] border border-slate-250 dark:border-slate-800 flex items-center justify-center text-[9px] font-bold overflow-hidden -ml-2 first:ml-0"
                        title={usr.firstName}
                      >
                        {usr.avatar ? (
                          <img src={usr.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          usr.firstName[0] + usr.lastName[0]
                        )}
                      </div>
                    ))}
                    {pmRoster.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-[#202127] border border-slate-300 dark:border-slate-850 flex items-center justify-center text-[9px] text-[#ff9500] font-extrabold -ml-2">
                        +{pmRoster.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Donut Chart Ring */}
                <div className="relative w-full h-32 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.tasksByStatus.filter(t => t.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={48}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {charts.tasksByStatus.filter(t => t.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || DONUT_COLORS[index % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-extrabold leading-none text-slate-900 dark:text-white">{totalTasks}</span>
                    <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Total Tasks</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Row 3: Workspace Timelines & Cluster Health Progress Bars */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Workspace Timelines grid */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 lg:col-span-2 transition-colors">
                <div className="flex justify-between items-center mb-4 border-b border-slate-150 dark:border-slate-800/40 pb-2">
                  <h4 className="font-bold text-xs text-slate-850 dark:text-white">Active Projects Schedules</h4>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-450 uppercase tracking-widest">Timelines</span>
                </div>

                {projectTimelines.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No projects currently active.</p>
                ) : (
                  <div className="space-y-3 pt-2 text-[9px] text-slate-400 dark:text-slate-500">
                    <div className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-800/60 pb-1.5 text-center font-bold text-[8px] uppercase tracking-wider text-slate-450 dark:text-slate-500">
                      <div>Wk 1</div>
                      <div>Wk 2</div>
                      <div>Wk 3</div>
                      <div>Wk 4</div>
                      <div>Wk 5</div>
                      <div>Wk 6</div>
                    </div>

                    {projectTimelines.map((proj) => (
                      <div key={proj.id} className="relative h-6 flex items-center group">
                        <div 
                          className="absolute h-3 rounded-full flex items-center justify-center text-[8.5px] text-black font-extrabold transition-all group-hover:opacity-90 overflow-hidden px-2 truncate"
                          style={{ 
                            left: proj.startPercent, 
                            width: proj.widthPercent,
                            backgroundColor: proj.color
                          }}
                          title={proj.name}
                        >
                          {proj.name} ({proj.progress}%)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cluster Health metrics card (Server Capacity & DB status) */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.5rem] p-5 lg:col-span-1 flex flex-col justify-between transition-colors">
                <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800/40 pb-2">
                  <h4 className="font-bold text-xs text-slate-855 dark:text-white">Cluster Health</h4>
                  <span className="text-slate-400 dark:text-slate-500 text-xs">•••</span>
                </div>

                <div className="space-y-4 pt-3">
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5 font-bold">
                      <span>Server Capacity</span>
                      <span className="text-[#ff3b30] font-extrabold">99.9%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#18191e] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#ff3b30] h-full rounded-full w-[99.9%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5 font-bold">
                      <span>Database Engine</span>
                      <span className="text-[#ff9500] font-extrabold">Operational</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#18191e] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#ff9500] h-full rounded-full w-[85%]"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT SIDEBAR PANEL - Dynamic bg colors for light/dark transitions */}
          <div className="w-full xl:w-72 bg-slate-50/50 dark:bg-[#1c1d21]/60 border-t xl:border-t-0 xl:border-l border-slate-200 dark:border-slate-800/40 p-4 rounded-[2rem] space-y-6 transition-colors">
            
            {/* Latest System Logs registry (Preserved from Dashboard version 1) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800/60">
                <h4 className="font-bold text-xs text-slate-905 dark:text-white uppercase tracking-wider">Latest System Logs</h4>
                <History size={12} className="text-slate-400 dark:text-slate-500" />
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {logs.length === 0 ? (
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center py-6">No audit records available.</p>
                ) : (
                  logs.slice(0, 6).map((log) => (
                    <div key={log.id} className="text-[10px] bg-slate-50 dark:bg-[#1e1f25]/50 border border-slate-200 dark:border-slate-850 p-2.5 rounded-xl space-y-1 hover:border-slate-300 dark:hover:border-slate-800 transition-colors text-slate-800 dark:text-slate-200">
                      <p className="font-semibold leading-snug">{log.action}</p>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 block">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Weekly Activity Logs volume sparkline */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-[1.8rem] p-5 space-y-3 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Weekly Activity</span>
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white mt-1 block">
                    {logs.length} Log Entries
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-extrabold text-xs shadow-sm">
                  A
                </div>
              </div>

              {/* Sparkline line graph */}
              <div className="h-12 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklySparkline}>
                    <Line 
                      type="monotone" 
                      dataKey="val" 
                      stroke="#ff3b30" 
                      strokeWidth={1.5} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Sparkline X-Axis labels */}
              <div className="flex justify-between text-[7px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

          </div>

        </div>
      </Layout>
    </RouteGuard>
  );
}
