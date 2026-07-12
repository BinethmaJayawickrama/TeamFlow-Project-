'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { History, User, Clock } from 'lucide-react';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/activity-logs');
        setLogs(res.data.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Helper to determine timeline node border color based on performing user role
  const getNodeBorderColor = (role) => {
    if (role === 'ADMIN') return 'border-[#ff3b30]';              // Red
    if (role === 'PROJECT_MANAGER') return 'border-[#ff9500]';     // Orange
    if (role === 'TEAM_MEMBER') return 'border-[#ffcc00]';        // Yellow
    return 'border-slate-400';
  };

  // Helper to determine User icon color based on performing user role
  const getUserIconColor = (role) => {
    if (role === 'ADMIN') return 'text-[#ff3b30]';              // Red
    if (role === 'PROJECT_MANAGER') return 'text-[#ff9500]';     // Orange
    if (role === 'TEAM_MEMBER') return 'text-[#ffcc00]';        // Yellow
    return 'text-slate-400';
  };

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <Layout>
        {/* Outer Directory Container - Theme matching deep bg */}
        <div className="space-y-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200 min-h-[80vh] pb-12">
          
          {/* Dual Glow Orbs - Red & Orange */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b30]/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ff9500]/5 rounded-full blur-[70px] pointer-events-none"></div>

          {/* Header Banner */}
          <div className="p-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Trail</h2>
            <p className="text-slate-555 dark:text-slate-400 text-sm mt-0.5">Chronological registry of actions performed across the TeamFlow workspace.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="relative w-8 h-8 mx-auto">
                <div className="absolute inset-0 border-3 border-[#ff9500]/10 rounded-full"></div>
                <div className="absolute inset-0 border-3 border-[#ff9500] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="mx-4 bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-12 text-center text-slate-400">
              No activity logs recorded.
            </div>
          ) : (
            <div className="mx-4 bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm transition-colors">
              <div className="relative border-l border-slate-155 dark:border-slate-800/60 ml-4 md:ml-6 space-y-6 py-2">
                {logs.map((log) => {
                  const userRole = log.user?.role || 'SYSTEM';
                  const nodeBorderClass = getNodeBorderColor(userRole);
                  const userIconClass = getUserIconColor(userRole);

                  return (
                    <div key={log.id} className="relative pl-6 md:pl-8 group">
                      {/* Circle Node - Alternates red, orange, and yellow semantically based on role */}
                      <div className={`absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${nodeBorderClass} bg-white dark:bg-[#1e1f25] group-hover:scale-125 transition-transform`}></div>
                      
                      {/* Log Card */}
                      <div className="bg-slate-50/60 dark:bg-[#1c1d21]/30 hover:bg-slate-100 dark:hover:bg-[#1c1d21]/50 border border-slate-200 dark:border-slate-800/65 rounded-2xl p-4 transition-colors max-w-3xl">
                        {/* Top Row: User details */}
                        <div className="flex items-center justify-between gap-4 mb-2 flex-wrap sm:flex-nowrap">
                          <div className="flex items-center gap-2">
                            <User size={12} className={userIconClass} />
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-350">
                              {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System / Guest'}
                            </span>
                            {log.user && (
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                log.user.role === 'ADMIN' ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-[#ff3b30]' :
                                log.user.role === 'PROJECT_MANAGER' ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-[#ff9500]' :
                                'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-105 dark:border-yellow-900/30 text-[#ffcc00]'
                              }`}>
                                {log.user.role.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          
                          {/* Clock Icon colored in orange/yellow for palette balance */}
                          <div className="flex items-center gap-1.5 text-[9px] text-[#ff9500] font-bold uppercase tracking-wider">
                            <Clock size={12} />
                            <span>
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
   
                        {/* Log Action Content */}
                        <p className="text-xs sm:text-sm text-slate-850 dark:text-slate-200 leading-relaxed font-semibold">
                          {log.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </Layout>
    </RouteGuard>
  );
}
