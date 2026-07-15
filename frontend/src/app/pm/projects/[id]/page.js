'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../../components/RouteGuard';
import Layout from '../../../../components/Layout';
import api from '../../../../services/api';
import { 
  ArrowLeft, Plus, Users, CheckSquare, 
  Trash2, X, UserMinus, ShieldAlert, Calendar, Pencil,
  Paperclip, Download
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
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Add Member State
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  
  // Create Task State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskStatus, setTaskStatus] = useState('TODO');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');

  // Edit Task State
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('MEDIUM');
  const [editStatus, setEditStatus] = useState('TODO');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState('');

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

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setEditTitle(task.title || '');
    setEditDesc(task.description || '');
    setEditPriority(task.priority || 'MEDIUM');
    setEditStatus(task.status || 'TODO');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : '');
    setEditAssigneeId(task.assigneeId ? String(task.assigneeId) : '');
    setModalError('');
    setModalSuccess('');
    setEditTaskModalOpen(true);
  };

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    if (!editTitle.trim()) {
      setModalError('Task title is required.');
      return;
    }
    try {
      await api.put(`/tasks/${editingTask.id}`, {
        title: editTitle,
        description: editDesc,
        priority: editPriority,
        status: editStatus,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        assigneeId: editAssigneeId ? parseInt(editAssigneeId) : null,
      });

      // Handle file upload if present
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        await api.post(`/tasks/${editingTask.id}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSelectedFile(null);
      }

      setModalSuccess('Task updated successfully!');
      fetchProjectDetails();
      setTimeout(() => {
        setEditTaskModalOpen(false);
        setEditingTask(null);
        setModalSuccess('');
        setUploading(false);
      }, 800);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update task.');
      setUploading(false);
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

  if (error || !project) {
    return (
      <RouteGuard allowedRoles={['PROJECT_MANAGER']}>
        <Layout>
          <div className="p-6 text-center space-y-4">
            <ShieldAlert size={48} className="text-[#ff3b30] mx-auto animate-bounce" />
            <h3 className="font-bold text-lg">{error || 'Project not found.'}</h3>
            <button onClick={() => router.push('/pm/projects')} className="text-[#ff3b30] font-bold uppercase tracking-wider text-xs hover:underline">
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
        {/* Outer Directory Container - Theme matching deep bg */}
        <div className="space-y-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200 min-h-[80vh] pb-12">
          
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b30]/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-center gap-3.5 p-4">
            <button 
              onClick={() => router.push('/pm/projects')}
              className="p-2.5 bg-slate-50 dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="text-[9px] font-bold text-[#ff3b30] uppercase tracking-wider block">Project Workspace</span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5 text-slate-900 dark:text-white">{project.name}</h2>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
            
            {/* Overview & Deliverables List */}
            <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-6 transition-colors">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-850 dark:text-white">Project Description</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed font-semibold">
                  {project.description || 'No description provided for this project.'}
                </p>
              </div>

              {/* Tasks Section */}
              <div className="pt-6 border-t border-slate-150 dark:border-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-slate-855 dark:text-white">
                    <CheckSquare size={16} className="text-[#ff3b30]" />
                    Project Tasks ({project.tasks.length})
                  </h3>
                  
                  <button
                    onClick={() => setTaskModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-[#ff3b30] hover:underline animate-pulse"
                  >
                    <Plus size={14} />
                    <span>Create Task</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {project.tasks.length === 0 ? (
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold text-center py-8 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl">
                      No tasks created for this project yet.
                    </p>
                  ) : (
                    project.tasks.map((task) => (
                      <div key={task.id} className="bg-slate-50/60 dark:bg-[#1c1d21]/30 hover:bg-slate-100 dark:hover:bg-[#1c1d21]/50 border border-slate-250 dark:border-slate-800/65 rounded-2xl p-4 flex items-center justify-between gap-4 transition-colors">
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug">{task.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              task.status === 'COMPLETED' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' :
                              task.status === 'IN_PROGRESS' ? 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' :
                              task.status === 'REVIEW' ? 'bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30' :
                              'bg-amber-50/50 dark:bg-amber-950/20 text-[#ff9500] border-amber-100 dark:border-amber-900/30'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            <span>•</span>
                            <span>
                              Assignee: {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right space-y-1 hidden sm:block">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              task.priority === 'HIGH' ? 'bg-red-50/50 dark:bg-red-950/20 text-[#ff3b30] border-red-100 dark:border-red-900/30' :
                              task.priority === 'MEDIUM' ? 'bg-amber-50/50 dark:bg-amber-950/20 text-[#ff9500] border-amber-100 dark:border-amber-900/30' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'
                            }`}>
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <div className="text-[9px] text-[#ff9500] flex items-center gap-1 mt-1 justify-end font-bold uppercase tracking-wider">
                                <Calendar size={10} />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleOpenEditTask(task)}
                            className="p-2 rounded-xl text-slate-450 dark:text-slate-500 hover:text-[#ff9500] hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all border border-transparent hover:border-amber-200 dark:hover:border-amber-900/30"
                            title="Edit task"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 rounded-xl text-slate-450 dark:text-slate-500 hover:text-[#ff3b30] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
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
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm transition-colors">
                <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Project Completion</span>
                <span className="text-2xl sm:text-3xl font-extrabold block mt-2 text-[#ff3b30]">{project.progress}%</span>
                
                <div className="w-full bg-slate-100 dark:bg-[#18191e] h-1.5 rounded-full overflow-hidden mt-4">
                  <div 
                    className="bg-[#ff3b30] h-full rounded-full transition-all duration-350"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2.5 text-[9px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">
                  <span>{project.completedTasks} completed</span>
                  <span>{project.totalTasks} total tasks</span>
                </div>
              </div>
              {/* Collaborators Card */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-4 border-b border-slate-150 dark:border-slate-800/40 pb-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-slate-850 dark:text-white">
                    <Users size={16} className="text-[#ff9500]" />
                    Team Roster ({project.members.length})
                  </h3>
                  
                  <button
                    onClick={() => setMemberModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-[#ff3b30] hover:underline"
                  >
                    <Plus size={14} />
                    <span>Assign</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-150 dark:divide-slate-800/50">
                  {project.members.map((member) => (
                    <div key={member.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-[#ff3b30] flex items-center justify-center font-bold text-[10px] overflow-hidden border border-red-100 dark:border-red-900/20">
                          {member.user.avatar ? (
                            <img src={member.user.avatar} alt={member.user.firstName} className="w-full h-full object-cover" />
                          ) : (
                            member.user.firstName[0] + member.user.lastName[0]
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-250">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-[8.5px] text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-0.5 font-bold">{member.user.role.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {member.userId !== project.creatorId && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-1 text-slate-400 hover:text-[#ff3b30] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                          title="Remove from roster"
                        >
                          <UserMinus size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared Reports & Files Card - Visible to all members */}
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm transition-colors">
                <h3 className="font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-150 dark:border-slate-800/40 pb-2 flex items-center gap-2 text-slate-850 dark:text-white">
                  <Paperclip size={16} className="text-[#ff3b30]" />
                  Shared Reports & Files
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {(() => {
                    const allAttachments = [];
                    project.tasks.forEach(t => {
                      if (t.attachments && t.attachments.length > 0) {
                        t.attachments.forEach(file => {
                          allAttachments.push({ ...file, taskTitle: t.title });
                        });
                      }
                    });
                    
                    if (allAttachments.length === 0) {
                      return <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6 font-semibold">No reports or files uploaded yet.</p>;
                    }
                    
                    const backendUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';
                    
                    return allAttachments.map((file) => (
                      <div key={file.id} className="p-3 border border-slate-150 dark:border-slate-800/60 rounded-xl flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/10">
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate" title={file.fileName}>{file.fileName}</p>
                          <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide mt-0.5">Task: {file.taskTitle}</p>
                        </div>
                        <a 
                          href={`${backendUrl}${file.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-colors shrink-0"
                          title="View document"
                        >
                          <Download size={12} />
                        </a>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>

          </div>

          {/* Add Member Modal */}
          {memberModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setMemberModalOpen(false)}></div>              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl relative z-10 text-slate-900 dark:text-white transition-colors">
                <h3 className="font-extrabold text-sm uppercase tracking-wider mb-4 text-slate-850 dark:text-white">Add Project Collaborators</h3>
                
                <form onSubmit={handleAddMembers} className="space-y-4">
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {eligibleNonMembers.length === 0 ? (
                       <p className="text-xs text-slate-400 text-center py-4 font-semibold">No active system users available to add.</p>
                    ) : (
                      eligibleNonMembers.map((user) => (
                        <div 
                          key={user.id} 
                          onClick={() => handleToggleSelectUser(user.id)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                            selectedUserIds.includes(user.id)
                              ? 'border-[#ff3b30] bg-red-500/5 dark:bg-[#ff3b30]/10'
                              : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            readOnly
                            className="rounded text-[#ff3b30] focus:ring-red-500/10 h-4 w-4 border-slate-300 dark:border-slate-700"
                          />
                          <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {user.firstName[0] + user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-xs">{user.firstName} {user.lastName}</p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">{user.role}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {modalError && <p className="text-xs text-rose-500 font-semibold">{modalError}</p>}
                  {modalSuccess && <p className="text-xs text-emerald-500 font-semibold">{modalSuccess}</p>}

                  <div className="flex justify-end gap-3 mt-8 border-t border-slate-200 dark:border-slate-800/80 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setMemberModalOpen(false)}
                      className="px-6 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-3 text-xs font-bold text-white bg-[#ff3b30] hover:bg-[#e02d22] rounded-xl shadow-lg shadow-red-500/10 transition-all"
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
              <div className="fixed inset-0 bg-slate-955/65 backdrop-blur-sm" onClick={() => setTaskModalOpen(false)}></div>
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6.5 shadow-2xl relative z-10 text-slate-900 dark:text-white transition-colors">
                <h3 className="font-extrabold text-sm uppercase tracking-wider mb-4 text-slate-850 dark:text-white">Create New Task</h3>
                
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Task Title</label>
                    <input 
                      type="text" 
                      value={taskTitle} 
                      onChange={(e) => setTaskTitle(e.target.value)} 
                      placeholder="e.g. Design Homepage Wireframes"
                      className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea 
                      value={taskDesc} 
                      onChange={(e) => setTaskDesc(e.target.value)} 
                      placeholder="Detail task instructions or criteria..."
                      rows="3"
                      className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Task Status</label>
                      <select
                        value={taskStatus}
                        onChange={(e) => setTaskStatus(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
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
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Assignee</label>
                      <select
                        value={taskAssigneeId}
                        onChange={(e) => setTaskAssigneeId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
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
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Due Date</label>
                      <input 
                        type="date" 
                        value={taskDueDate} 
                        onChange={(e) => setTaskDueDate(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white" 
                      />
                    </div>
                  </div>

                  {modalError && <p className="text-xs text-rose-500 font-semibold">{modalError}</p>}
                  {modalSuccess && <p className="text-xs text-emerald-500 font-semibold">{modalSuccess}</p>}

                  <div className="flex justify-end gap-3 mt-8 border-t border-slate-200 dark:border-slate-800/80 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setTaskModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4.5 py-2.5 text-xs font-bold text-white bg-[#ff3b30] hover:bg-[#e02d22] rounded-xl shadow-lg shadow-red-500/10 transition-all"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Task Modal */}
          {editTaskModalOpen && editingTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-955/65 backdrop-blur-sm" onClick={() => setEditTaskModalOpen(false)}></div>
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10 text-slate-900 dark:text-white transition-colors">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-[9px] font-bold text-[#ff9500] uppercase tracking-wider block">Edit Task</span>
                    <h3 className="font-extrabold text-sm text-slate-850 dark:text-white mt-0.5 line-clamp-1">{editingTask.title}</h3>
                  </div>
                  <button onClick={() => setEditTaskModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveTask} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Task Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Task title..."
                      className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-[#ff9500] text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Task details..."
                      rows="3"
                      className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-[#ff9500] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-[#ff9500] text-slate-900 dark:text-white"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-[#ff9500] text-slate-900 dark:text-white"
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
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Assignee</label>
                      <select
                        value={editAssigneeId}
                        onChange={(e) => setEditAssigneeId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-[#ff9500] text-slate-900 dark:text-white"
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
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Due Date</label>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-[#ff9500] text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Add File Attachment</label>
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                      className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500"
                    />
                    {editingTask.attachments && editingTask.attachments.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Uploaded Attachments ({editingTask.attachments.length})</span>
                        {editingTask.attachments.map((file) => (
                          <a 
                            key={file.id} 
                            href={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000'}${file.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#18191e]/50 dark:hover:bg-[#18191e] border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-[#ff9500] transition-colors"
                          >
                            <span>📎 {file.fileName}</span>
                            <span className="text-[8px] opacity-60 uppercase">Open ↗</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {modalError && <p className="text-xs text-rose-500 font-semibold">{modalError}</p>}
                  {modalSuccess && <p className="text-xs text-emerald-500 font-semibold">{modalSuccess}</p>}

                  <div className="flex justify-end gap-3 mt-6 border-t border-slate-200 dark:border-slate-800/80 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditTaskModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 text-xs font-bold text-white bg-[#ff9500] hover:bg-[#e08800] rounded-xl shadow-lg shadow-amber-500/10 transition-all"
                    >
                      Save Changes
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
