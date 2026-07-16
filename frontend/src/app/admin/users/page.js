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
        {/* Outer Directory Container - Theme matching deep bg */}
        <div className="space-y-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200 min-h-[80vh] pb-12">
          
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b30]/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Users</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Add, configure credentials, and manage system roles for active workspace members.</p>
            </div>
            
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-[#ff3b30] hover:bg-[#e02d22] text-white font-semibold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-150 active:scale-[0.98] self-start sm:self-auto"
            >
              <UserPlus size={16} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Filters Area */}
          <div className="flex flex-col md:flex-row gap-4 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-slate-450 dark:text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search users by name or email address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#1e1f25]/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-800 dark:text-white transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 dark:bg-[#1e1f25]/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-800 dark:text-white"
              >
                <option value="ALL">All Member Roles</option>
                <option value="ADMIN">System Administrator</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="TEAM_MEMBER">Team Collaborator</option>
              </select>
            </div>
          </div>

          {/* Table Container - Styled matching dashboard panels */}
          <div className="mx-4 bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-sm transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-155 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#1c1d21]/30">
                    <th className="p-6 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-8">User profile</th>
                    <th className="p-6 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Access privileges</th>
                    <th className="p-6 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Account status</th>
                    <th className="p-6 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Joined Date</th>
                    <th className="p-6 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest pr-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/50 text-slate-800 dark:text-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-16 text-center">
                        <div className="relative w-8 h-8 mx-auto">
                          <div className="absolute inset-0 border-3 border-[#ff3b30]/10 rounded-full"></div>
                          <div className="absolute inset-0 border-3 border-[#ff3b30] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-20 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No users match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/30 dark:hover:bg-[#1c1d21]/15 transition-colors">
                        
                        {/* Name & Avatar */}
                        <td className="p-6 pl-8">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 shrink-0">
                              {u.avatar && u.avatar.trim() !== '' ? (
                                <img src={u.avatar} alt={u.firstName} className="w-full h-full object-cover" />
                              ) : (
                                <img 
                                  src={(() => {
                                    const femaleNames = ['binethma', 'jane', 'mary', 'alice', 'sarah', 'emily', 'anna', 'lisa', 'sophie', 'chloe', 'olivia', 'emma', 'isabella', 'mia'];
                                    const nameLower = u.firstName.toLowerCase();
                                    const isFemale = femaleNames.some(f => nameLower.includes(f) || nameLower.endsWith('a'));
                                    if (isFemale) {
                                      return `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.firstName}&gender=female&hairColor=ffd530,e1b305,623b1c,a55728&eyes=variant02,variant04`;
                                    } else {
                                      return `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.firstName}&gender=male&hairColor=2c1b18,a55728,b56f3f&eyes=variant01,variant03`;
                                    }
                                  })()} 
                                  alt={u.firstName} 
                                  className="w-full h-full object-cover" 
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-slate-900 dark:text-white leading-snug">{u.firstName} {u.lastName}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Roles privileges mapped to theme colors */}
                        <td className="p-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider border ${
                            u.role === 'ADMIN' ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-[#ff3b30]' :
                            u.role === 'PROJECT_MANAGER' ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-[#ff9500]' :
                            'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-slate-650 dark:text-slate-400'
                          }`}>
                            <Shield size={10} />
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-6">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-colors ${
                              u.isActive 
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 hover:border-red-100 dark:hover:border-red-900/30 hover:text-[#ff3b30]' 
                                : 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-[#ff3b30] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:border-emerald-100 dark:hover:border-emerald-900/30 hover:text-emerald-600'
                            }`}
                            title="Click to toggle access status"
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

                        <td className="p-6 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                          {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>

                        {/* Actions */}
                        <td className="p-6 pr-8 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-[#ff3b30] rounded-xl transition-all"
                            title="Edit settings"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-[#ff3b30] rounded-xl transition-all"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
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
              <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
              <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative z-10 text-slate-900 dark:text-white transition-colors">
                
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-850 dark:text-white flex items-center gap-2 mb-1">
                  <UserCog size={18} className="text-[#ff3b30]" />
                  {modalMode === 'CREATE' ? 'Register User' : 'Configure User'}
                </h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold mb-6">
                  {modalMode === 'CREATE' ? 'Provide information below to register a new user.' : 'Update user roles, activation status, or reset authentication password.'}
                </p>
                
                <form onSubmit={handleSave} className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white" 
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-550" size={14} />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white" 
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      Password {modalMode === 'EDIT' && '(leave empty to retain old password)'}
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-550" size={14} />
                      <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder={modalMode === 'EDIT' ? '••••••••' : 'Password'}
                        className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white" 
                        required={modalMode === 'CREATE'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">User System Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3b30] text-slate-900 dark:text-white"
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
                      className="rounded text-[#ff3b30] focus:ring-red-500/10 h-4 w-4 border-slate-300 dark:border-slate-700 cursor-pointer"
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

                  <div className="flex justify-end gap-3 mt-8 border-t border-slate-200 dark:border-slate-800/80 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setModalOpen(false)}
                      className="px-6 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-3 text-xs font-bold text-white bg-[#ff3b30] hover:bg-[#e02d22] rounded-xl shadow-lg shadow-red-500/10 transition-all"
                    >
                      {modalMode === 'CREATE' ? 'Register User' : 'Apply Settings'}
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
