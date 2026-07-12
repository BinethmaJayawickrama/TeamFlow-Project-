'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { 
  UserPlus, Search, Edit3, Trash2, Shield, 
  CheckCircle, XCircle, ChevronRight, X 
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // CREATE or EDIT
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TEAM_MEMBER');
  const [isActive, setIsActive] = useState(true);
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setModalMode('CREATE');
    setSelectedUserId(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setRole('TEAM_MEMBER');
    setIsActive(true);
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setModalMode('EDIT');
    setSelectedUserId(user.id);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setIsActive(user.isActive);
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      if (modalMode === 'CREATE') {
        await api.post('/users', {
          firstName,
          lastName,
          email,
          password,
          role,
          isActive,
        });
        setFormSuccess('User created successfully!');
      } else {
        await api.put(`/users/${selectedUserId}`, {
          firstName,
          lastName,
          email,
          role,
          isActive,
          password: password || undefined,
        });
        setFormSuccess('User updated successfully!');
      }

      fetchUsers();
      setTimeout(() => {
        setModalOpen(false);
      }, 1000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Verify fields.');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/users/${user.id}`, {
        isActive: !user.isActive,
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
      
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <Layout>
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Add, update, and manage access roles for team collaborators.</p>
            </div>
            
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-3 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all self-start sm:self-auto"
            >
              <UserPlus size={18} />
              <span>Add Member</span>
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="TEAM_MEMBER">Team Member</option>
              </select>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/55">
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider pl-6">Collaborator</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Created At</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-slate-400">
                        No team members match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        {/* Name & Avatar */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm overflow-hidden">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.firstName} className="w-full h-full object-cover" />
                              ) : (
                                u.firstName[0] + u.lastName[0]
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role Badges */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                            u.role === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' :
                            u.role === 'PROJECT_MANAGER' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            <Shield size={12} />
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Status Badges */}
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider hover:opacity-85 ${
                              u.isActive ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
                              'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {u.isActive ? (
                              <>
                                <CheckCircle size={12} />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={12} />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>

                        <td className="p-4 text-xs text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        {/* Action buttons */}
                        <td className="p-4 pr-6 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            title="Edit settings"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create/Edit Modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10">
                
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">
                  {modalMode === 'CREATE' ? 'Add User Account' : 'Edit User Settings'}
                </h3>
                
                <form onSubmit={handleSave} className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">First Name</label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Password {modalMode === 'EDIT' && '(leave blank to keep unchanged)'}
                    </label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder={modalMode === 'EDIT' ? '••••••••' : 'Password'}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                      required={modalMode === 'CREATE'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">User System Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                    >
                      <option value="ADMIN">Administrator</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="TEAM_MEMBER">Team Member</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500/20 h-4 w-4"
                    />
                    <label htmlFor="isActive" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                      Grant Account Access (Active Status)
                    </label>
                  </div>

                  {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
                  {formSuccess && <p className="text-xs text-emerald-500 font-medium">{formSuccess}</p>}

                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      type="button" 
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                    >
                      {modalMode === 'CREATE' ? 'Add Member' : 'Update Member'}
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
