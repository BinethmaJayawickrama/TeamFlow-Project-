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

  if (loading) {
    return (
      <RouteGuard allowedRoles={['TEAM_MEMBER']}>
        <Layout>
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-3 border-[#ff3b30]/10 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-[#ff3b30] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </Layout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['TEAM_MEMBER']}>
      <Layout>
        {/* Outer Console Shell - Dynamic bg and text colors for dark and light modes */}
        <div className="space-y-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200 min-h-[80vh] pb-12">
          
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b30]/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header */}
          <div className="p-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Collaborator Dashboard</h2>
            <p className="text-slate-555 dark:text-slate-400 text-sm mt-0.5">Welcome back, {user?.firstName}. Access and update your deliverables.</p>
          </div>

          {error && (
            <div className="mx-4 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-800/50 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Core Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            
            {/* Assigned Tasks */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors">
              <div>
                <span className="text-slate-455 dark:text-slate-550 text-[10px] font-bold uppercase tracking-widest block">Assigned Tasks</span>
                <span className="text-2xl sm:text-3xl font-extrabold block mt-2 text-slate-900 dark:text-white">{totalTasks}</span>
              </div>
              <div className="w-10 h-10 bg-red-500/10 text-[#ff3b30] rounded-xl flex items-center justify-center">
                <CheckSquare size={18} />
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors">
              <div>
                <span className="text-slate-455 dark:text-slate-550 text-[10px] font-bold uppercase tracking-widest block">Completed</span>
                <span className="text-2xl sm:text-3xl font-extrabold block mt-2 text-slate-900 dark:text-white">{completedTasks}</span>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors">
              <div>
                <span className="text-slate-455 dark:text-slate-550 text-[10px] font-bold uppercase tracking-widest block">Pending Tasks</span>
                <span className="text-2xl sm:text-3xl font-extrabold block mt-2 text-slate-900 dark:text-white">{pendingTasks}</span>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                <Clock size={18} />
              </div>
            </div>

            {/* Due Today */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors">
              <div>
                <span className="text-slate-455 dark:text-slate-550 text-[10px] font-bold uppercase tracking-widest block">Due Today</span>
                <span className={`text-2xl sm:text-3xl font-extrabold block mt-2 ${tasksDueToday.length > 0 ? 'text-[#ff9500]' : 'text-slate-900 dark:text-white'}`}>{tasksDueToday.length}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tasksDueToday.length > 0 ? 'bg-amber-500/15 text-[#ff9500] border border-amber-100 dark:border-amber-900/30 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                <Calendar size={18} />
              </div>
            </div>

          </div>

          {/* Action Boards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
            
            {/* Left Column: Deadlines Alerts & Projects List */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Due Today Alerts */}
              {tasksDueToday.length > 0 && (
                <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-200/60 dark:border-[#ff9500]/20 p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#ff9500] flex items-center gap-2">
                    <AlertCircle size={16} />
                    Due Today Alerts
                  </h3>
                  <div className="space-y-2">
                    {tasksDueToday.map((task) => (
                      <div 
                        key={task.id} 
                        onClick={() => handleOpenTask(task.id)}
                        className="bg-white dark:bg-[#1e1f25] border border-amber-100 dark:border-slate-800 hover:border-[#ff9500] p-3 rounded-xl cursor-pointer text-xs font-semibold transition-colors text-slate-800 dark:text-slate-200"
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Assigned list */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm transition-colors">
                <h3 className="font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2 text-slate-850 dark:text-white">
                  <FolderKanban size={16} className="text-[#ff9500]" />
                  My Projects ({projects.length})
                </h3>

                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="p-3 border border-slate-150 dark:border-slate-800/60 rounded-2xl flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-[#1c1d21]/30">
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{proj.name}</p>
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold block mt-0.5">{proj.progress}% completed</span>
                      </div>
                      
                      <div className="w-12 bg-slate-100 dark:bg-[#18191e] h-1 rounded-full overflow-hidden shrink-0">
                        <div className="bg-[#ff3b30] h-full rounded-full" style={{ width: `${proj.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Assigned Tasks List Checklist */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm lg:col-span-2 transition-colors">
              <h3 className="font-bold text-xs uppercase tracking-wider mb-6 flex items-center gap-2 text-slate-850 dark:text-white">
                <CheckSquare size={16} className="text-[#ff3b30]" />
                Work Checklist
              </h3>

              <div className="space-y-4">
                {assignedTasks.length === 0 ? (
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold text-center py-12">No tasks currently assigned to you.</p>
                ) : (
                  assignedTasks.map((task) => (
                    <div 
                      key={task.id} 
                      onClick={() => handleOpenTask(task.id)}
                      className="bg-slate-50/60 dark:bg-[#1c1d21]/30 hover:bg-slate-100 dark:hover:bg-[#1c1d21]/50 border border-slate-250 dark:border-slate-800/65 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold text-[#ff3b30] uppercase tracking-wider block">
                          {task.projectName}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">{task.title}</h4>
                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-150 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-650 dark:text-slate-400 mt-2">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          task.priority === 'HIGH' ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-[#ff3b30]' :
                          task.priority === 'MEDIUM' ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-[#ff9500]' :
                          'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-[9px] text-[#ff9500] font-bold uppercase tracking-wider mt-2 justify-end">
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

          {/* Details Modal Popup component */}
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
