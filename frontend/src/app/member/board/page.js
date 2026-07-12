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
    { id: 'TODO', title: 'To Do', color: 'border-t-indigo-500 bg-indigo-50/10' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-t-amber-500 bg-amber-50/10' },
    { id: 'REVIEW', title: 'Review', color: 'border-t-blue-500 bg-blue-50/10' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-t-emerald-500 bg-emerald-50/10' },
  ];

  const getTasksByColumn = (colId) => {
    return assignedTasks.filter((t) => t.status === colId);
  };

  return (
    <RouteGuard allowedRoles={['TEAM_MEMBER']}>
      <Layout>
        <div className="space-y-6">
          
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Kanban Board</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Visualize project workflows. Update task statuses using action controls.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 board-height items-start overflow-y-auto">
              {columns.map((col) => {
                const colTasks = getTasksByColumn(col.id);
                return (
                  <div 
                    key={col.id} 
                    className={`bg-white dark:bg-slate-900 border-t-4 border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm h-full flex flex-col justify-between ${col.color}`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800/80">
                      <span className="font-bold text-sm tracking-tight">{col.title}</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-bold">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Task List */}
                    <div className="space-y-3 flex-1 overflow-y-auto min-h-64 pr-0.5">
                      {colTasks.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-150 dark:border-slate-800 rounded-2xl">
                          No tasks here.
                        </div>
                      ) : (
                        colTasks.map((task) => (
                          <div 
                            key={task.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 p-4 rounded-2xl shadow-sm space-y-3 transition-colors group"
                          >
                            <div>
                              <span className="text-[8px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">
                                {task.projectName}
                              </span>
                              <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-1 line-clamp-2 leading-normal">
                                {task.title}
                              </h4>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className={`inline-block px-1.5 py-0.5 rounded font-bold text-[8px] tracking-wider uppercase ${
                                task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' :
                                task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                                'bg-slate-100 text-slate-650 dark:bg-slate-850'
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
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                              <button
                                onClick={() => handleOpenTask(task.id)}
                                className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-indigo-500 hover:underline"
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
                                    className="p-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"
                                    title="Move back"
                                  >
                                    <ArrowLeft size={10} />
                                  </button>
                                )}
                                {col.id !== 'COMPLETED' && (
                                  <button
                                    onClick={() => handleMoveStatus(task.id, task.status, 1)}
                                    className="p-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"
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
