'use client';

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, MessageSquare, Paperclip, Calendar, Edit,
  Send, ShieldAlert, FileText, Download, UploadCloud 
} from 'lucide-react';

export default function TaskDetailsModal({ taskId, isOpen, onClose, onTaskUpdated }) {
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);

  // Comment state
  const [commentContent, setCommentContent] = useState('');
  const [commenting, setCommenting] = useState(false);

  // Upload state
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await api.get(`/tasks/${taskId}`);
      const t = res.data.task;
      setTask(t);

      // Initialize edit fields
      setEditTitle(t.title || '');
      setEditDescription(t.description || '');
      setEditStatus(t.status || 'TODO');
      setEditPriority(t.priority || 'MEDIUM');
      setEditDueDate(t.dueDate ? new Date(t.dueDate).toISOString().substring(0, 10) : '');
      setEditAssigneeId(t.assigneeId ? String(t.assigneeId) : '');
    } catch (err) {
      console.error(err);
      setError('Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
      setIsEditing(false);
    } else {
      setTask(null);
      setError('');
      setIsEditing(false);
    }
  }, [isOpen, taskId]);

  const handleStartEdit = async () => {
    if (!task) return;
    try {
      const projRes = await api.get(`/projects/${task.projectId}`);
      setProjectMembers(projRes.data.project.members || []);
      setIsEditing(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load project members for task editing.');
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      const payload = {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        assigneeId: editAssigneeId ? parseInt(editAssigneeId) : null,
      };

      await api.put(`/tasks/${taskId}`, payload);
      setIsEditing(false);
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save task updates.');
    }
  };

  const handleStatusChange = async (e) => {
    const nextStatus = e.target.value;
    try {
      await api.put(`/tasks/${taskId}`, { status: nextStatus });
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  const handlePriorityChange = async (e) => {
    const nextPriority = e.target.value;
    try {
      await api.put(`/tasks/${taskId}`, { priority: nextPriority });
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task priority.');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setCommenting(true);
    try {
      await api.post(`/tasks/${taskId}/comments`, { content: commentContent });
      setCommentContent('');
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setCommenting(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFile(null);
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload attachment file.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const isPMOrAdmin = user && (user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-955/65 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-white transition-colors">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-150 dark:border-slate-800/80">
          <div className="flex-1 mr-4 min-w-0">
            {task && (
              <span className="text-[10px] font-bold text-[#ff3b30] uppercase tracking-wider block">
                {task.project?.name}
              </span>
            )}
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] mt-1"
                placeholder="Task Title"
                required
              />
            ) : (
              <h3 className="font-extrabold text-sm sm:text-base text-slate-855 dark:text-white mt-1 leading-snug truncate">
                {loading ? 'Loading Task...' : task?.title}
              </h3>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {isPMOrAdmin && !isEditing && task && (
              <button 
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-bold text-[#ff3b30] transition-all shadow-sm"
              >
                <Edit size={12} />
                <span>Edit</span>
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative w-8 h-8 mx-auto">
                <div className="absolute inset-0 border-3 border-[#ff3b30]/10 rounded-full"></div>
                <div className="absolute inset-0 border-3 border-[#ff3b30] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : error || !task ? (
            <div className="text-center py-8 text-rose-500 flex flex-col items-center gap-2">
              <ShieldAlert size={36} />
              <p className="font-semibold">{error || 'Task details could not be retrieved.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Details, Comments, Attachments */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Description */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                  {isEditing ? (
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30]"
                      placeholder="Task description details..."
                    />
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-[#18191e]/40 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl font-semibold whitespace-pre-line">
                      {task.description || 'No description provided for this task.'}
                    </p>
                  )}
                </div>

                {/* Hide comment & attachment forms during editing to keep workspace focused */}
                {!isEditing && (
                  <>
                    {/* Attachments Section */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Paperclip size={14} className="text-[#ff9500]" />
                        Attachments ({task.attachments.length})
                      </h4>

                      {/* List */}
                      {task.attachments.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          {task.attachments.map((file) => (
                            <div key={file.id} className="p-3 border border-slate-200 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText size={16} className="text-[#ff3b30] shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{file.fileName}</p>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-550 uppercase font-bold">{file.fileType}</span>
                                </div>
                              </div>
                              
                              <a 
                                href={`${backendUrl}${file.fileUrl}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"
                                title="Download attachment"
                              >
                                <Download size={12} />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Form */}
                      <form onSubmit={handleFileUpload} className="flex items-center gap-2">
                        <input 
                          type="file" 
                          onChange={(e) => setFile(e.target.files[0])}
                          className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 dark:file:bg-red-950/20 file:text-[#ff3b30] hover:file:opacity-85 cursor-pointer flex-1"
                          required
                        />
                        <button
                          type="submit"
                          disabled={uploading || !file}
                          className="flex items-center gap-1.5 bg-[#ff3b30] hover:bg-[#e02d22] text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-red-500/10"
                        >
                          <UploadCloud size={14} />
                          <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                        </button>
                      </form>
                    </div>

                    {/* Comments Section */}
                    <div className="pt-6 border-t border-slate-155 dark:border-slate-800/50 space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare size={14} className="text-[#ff9500]" />
                        Comments ({task.comments.length})
                      </h4>

                      {/* Comment Thread */}
                      <div className="space-y-4 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                        {task.comments.length === 0 ? (
                          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4 font-semibold">No comments posted yet.</p>
                        ) : (
                          task.comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded bg-red-50 dark:bg-red-955/25 text-[#ff3b30] flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden border border-red-105 dark:border-red-900/20">
                                {comment.user.avatar ? (
                                  <img src={comment.user.avatar} alt={comment.user.firstName} className="w-full h-full object-cover" />
                                ) : (
                                  comment.user.firstName[0] + comment.user.lastName[0]
                                )}
                              </div>
                              <div className="bg-slate-50 dark:bg-[#1c1d21]/30 border border-slate-150 dark:border-slate-850 rounded-2xl p-3 flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                    {comment.user.firstName} {comment.user.lastName}
                                  </span>
                                  <span className="text-[9px] text-slate-450 dark:text-slate-550 font-semibold">
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Post Comment Field */}
                      <form onSubmit={handlePostComment} className="flex gap-2 items-center pt-2">
                        <input 
                          type="text" 
                          placeholder="Write a message..."
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          className="bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white flex-1"
                          required
                        />
                        <button
                          type="submit"
                          disabled={commenting || !commentContent.trim()}
                          className="p-2.5 bg-[#ff3b30] hover:bg-[#e02d22] text-white rounded-xl shadow-lg shadow-red-500/10 transition-all disabled:opacity-50"
                        >
                          <Send size={14} />
                        </button>
                      </form>
                    </div>
                  </>
                )}

              </div>

              {/* Right Column: Sidebar Actions & Parameters */}
              <div className="space-y-5 bg-slate-50/60 dark:bg-[#1c1d21]/30 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl md:col-span-1 h-fit">
                
                {/* Status Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Task Status</label>
                  <select
                    value={isEditing ? editStatus : task.status}
                    onChange={isEditing ? (e) => setEditStatus(e.target.value) : handleStatusChange}
                    className="w-full bg-white dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30]"
                  >
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                  <select
                    value={isEditing ? editPriority : task.priority}
                    onChange={isEditing ? (e) => setEditPriority(e.target.value) : handlePriorityChange}
                    className="w-full bg-white dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                {/* Assignee Details */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">Assignee</label>
                  {isEditing ? (
                    <select
                      value={editAssigneeId}
                      onChange={(e) => setEditAssigneeId(e.target.value)}
                      className="w-full bg-white dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30]"
                    >
                      <option value="">Unassigned</option>
                      {projectMembers.map((member) => (
                        <option key={member.user.id} value={member.user.id}>
                          {member.user.firstName} {member.user.lastName} ({member.user.role.replace('_', ' ')})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/20 text-[#ff3b30] flex items-center justify-center font-bold text-xs border border-red-100 dark:border-red-900/20 shadow-sm">
                        {task.assignee ? task.assignee.firstName[0] + task.assignee.lastName[0] : '?'}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-850 dark:text-slate-200 leading-snug">
                          {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                        </p>
                        <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Collaborator</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Due Date Details */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full bg-white dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30]"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#ff9500] uppercase tracking-wider">
                      <Calendar size={14} className="text-[#ff9500]" />
                      <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Deadline'}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Save/Cancel Action Footer in Edit Mode */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150 dark:border-slate-800/80 bg-white dark:bg-[#1e1f25] relative z-20">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-350 rounded-xl transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="px-5 py-2.5 bg-[#ff3b30] hover:bg-[#e02d22] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-500/10"
            >
              Save Changes
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
