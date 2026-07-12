'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import TaskDetailsModal from '../../../components/TaskDetailsModal';
import { 
  ArrowLeft, ArrowRight, Eye, 
  Calendar, AlertCircle, FolderKanban 
} from 'lucide-react';

export default function KanbanBoard() {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error(err);
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

  const handleMoveStatus = async (taskId, currentStatus, direction) => {
    const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    const currentIndex = statuses.indexOf(currentStatus);
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= statuses.length) return;
    const nextStatus = statuses[nextIndex];

    try {
      await api.put(`/tasks/${taskId}`, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to update task status.');
    }
  };

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'border-t-[#ff3b30] bg-[#ff3b30]/5' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-t-[#ff9500] bg-[#ff9500]/5' },
    { id: 'REVIEW', title: 'Review', color: 'border-t-[#ffcc00] bg-[#ffcc00]/5' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-t-emerald-500 bg-emerald-500/5' },
  ];

  const getTasksByColumn = (colId) => {
    return assignedTasks.filter((t) => t.status === colId);
  };

  return (
    <RouteGuard allowedRoles={['TEAM_MEMBER']}>
      <Layout>
        {/* Outer Directory Container - Theme matching deep bg */}
        <div className="space-y-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200 min-h-[80vh] pb-12">
          
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b30]/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header Banner */}
          <div className="p-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Kanban Board</h2>
            <p className="text-slate-555 dark:text-slate-400 text-sm mt-0.5">Visualize project workflows. Update task statuses using action controls.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="relative w-8 h-8 mx-auto">
                <div className="absolute inset-0 border-3 border-[#ff3b30]/10 rounded-full"></div>
                <div className="absolute inset-0 border-3 border-[#ff3b30] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start overflow-y-auto px-4">
              {columns.map((col) => {
                const colTasks = getTasksByColumn(col.id);
                return (
                  <div 
                    key={col.id} 
                    className={`bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/60 border-t-4 rounded-3xl p-4 shadow-sm flex flex-col justify-between ${col.color}`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-150 dark:border-slate-800/60">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-850 dark:text-white">{col.title}</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-bold">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Task List */}
                    <div className="space-y-3 flex-1 overflow-y-auto min-h-[25rem] pr-0.5 scrollbar-thin">
                      {colTasks.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 dark:text-slate-550 text-xs font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                          No tasks here.
                        </div>
                      ) : (
                        colTasks.map((task) => (
                          <div 
                            key={task.id}
                            className="bg-white dark:bg-[#1c1d21]/45 border border-slate-200 dark:border-slate-800/60 hover:border-slate-350 dark:hover:border-slate-700 p-4 rounded-2xl shadow-sm space-y-3 transition-colors group"
                          >
                            <div>
                              <span className="text-[8px] font-extrabold text-[#ff3b30] uppercase tracking-wider block">
                                {task.projectName}
                              </span>
                              <h4 className="font-bold text-xs text-slate-850 dark:text-slate-200 mt-1 line-clamp-2 leading-normal">
                                {task.title}
                              </h4>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                              <span className={`inline-flex px-1.5 py-0.5 rounded font-bold text-[8px] tracking-wider uppercase border ${
                                task.priority === 'HIGH' ? 'bg-red-50/50 dark:bg-red-950/20 text-[#ff3b30] border-red-100 dark:border-red-900/30' :
                                task.priority === 'MEDIUM' ? 'bg-amber-50/50 dark:bg-amber-950/20 text-[#ff9500] border-amber-100 dark:border-amber-900/30' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50'
                              }`}>
                                {task.priority}
                              </span>
                              {task.dueDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar size={10} />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>

                            {/* Card Actions */}
                            <div className="pt-3 border-t border-slate-150 dark:border-slate-850 flex items-center justify-between">
                              <button
                                onClick={() => handleOpenTask(task.id)}
                                className="flex items-center gap-1 text-[10px] font-extrabold text-slate-500 hover:text-[#ff3b30] hover:underline"
                                title="View details"
                              >
                                <Eye size={12} />
                                <span>Details</span>
                              </button>

                              {/* Arrows mapping for flow */}
                              <div className="flex items-center gap-1.5">
                                {col.id !== 'TODO' && (
                                  <button
                                    onClick={() => handleMoveStatus(task.id, task.status, -1)}
                                    className="p-1 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#ff3b30] transition-colors"
                                    title="Move back"
                                  >
                                    <ArrowLeft size={10} />
                                  </button>
                                )}
                                {col.id !== 'COMPLETED' && (
                                  <button
                                    onClick={() => handleMoveStatus(task.id, task.status, 1)}
                                    className="p-1 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#ff3b30] transition-colors"
                                    title="Move forward"
                                  >
                                    <ArrowRight size={10} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
