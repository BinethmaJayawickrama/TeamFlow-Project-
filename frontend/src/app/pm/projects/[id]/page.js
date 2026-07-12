'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../../components/RouteGuard';
import Layout from '../../../../components/Layout';
import api from '../../../../services/api';
import { 
  ArrowLeft, Plus, Users, CheckSquare, 
  Trash2, X, UserMinus, ShieldAlert, Calendar 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PMProjectWorkspace({ params }) {
  const projectId = parseInt(params.id);
  const router = useRouter();
  
  const [project, setProject] = useState(null);
  const [systemUsers, setSystemUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Add Member State
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  
  // Create Task State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskStatus, setTaskStatus] = useState('TODO');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');

  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchProjectDetails = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data.project);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details.');
      console.error(err);
    }
  };

  const fetchSystemUsers = async () => {
    try {
      const res = await api.get('/users');
      setSystemUsers(res.data.users);
    } catch (err) {
      console.error('Failed to load system users list:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchProjectDetails();
      await fetchSystemUsers();
      setLoading(false);
    };
    init();
  }, [projectId]);

  const handleAddMembers = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (selectedUserIds.length === 0) {
      setModalError('Please select at least one member to add.');
      return;
    }

    try {
      await api.post(`/projects/${projectId}/members`, {
        userIds: selectedUserIds,
      });
      setModalSuccess('Members added successfully!');
      fetchProjectDetails();
      setTimeout(() => {
        setMemberModalOpen(false);
        setSelectedUserIds([]);
        setModalSuccess('');
      }, 1000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to add members.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (userId === project.creatorId) {
      alert('Cannot remove the project creator.');
      return;
    }
    if (!window.confirm('Remove this collaborator from the project?')) return;

    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    try {
      await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate || undefined,
        projectId,
        assigneeId: taskAssigneeId || undefined,
      });

      setModalSuccess('Task created successfully!');
      fetchProjectDetails();
      setTimeout(() => {
        setTaskModalOpen(false);
        setTaskTitle('');
        setTaskDesc('');
        setTaskPriority('MEDIUM');
        setTaskStatus('TODO');
        setTaskDueDate('');
        setTaskAssigneeId('');
        setModalSuccess('');
      }, 1000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task permanently?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleToggleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={['PROJECT_MANAGER']}>
        <Layout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </Layout>
      </RouteGuard>
    );
  }

  if (error || !project) {
    return (
      <RouteGuard allowedRoles={['PROJECT_MANAGER']}>
        <Layout>
          <div className="p-6 text-center space-y-4">
            <ShieldAlert size={48} className="text-rose-500 mx-auto" />
            <h3 className="font-bold text-lg">{error || 'Project not found.'}</h3>
            <button onClick={() => router.push('/pm/projects')} className="text-indigo-600 font-semibold hover:underline">
              Go back to Projects
            </button>
          </div>
        </Layout>
      </RouteGuard>
    );
  }

  // Filter roster IDs
  const rosterIds = project.members.map((m) => m.userId);
  const eligibleNonMembers = systemUsers.filter((u) => !rosterIds.includes(u.id) && u.isActive);

  return (
    <RouteGuard allowedRoles={['PROJECT_MANAGER']}>
      <Layout>
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/pm/projects')}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">Project Workspace</span>
              <h2 className="text-2xl font-bold tracking-tight mt-0.5">{project.name}</h2>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Overview & Deliverables List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">Project Description</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">
                  {project.description || 'No description provided for this project.'}
                </p>
              </div>

              {/* Tasks Section */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckSquare size={18} className="text-indigo-500" />
                    Project Tasks ({project.tasks.length})
                  </h3>
                  
                  <button
                    onClick={() => setTaskModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Plus size={14} />
                    <span>Create Task</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {project.tasks.length === 0 ? (
                    <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      No tasks created for this project yet.
                    </p>
                  ) : (
                    project.tasks.map((task) => (
                      <div key={task.id} className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{task.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              {task.status.replace('_', ' ')}
                            </span>
                            <span>•</span>
                            <span className="font-medium text-slate-500 dark:text-slate-400">
                              Assignee: {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right space-y-1 hidden sm:block">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                              task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' :
                              task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800'
                            }`}>
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 justify-end">
                                <Calendar size={10} />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Member Roster & Settings */}
            <div className="space-y-6">
              
              {/* Progress Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block">Project Completion</span>
                <span className="text-3xl font-extrabold block mt-2 text-indigo-600 dark:text-indigo-400">{project.progress}%</span>
                
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-350"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                  <span>{project.completedTasks} completed</span>
                  <span>{project.totalTasks} total tasks</span>
                </div>
              </div>

              {/* Collaborators Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Users size={18} className="text-indigo-500" />
                    Team Roster ({project.members.length})
                  </h3>
                  
                  <button
                    onClick={() => setMemberModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Plus size={14} />
                    <span>Assign</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {project.members.map((member) => (
                    <div key={member.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs overflow-hidden">
                          {member.user.avatar ? (
                            <img src={member.user.avatar} alt={member.user.firstName} className="w-full h-full object-cover" />
                          ) : (
                            member.user.firstName[0] + member.user.lastName[0]
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{member.user.role.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {member.userId !== project.creatorId && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                          title="Remove from roster"
                        >
                          <UserMinus size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Add Member Modal */}
          {memberModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMemberModalOpen(false)}></div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Add Project Collaborators</h3>
                
                <form onSubmit={handleAddMembers} className="space-y-4">
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {eligibleNonMembers.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No active system users available to add.</p>
                    ) : (
                      eligibleNonMembers.map((user) => (
                        <div 
                          key={user.id} 
                          onClick={() => handleToggleSelectUser(user.id)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                            selectedUserIds.includes(user.id)
                              ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                              : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            readOnly
                            className="rounded text-indigo-600 focus:ring-0 h-4 w-4"
                          />
                          <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {user.firstName[0] + user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-xs">{user.firstName} {user.lastName}</p>
                            <p className="text-[9px] text-slate-400">{user.role}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {modalError && <p className="text-xs text-rose-500 font-medium">{modalError}</p>}
                  {modalSuccess && <p className="text-xs text-emerald-500 font-medium">{modalSuccess}</p>}

                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      type="button" 
                      onClick={() => setMemberModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                    >
                      Add Selected
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Task Modal */}
          {taskModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setTaskModalOpen(false)}></div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Create New Task</h3>
                
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Task Title</label>
                    <input 
                      type="text" 
                      value={taskTitle} 
                      onChange={(e) => setTaskTitle(e.target.value)} 
                      placeholder="e.g. Design Homepage Wireframes"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Description</label>
                    <textarea 
                      value={taskDesc} 
                      onChange={(e) => setTaskDesc(e.target.value)} 
                      placeholder="Detail task instructions or criteria..."
                      rows="3"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Priority</label>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Task Status</label>
                      <select
                        value={taskStatus}
                        onChange={(e) => setTaskStatus(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      >
                        <option value="TODO">Todo</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Assignee</label>
                      <select
                        value={taskAssigneeId}
                        onChange={(e) => setTaskAssigneeId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      >
                        <option value="">Unassigned</option>
                        {project.members.map((member) => (
                          <option key={member.userId} value={member.userId}>
                            {member.user.firstName} {member.user.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Due Date</label>
                      <input 
                        type="date" 
                        value={taskDueDate} 
                        onChange={(e) => setTaskDueDate(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none" 
                      />
                    </div>
                  </div>

                  {modalError && <p className="text-xs text-rose-500 font-medium">{modalError}</p>}
                  {modalSuccess && <p className="text-xs text-emerald-500 font-medium">{modalSuccess}</p>}

                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      type="button" 
                      onClick={() => setTaskModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                    >
                      Create Task
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
