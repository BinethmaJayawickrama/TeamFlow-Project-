'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import TaskDetailsModal from '../../../components/TaskDetailsModal';
import { 
  CheckSquare, Calendar, CheckCircle2, 
  Clock, AlertCircle, ArrowUpRight, FolderKanban 
} from 'lucide-react';

export default function MemberDashboard() {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);

      // Collect all tasks assigned to me across these projects
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
      setError('Failed to load dashboard workspace data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleOpenTask = (taskId) => {
    setSelectedTaskId(taskId);
    setModalOpen(true);
  };

  // Metrics
  const totalTasks = assignedTasks.length;
  const completedTasks = assignedTasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingTasks = totalTasks - completedTasks;
  
  const nowStr = new Date().toDateString();
  const tasksDueToday = assignedTasks.filter(
    (t) => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate).toDateString() === nowStr
  );

  return (
    <RouteGuard allowedRoles={['TEAM_MEMBER']}>
      <Layout>
        <div className="space-y-6">
          
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Collaborator Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back, {user?.firstName}. Access and update your deliverables.</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-800/50 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Assigned Tasks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Assigned Tasks</span>
                <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{totalTasks}</span>
              </div>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                <CheckSquare size={20} />
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Tasks Completed</span>
                <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{completedTasks}</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Pending Tasks</span>
                <span className="text-3xl font-extrabold block mt-2 text-slate-800 dark:text-slate-100">{pendingTasks}</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>

            {/* Due Today */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Due Today</span>
                <span className={`text-3xl font-extrabold block mt-2 ${tasksDueToday.length > 0 ? 'text-amber-500' : 'text-slate-850 dark:text-slate-100'}`}>{tasksDueToday.length}</span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tasksDueToday.length > 0 ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                <Calendar size={20} />
              </div>
            </div>

          </div>

          {/* Action Boards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Due Today Alerts & Projects List */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Due Today Alerts */}
              {tasksDueToday.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-sm text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <AlertCircle size={18} />
                    Timelines Due Today
                  </h3>
                  <div className="space-y-2">
                    {tasksDueToday.map((task) => (
                      <div 
                        key={task.id} 
                        onClick={() => handleOpenTask(task.id)}
                        className="bg-white dark:bg-slate-900 hover:bg-slate-50 border border-amber-100 dark:border-slate-800 p-3 rounded-xl cursor-pointer text-xs font-semibold"
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Assigned */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FolderKanban size={18} className="text-indigo-500" />
                  My Projects ({projects.length})
                </h3>

                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 bg-slate-50/20 dark:bg-slate-900">
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{proj.name}</p>
                        <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{proj.progress}% completed</span>
                      </div>
                      
                      <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden shrink-0">
                        <div className="bg-indigo-650 h-full rounded-full" style={{ width: `${proj.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Assigned Tasks list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-2">
              <h3 className="font-bold text-base mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckSquare size={18} className="text-indigo-500" />
                Work Checklist
              </h3>

              <div className="space-y-4">
                {loading ? (
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto py-8"></div>
                ) : assignedTasks.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-12">No tasks assigned to you.</p>
                ) : (
                  assignedTasks.map((task) => (
                    <div 
                      key={task.id} 
                      onClick={() => handleOpenTask(task.id)}
                      className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">
                          {task.projectName}
                        </span>
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{task.title}</h4>
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mt-2">
                          {task.status}
                        </span>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                          task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
                          task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                          'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 justify-end">
                            <Calendar size={12} />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Details Modal */}
          <TaskDetailsModal
            taskId={selectedTaskId}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onTaskUpdated={fetchDashboardData}
          />

        </div>
      </Layout>
    </RouteGuard>
  );
}
