'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { 
  FileSpreadsheet, ClipboardList, CheckCircle2, 
  Clock, AlertTriangle, TrendingUp, User, FileDown 
} from 'lucide-react';

export default function PMReports() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [report, setReport] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data.projects);
        if (res.data.projects.length > 0) {
          setSelectedProjectId(res.data.projects[0].id.toString());
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch projects list.');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    
    const fetchReport = async () => {
      setLoadingReport(true);
      try {
        const res = await api.get(`/reports/project-report/${selectedProjectId}`);
        setReport(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to generate project report.');
      } finally {
        setLoadingReport(false);
      }
    };
    fetchReport();
  }, [selectedProjectId]);

  return (
    <RouteGuard allowedRoles={['PROJECT_MANAGER']}>
      <Layout>
        {/* Outer Directory Container - Theme matching deep bg */}
        <div className="space-y-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200 min-h-[80vh] pb-12">
          
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b30]/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Performance Reports</h2>
              <p className="text-slate-555 dark:text-slate-400 text-sm mt-0.5">Analyze task completions, overdue deadlines, and team contributions.</p>
            </div>
            
            {/* Project Selection Dropdown */}
            {!loadingProjects && projects.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-[#1e1f25]/50 hover:dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-[#ff3b30] shadow-sm transition-all"
                  title="Export Report to PDF"
                >
                  <FileDown size={15} />
                  <span>PDF Export</span>
                </button>

                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest desert:hidden select-none">Project:</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-slate-50 dark:bg-[#1e1f25]/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4.5 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-800 dark:text-white transition-colors"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-4 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-800/50 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          {loadingProjects || loadingReport ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="relative w-8 h-8 mx-auto">
                <div className="absolute inset-0 border-3 border-[#ff3b30]/10 rounded-full"></div>
                <div className="absolute inset-0 border-3 border-[#ff3b30] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="mx-4 bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-12 text-center text-slate-450">
              No projects available to report on.
            </div>
          ) : report ? (
            <div className="space-y-6 px-4">
              
              {/* Report Stats Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Tasks */}
                <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors">
                  <div>
                    <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Total Tasks</span>
                    <span className="text-2xl sm:text-3xl font-extrabold block mt-2 text-slate-900 dark:text-white">{report.stats.totalTasks}</span>
                  </div>
                  <div className="w-10 h-10 bg-amber-550/10 text-[#ff9500] rounded-xl flex items-center justify-center">
                    <ClipboardList size={18} />
                  </div>
                </div>

                {/* Completed Tasks */}
                <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors">
                  <div>
                    <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Completed</span>
                    <span className="text-2xl sm:text-3xl font-extrabold block mt-2 text-slate-900 dark:text-white">{report.stats.completedTasks}</span>
                  </div>
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                </div>

                {/* Pending Tasks */}
                <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors">
                  <div>
                    <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Pending Tasks</span>
                    <span className="text-2xl sm:text-3xl font-extrabold block mt-2 text-slate-900 dark:text-white">{report.stats.pendingTasks}</span>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                </div>

                {/* Overdue Tasks */}
                <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors">
                  <div>
                    <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Overdue Tasks</span>
                    <span className={`text-2xl sm:text-3xl font-extrabold block mt-2 ${report.stats.overdueTasks > 0 ? 'text-[#ff3b30]' : 'text-slate-900 dark:text-white'}`}>{report.stats.overdueTasks}</span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.stats.overdueTasks > 0 ? 'bg-red-500/15 text-[#ff3b30] border border-red-100 dark:border-red-900/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                    <AlertTriangle size={18} />
                  </div>
                </div>

              </div>

              {/* Progress Panel */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm transition-colors">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#ff3b30]" />
                    Overall Project Progress
                  </span>
                  <span className="text-[#ff3b30] font-extrabold">{report.stats.projectProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#18191e] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#ff3b30] h-full rounded-full transition-all duration-300"
                    style={{ width: `${report.stats.projectProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Team Performance Table */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-sm transition-colors">
                <div className="p-6 border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#1c1d21]/30">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-850 dark:text-white">Team Performance Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#1c1d21]/20">
                        <th className="p-4 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-6">Member</th>
                        <th className="p-4 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center">Total Tasks</th>
                        <th className="p-4 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center">Completed</th>
                        <th className="p-4 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center">Pending</th>
                        <th className="p-4 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center">Overdue</th>
                        <th className="p-4 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest pr-6 text-right">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800/50 text-slate-800 dark:text-slate-200">
                      {report.teamPerformance.map((member) => (
                        <tr key={member.userId} className="hover:bg-slate-50/30 dark:hover:bg-[#1c1d21]/15 transition-colors">
                          {/* Member Info */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-[#ff3b30] flex items-center justify-center font-bold text-[10px] overflow-hidden border border-red-100 dark:border-red-900/20">
                                {member.avatar ? (
                                  <img src={member.avatar} alt={member.userName} className="w-full h-full object-cover" />
                                ) : (
                                  member.userName.split(' ').map(n => n[0]).join('')
                                )}
                              </div>
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{member.userName}</span>
                            </div>
                          </td>

                          {/* Total Assigned */}
                          <td className="p-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {member.totalTasks}
                          </td>

                          {/* Completed */}
                          <td className="p-4 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {member.completedTasks}
                          </td>

                          {/* Pending */}
                          <td className="p-4 text-center text-xs font-semibold text-blue-600 dark:text-blue-450">
                            {member.pendingTasks}
                          </td>

                          {/* Overdue */}
                          <td className={`p-4 text-center text-xs font-semibold ${member.overdueTasks > 0 ? 'text-[#ff3b30] font-extrabold' : 'text-slate-450 dark:text-slate-500'}`}>
                            {member.overdueTasks}
                          </td>

                          {/* Rate percentage bar */}
                          <td className="p-4 pr-6">
                            <div className="flex items-center justify-end gap-3">
                              <div className="w-20 bg-slate-100 dark:bg-[#18191e] h-1.5 rounded-full overflow-hidden hidden sm:block">
                                <div 
                                  className="bg-[#ff3b30] h-full rounded-full"
                                  style={{ width: `${member.completionRate}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{member.completionRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : null}

        </div>
      </Layout>
    </RouteGuard>
  );
}
