'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { 
  FileSpreadsheet, ClipboardList, CheckCircle2, 
  Clock, AlertTriangle, TrendingUp, User 
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
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Performance Reports</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Analyze task completions, overdue deadlines, and team contributions.</p>
            </div>
            
            {/* Project Selection Dropdown */}
            {!loadingProjects && projects.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:inline">Select Project:</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-800/50 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {loadingProjects || loadingReport ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              No projects available to report on.
            </div>
          ) : report ? (
            <div className="space-y-6">
              
              {/* Report Stats Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Tasks */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Tasks</span>
                    <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{report.stats.totalTasks}</span>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                    <ClipboardList size={20} />
                  </div>
                </div>

                {/* Completed Tasks */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Completed</span>
                    <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{report.stats.completedTasks}</span>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>

                {/* Pending Tasks */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Pending Tasks</span>
                    <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{report.stats.pendingTasks}</span>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                </div>

                {/* Overdue Tasks */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Overdue Tasks</span>
                    <span className={`text-3xl font-extrabold block mt-2 ${report.stats.overdueTasks > 0 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>{report.stats.overdueTasks}</span>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${report.stats.overdueTasks > 0 ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                    <AlertTriangle size={20} />
                  </div>
                </div>

              </div>

              {/* Progress Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-500" />
                    Overall Project Progress
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400">{report.stats.projectProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${report.stats.projectProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Team Performance Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80">
                  <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">Team Performance Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/55">
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider pl-6">Member</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Total Tasks</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Completed</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Pending</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Overdue</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider pr-6 text-right">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {report.teamPerformance.map((member) => (
                        <tr key={member.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          {/* Member Info */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs overflow-hidden">
                                {member.avatar ? (
                                  <img src={member.avatar} alt={member.userName} className="w-full h-full object-cover" />
                                ) : (
                                  member.userName.split(' ').map(n => n[0]).join('')
                                )}
                              </div>
                              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{member.userName}</span>
                            </div>
                          </td>

                          {/* Total Assigned */}
                          <td className="p-4 text-center text-xs font-semibold text-slate-650 dark:text-slate-350">
                            {member.totalTasks}
                          </td>

                          {/* Completed */}
                          <td className="p-4 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-450">
                            {member.completedTasks}
                          </td>

                          {/* Pending */}
                          <td className="p-4 text-center text-xs font-semibold text-blue-600 dark:text-blue-450">
                            {member.pendingTasks}
                          </td>

                          {/* Overdue */}
                          <td className={`p-4 text-center text-xs font-semibold ${member.overdueTasks > 0 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
                            {member.overdueTasks}
                          </td>

                          {/* Rate percentage bar */}
                          <td className="p-4 pr-6">
                            <div className="flex items-center justify-end gap-3">
                              <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                <div 
                                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full"
                                  style={{ width: `${member.completionRate}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{member.completionRate}%</span>
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
