'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, ArrowRight, FolderKanban } from 'lucide-react';

export default function PMProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/projects', {
        name,
        description,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setSuccess('Project created successfully!');
      fetchProjects();
      setTimeout(() => {
        setModalOpen(false);
        setName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    }
  };

  return (
    <RouteGuard allowedRoles={['PROJECT_MANAGER']}>
      <Layout>
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">My Projects</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Create and organize project modules, timelines, and deliverables.</p>
            </div>
            
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-3 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
            >
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              No projects managed yet. Create your first project to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    {/* Status */}
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

                    {/* Timeline */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <Calendar size={14} className="text-slate-400" />
                      <span>Due: <strong className="font-medium text-slate-700 dark:text-slate-300">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No deadline'}
                      </strong></span>
                    </div>
                  </div>

                  {/* Progress */}
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
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-[10px] text-slate-400">
                        <span>{project._count?.members || 0} assigned member(s)</span>
                      </div>
                      
                      <button
                        onClick={() => router.push(`/pm/projects/${project.id}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>Workspace</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Create Project Modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10">
                
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Create New Project</h3>
                
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Project Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. Website Redesign"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Description</label>
                    <textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Enter brief description of project goals..."
                      rows="3"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">End Date / Deadline</label>
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none" 
                      />
                    </div>
                  </div>

                  {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
                  {success && <p className="text-xs text-emerald-500 font-medium">{success}</p>}

                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      type="button" 
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                    >
                      Create Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </Layout>
    </RouteGuard>
  );
}
