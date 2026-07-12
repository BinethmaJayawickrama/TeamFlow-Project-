'use client';

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  X, MessageSquare, Paperclip, Calendar, 
  Send, ShieldAlert, FileText, Download, UploadCloud 
} from 'lucide-react';

export default function TaskDetailsModal({ taskId, isOpen, onClose, onTaskUpdated }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setTask(res.data.task);
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
    } else {
      setTask(null);
      setError('');
    }
  }, [isOpen, taskId]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            {task && (
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                {task.project?.name}
              </span>
            )}
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mt-1">
              {loading ? 'Loading Task...' : task?.title}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                    {task.description || 'No description provided for this task.'}
                  </p>
                </div>

                {/* Attachments Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Paperclip size={14} />
                    Attachments ({task.attachments.length})
                  </h4>

                  {/* List */}
                  {task.attachments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {task.attachments.map((file) => (
                        <div key={file.id} className="p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={16} className="text-indigo-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{file.fileName}</p>
                              <span className="text-[9px] text-slate-400 uppercase">{file.fileType}</span>
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
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/40 file:text-indigo-600 dark:file:text-indigo-400 hover:file:opacity-85 cursor-pointer flex-1"
                      required
                    />
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <UploadCloud size={14} />
                      <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    </button>
                  </form>
                </div>

                {/* Comments Section */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={14} />
                    Comments ({task.comments.length})
                  </h4>

                  {/* Comment Thread */}
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                    {task.comments.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No comments posted yet.</p>
                    ) : (
                      task.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {comment.user.avatar ? (
                              <img src={comment.user.avatar} alt={comment.user.firstName} className="w-full h-full object-cover" />
                            ) : (
                              comment.user.firstName[0] + comment.user.lastName[0]
                            )}
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-2xl p-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                                {comment.user.firstName} {comment.user.lastName}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
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
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 flex-1"
                      required
                    />
                    <button
                      type="submit"
                      disabled={commenting || !commentContent.trim()}
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/10 transition-colors disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Column: Sidebar Actions & Parameters */}
              <div className="space-y-5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl md:col-span-1 h-fit">
                
                {/* Status Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Task Status</label>
                  <select
                    value={task.status}
                    onChange={handleStatusChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                  <select
                    value={task.priority}
                    onChange={handlePriorityChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                {/* Assignee Details */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Assignee</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                      {task.assignee ? task.assignee.firstName[0] + task.assignee.lastName[0] : '?'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                      </p>
                      <p className="text-[10px] text-slate-400">Collaborator</p>
                    </div>
                  </div>
                </div>

                {/* Due Date Details */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-650 dark:text-slate-350">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Deadline'}</span>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
