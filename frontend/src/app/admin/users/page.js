'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import api from '../../../services/api';
import { 
  UserPlus, Search, Edit3, Trash2, Shield, 
  CheckCircle, XCircle, ChevronRight, X, Mail,
  Key, UserCog, UserCheck, ShieldAlert
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
        <div className="space-y-8 relative overflow-hidden pb-12">
          
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Collaborator Directory</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Add, configure credentials, and manage system roles for active workspace members.</p>
            </div>
            
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4.5 py-3 rounded-2xl shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all duration-150 active:scale-[0.98] self-start sm:self-auto"
            >
              <UserPlus size={18} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Filters Area */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search collaborator by name or email address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold text-slate-650 dark:text-slate-350"
              >
                <option value="ALL">All Member Roles</option>
                <option value="ADMIN">System Administrator</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="TEAM_MEMBER">Team Collaborator</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/55">
                    <th className="p-4.5 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-6">Collaborator profile</th>
                    <th className="p-4.5 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Access privileges</th>
                    <th className="p-4.5 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Account status</th>
                    <th className="p-4.5 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Joined Date</th>
                    <th className="p-4.5 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center">
                        <div className="relative w-10 h-10 mx-auto">
                          <div className="absolute inset-0 border-3 border-indigo-500/20 rounded-full"></div>
                          <div className="absolute inset-0 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-16 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No team collaborators match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                        
                        {/* Name & Avatar */}
                        <td className="p-4.5 pl-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-bold text-sm overflow-hidden shadow-inner">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.firstName} className="w-full h-full object-cover" />
                              ) : (
                                u.firstName[0] + u.lastName[0]
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-snug">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Roles */}
                        <td className="p-4.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                            u.role === 'ADMIN' ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30 text-purple-650 dark:text-purple-400' :
                            u.role === 'PROJECT_MANAGER' ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-650 dark:text-indigo-400' :
                            'bg-slate-55 dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                          }`}>
                            <Shield size={10} />
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4.5">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                              u.isActive 
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 hover:border-rose-100 dark:hover:border-rose-900/30 hover:text-rose-600' 
                                : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:border-emerald-100 dark:hover:border-emerald-900/30 hover:text-emerald-600'
                            }`}
                            title="Click to toggle status"
                          >
                            {u.isActive ? (
                              <>
                                <CheckCircle size={10} />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={10} />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>

                        <td className="p-4.5 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>

                        {/* Actions */}
                        <td className="p-4.5 pr-6 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/45 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
                            title="Edit settings"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/45 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 rounded-xl transition-all"
                            title="Delete user"
                          >
                            <Trash2 size={15} />
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
              <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm shadow-inner" onClick={() => setModalOpen(false)}></div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6.5 shadow-2xl relative z-10">
                
                <h3 className="font-extrabold text-lg text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-1">
                  <UserCog size={20} className="text-indigo-500" />
                  {modalMode === 'CREATE' ? 'Register Collaborator' : 'Configure Collaborator'}
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 mb-6">
                  {modalMode === 'CREATE' ? 'Provide information below to register a new user in the directory.' : 'Update user roles, activation status, or reset authentication password.'}
                </p>
                
                <form onSubmit={handleSave} className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 text-slate-400" size={14} />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      Password {modalMode === 'EDIT' && '(leave empty to retain old password)'}
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3 text-slate-400" size={14} />
                      <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder={modalMode === 'EDIT' ? '••••••••' : 'Password'}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                        required={modalMode === 'CREATE'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">User System Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="ADMIN">System Administrator</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="TEAM_MEMBER">Team Collaborator</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2.5 py-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-indigo-650 focus:ring-indigo-500/10 h-4.5 w-4.5 border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      Grant account active clearance status
                    </label>
                  </div>

                  {formError && (
                    <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                      <ShieldAlert size={14} />
                      {formError}
                    </p>
                  )}
                  {formSuccess && (
                    <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                      <UserCheck size={14} />
                      {formSuccess}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4.5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/15 transition-all"
                    >
                      {modalMode === 'CREATE' ? 'Register Member' : 'Apply Settings'}
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
