'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { Calendar, User, FolderKanban } from 'lucide-react';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data.projects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <Layout>
        {/* Outer Directory Container - Theme matching deep bg */}
        <div className="space-y-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200 min-h-[80vh] pb-12">
          
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b30]/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header Banner */}
          <div className="p-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Projects</h2>
            <p className="text-slate-550 dark:text-slate-400 text-sm mt-0.5">Full index of system workspace projects and completion statuses.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="relative w-8 h-8 mx-auto">
                <div className="absolute inset-0 border-3 border-[#ff3b30]/10 rounded-full"></div>
                <div className="absolute inset-0 border-3 border-[#ff3b30] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="mx-4 bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-12 text-center text-slate-400">
              No projects have been created yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-800/80 transition-all duration-200 group">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                        project.status === 'COMPLETED' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' :
                        project.status === 'ARCHIVED' ? 'bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60' :
                        'bg-red-50/50 dark:bg-red-950/20 text-[#ff3b30] border border-red-100 dark:border-red-900/30'
                      }`}>
                        {project.status}
                      </span>
                      <FolderKanban className="text-slate-300 dark:text-slate-600 group-hover:text-[#ff3b30] transition-colors" size={18} />
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 leading-snug">{project.name}</h3>
                    <p className="text-slate-450 dark:text-slate-500 text-xs mt-2 line-clamp-2 min-h-8 leading-relaxed font-semibold">
                      {project.description || 'No description provided.'}
                    </p>

                    {/* Metadata */}
                    <div className="space-y-2.5 mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/50">
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                        <User size={14} className="text-slate-400 dark:text-slate-500" />
                        <span>Owner: <strong className="font-bold text-slate-700 dark:text-slate-300">{project.creator?.firstName} {project.creator?.lastName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
                        <span>Due: <strong className="font-bold text-slate-700 dark:text-slate-300">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No deadline'}
                        </strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mt-6 pt-4 border-t border-slate-150 dark:border-slate-800/50">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      <span>Tasks Progress</span>
                      <span className="text-[#ff3b30] font-extrabold">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#18191e] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#ff3b30] h-full rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                      <span>{project._count?.members || 0} assigned member(s)</span>
                      <span>{project.completedTasks}/{project.totalTasks} completed</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </Layout>
    </RouteGuard>
  );
}
