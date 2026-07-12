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
    <RouteGuard allowedRoles={['TEAM_MEMBER']}>
      <Layout>
        <div className="space-y-6">
          
          <div>
            <h2 className="text-2xl font-bold tracking-tight">My Tasks</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Full index of tasks assigned to you. Review description details and update progress status.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search assigned tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none"
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Tasks list Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  No assigned tasks match your filters.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => handleOpenTask(task.id)}
                    className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">
                        {task.projectName}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-850 dark:text-slate-150 truncate max-w-lg">{task.title}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">
                        {task.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right space-y-1.5 hidden sm:block shrink-0">
                        <div className="flex items-center gap-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                            task.status === 'REVIEW' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' :
                            task.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                            'bg-slate-100 text-slate-500 dark:bg-slate-800'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' :
                            task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                            'bg-slate-100 text-slate-500 dark:bg-slate-800'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        {task.dueDate && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 justify-end font-semibold">
                            <Calendar size={12} />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <ChevronRight size={16} className="text-slate-350 dark:text-slate-600" />
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
