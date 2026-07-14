'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, ArrowRight, FolderKanban, Trash2 } from 'lucide-react';

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

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project permanently? This will remove all tasks and member records.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  return (
    <RouteGuard allowedRoles={['PROJECT_MANAGER']}>
      <Layout>
        {/* Outer Directory Container - Theme matching deep bg */}
        <div className="space-y-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200 min-h-[80vh] pb-12">
          
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b30]/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Projects</h2>
              <p className="text-slate-555 dark:text-slate-400 text-sm mt-0.5">Create and organize project modules, timelines, and deliverables.</p>
            </div>
            
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-[#ff3b30] hover:bg-[#e02d22] text-white font-semibold text-xs uppercase tracking-wider px-4.5 py-3 rounded-2xl shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-150 active:scale-[0.98] self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Create Project</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="relative w-8 h-8 mx-auto">
                <div className="absolute inset-0 border-3 border-[#ff3b30]/10 rounded-full"></div>
                <div className="absolute inset-0 border-3 border-[#ff3b30] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="mx-4 bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-12 text-center text-slate-450">
              No projects managed yet. Create your first project to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-800/80 transition-all duration-200 group">
                  <div>
                    {/* Status */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                        project.status === 'COMPLETED' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' :
                        project.status === 'ARCHIVED' ? 'bg-slate-105 dark:bg-slate-805 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60' :
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

                    {/* Timeline */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-550 dark:text-slate-400 mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/50">
                      <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
                      <span>Due: <strong className="font-bold text-slate-700 dark:text-slate-300">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No deadline'}
                      </strong></span>
                    </div>
                  </div>

                  {/* Progress */}
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
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-[#ff3b30] transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 size={15} />
                      </button>
                      
                      <button
                        onClick={() => router.push(`/pm/projects/${project.id}`)}
                        className="flex items-center gap-1.5 text-xs font-extrabold text-[#ff3b30] hover:underline"
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
              <div className="fixed inset-0 bg-slate-955/65 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6.5 shadow-2xl relative z-10 text-slate-900 dark:text-white transition-colors">
                
                <h3 className="font-extrabold text-sm uppercase tracking-wider mb-4 text-slate-850 dark:text-white">Create New Project</h3>
                
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Project Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. Website Redesign"
                      className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Enter brief description of project goals..."
                      rows="3"
                      className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Start Date</label>
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">End Date / Deadline</label>
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white" 
                      />
                    </div>
                  </div>

                  {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
                  {success && <p className="text-xs text-emerald-500 font-semibold">{success}</p>}

                  <div className="flex justify-end gap-3 mt-8 border-t border-slate-200 dark:border-slate-800/80 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4.5 py-2.5 text-xs font-bold text-white bg-[#ff3b30] hover:bg-[#e02d22] rounded-xl shadow-lg shadow-red-500/10 transition-all"
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
