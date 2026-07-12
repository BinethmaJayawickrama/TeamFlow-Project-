'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import TaskDetailsModal from '../../../components/TaskDetailsModal';
import { Search, Calendar, ChevronRight } from 'lucide-react';

export default function MemberTasksList() {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/projects');
      const tasks = [];
      res.data.projects.forEach((proj) => {
        if (proj.tasks) {
          proj.tasks.forEach((t) => {
            if (t.assigneeId === user.id) {
              tasks.push({
                ...t,
                projectName: proj.name,
              });
            }
          });
        }
      });
      setAssignedTasks(tasks);
    } catch (err) {
      console.error('Failed to load checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleOpenTask = (taskId) => {
    setSelectedTaskId(taskId);
    setModalOpen(true);
  };

  // Filter tasks
  const filteredTasks = assignedTasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <RouteGuard allowedRoles={['TEAM_MEMBER', 'PROJECT_MANAGER']}>
      <Layout>
        {/* Outer Directory Container - Theme matching deep bg */}
        <div className="space-y-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200 min-h-[80vh] pb-12">
          
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b30]/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header Banner */}
          <div className="p-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Tasks</h2>
            <p className="text-slate-555 dark:text-slate-400 text-sm mt-0.5">Full index of tasks assigned to you. Review description details and update progress status.</p>
          </div>

          {/* Filters Area */}
          <div className="flex flex-col md:flex-row gap-4 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-slate-450 dark:text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search assigned tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#1e1f25]/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-800 dark:text-white transition-colors"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-[#1e1f25]/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-800 dark:text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-50 dark:bg-[#1e1f25]/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-800 dark:text-white"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Tasks list Card */}
          <div className="mx-4 bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-sm transition-colors">
            <div className="divide-y divide-slate-150 dark:divide-slate-800/60">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="relative w-8 h-8 mx-auto">
                    <div className="absolute inset-0 border-3 border-[#ff3b30]/10 rounded-full"></div>
                    <div className="absolute inset-0 border-3 border-[#ff3b30] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="p-16 text-center text-slate-400 dark:text-slate-550 font-medium">
                  No assigned tasks match your filters.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => handleOpenTask(task.id)}
                    className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/30 dark:hover:bg-[#1c1d21]/15 cursor-pointer transition-colors border-b border-slate-150 dark:border-slate-800/50 last:border-b-0"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-[9px] font-extrabold text-[#ff3b30] uppercase tracking-wider block">
                        {task.projectName}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-850 dark:text-slate-150 truncate max-w-lg leading-snug">{task.title}</h4>
                      <p className="text-xs text-slate-450 dark:text-slate-500 line-clamp-1 font-semibold mt-0.5">
                        {task.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right space-y-1.5 hidden sm:block">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            task.status === 'COMPLETED' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30' :
                            task.status === 'REVIEW' ? 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 border-blue-105 dark:border-blue-900/30' :
                            task.status === 'IN_PROGRESS' ? 'bg-amber-50/50 dark:bg-amber-950/20 text-[#ff9500] border-amber-100 dark:border-amber-900/30' :
                            'bg-red-50/50 dark:bg-red-950/20 text-[#ff3b30] border border-red-100 dark:border-red-900/30'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            task.priority === 'HIGH' ? 'bg-red-50/50 dark:bg-red-950/20 text-[#ff3b30] border-red-100 dark:border-red-900/30' :
                            task.priority === 'MEDIUM' ? 'bg-amber-50/50 dark:bg-amber-950/20 text-[#ff9500] border-amber-100 dark:border-amber-900/30' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        {task.dueDate && (
                          <div className="text-[9px] text-[#ff9500] flex items-center gap-1 mt-1 justify-end font-bold uppercase tracking-wider">
                            <Calendar size={12} />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <ChevronRight size={16} className="text-slate-400 dark:text-slate-600" />
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details Modal */}
          <TaskDetailsModal
            taskId={selectedTaskId}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onTaskUpdated={fetchTasks}
          />

        </div>
      </Layout>
    </RouteGuard>
  );
}
