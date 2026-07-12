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
        <div className="space-y-6">
          
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Project Directory</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Full index of system workspace projects and completion statuses.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              No projects have been created yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                        project.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
                        project.status === 'ARCHIVED' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                        'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {project.status}
                      </span>
                      <FolderKanban className="text-slate-300 dark:text-slate-700" size={20} />
                    </div>

                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 line-clamp-1">{project.name}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 line-clamp-2 min-h-8 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>

                    {/* Metadata */}
                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <User size={14} className="text-slate-400" />
                        <span>Owner: <strong className="font-medium text-slate-700 dark:text-slate-300">{project.creator?.firstName} {project.creator?.lastName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar size={14} className="text-slate-400" />
                        <span>Due: <strong className="font-medium text-slate-700 dark:text-slate-300">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No deadline'}
                        </strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      <span>Tasks Progress</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-slate-400">
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
