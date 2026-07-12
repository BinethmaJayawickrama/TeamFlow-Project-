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

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <Layout>
        <div className="space-y-6">
          
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Audit Trail</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Chronological registry of actions performed across the TeamFlow workspace.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              No activity logs recorded.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="relative border-l border-slate-100 dark:border-slate-800 ml-4 md:ml-6 space-y-6 py-2">
                {logs.map((log) => (
                  <div key={log.id} className="relative pl-6 md:pl-8 group">
                    {/* Circle Node */}
                    <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-900 group-hover:scale-125 transition-transform"></div>
                    
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 transition-colors max-w-3xl">
                      {/* Top Row: User details */}
                      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-indigo-500" />
                          <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                            {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System / Guest'}
                          </span>
                          {log.user && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 dark:text-slate-500">
                              {log.user.role.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock size={12} />
                          <span>
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Log Action Content */}
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {log.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </Layout>
    </RouteGuard>
  );
}
