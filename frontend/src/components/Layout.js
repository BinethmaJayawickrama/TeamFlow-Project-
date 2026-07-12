'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';
import api from '../services/api';
import { 
  LayoutDashboard, Users, FolderKanban, FileSpreadsheet, 
  CheckSquare, Bell, LogOut, Sun, Moon, X, Calendar, 
  History, ShieldAlert, CheckCircle2, ChevronRight, Settings
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Profile Form State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Sync profile form when user context updates
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await api.put('/auth/me', { firstName, lastName, avatar });
      updateProfile(res.data.user);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => {
        setProfileModalOpen(false);
        setProfileSuccess('');
      }, 1500);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    let dashPath = '/auth/login';
    if (user.role === 'ADMIN') dashPath = '/admin/dashboard';
    else if (user.role === 'PROJECT_MANAGER') dashPath = '/pm/dashboard';
    else if (user.role === 'TEAM_MEMBER') dashPath = '/member/dashboard';

    const base = [
      { name: 'Dashboard', path: dashPath, icon: LayoutDashboard }
    ];

    if (user.role === 'ADMIN') {
      return [
        ...base,
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
        { name: 'Activity Logs', path: '/admin/activity-logs', icon: History }
      ];
    }

    if (user.role === 'PROJECT_MANAGER') {
      return [
        ...base,
        { name: 'Projects', path: '/pm/projects', icon: FolderKanban },
        { name: 'My Tasks', path: '/member/tasks', icon: CheckSquare },
        { name: 'Kanban Board', path: '/member/board', icon: FolderKanban },
        { name: 'Calendar', path: '/member/calendar', icon: Calendar },
        { name: 'Reports', path: '/pm/reports', icon: FileSpreadsheet }
      ];
    }

    if (user.role === 'TEAM_MEMBER') {
      return [
        ...base,
        { name: 'My Tasks', path: '/member/tasks', icon: CheckSquare },
        { name: 'Kanban Board', path: '/member/board', icon: FolderKanban },
        { name: 'Calendar', path: '/member/calendar', icon: Calendar }
      ];
    }

    return base;
  };

  const navLinks = getNavLinks();
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#18191e] transition-colors duration-200">
      
      {/* Sidebar - Left Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#111216] border-r border-slate-200 dark:border-slate-800/80 transition-transform duration-300 transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/85">
          <div className="flex items-center gap-2.5">
            {/* Split color circle logo matching the uploaded image logo */}
            <div className="w-8 h-8 rounded-full border-2 border-[#ff3b30]/80 overflow-hidden flex shadow-sm">
              <div className="w-1/2 h-full bg-white"></div>
              <div className="w-1/2 h-full bg-[#ff3b30]"></div>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-850 dark:text-white">TeamFlow</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => {
                  router.push(link.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-150 ${
                  isActive 
                    ? 'bg-[#ff3b30]/10 text-[#ff3b30] border-l-4 border-[#ff3b30] pl-3' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e1f25]/50 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#ff3b30]' : 'text-slate-400 dark:text-slate-500'} />
                <span>{link.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Actions */}
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111216] flex items-center justify-between">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[#ff3b30] hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#111216] border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-350">
              <ChevronRight size={22} className="rotate-180" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e1f25] transition-colors relative"
              >
                <Bell size={18} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#ff3b30] text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1c1d21] rounded-2xl border border-slate-250 dark:border-slate-800 shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider">Notifications</span>
                      {unreadNotifications.length > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-[#ff3b30] hover:underline font-bold">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">No notifications.</div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${n.isRead ? 'opacity-60 hover:bg-slate-50 dark:hover:bg-slate-800/30' : 'bg-slate-50/50 dark:bg-[#ff3b30]/5 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                          >
                            <div className="mt-0.5 text-[#ff3b30]">
                              <CheckCircle2 size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-800 dark:text-slate-200 leading-normal">{n.content}</p>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            {user && (
              <button 
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1e1f25] transition-colors border border-slate-250 dark:border-slate-800"
              >
                <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/20 text-[#ff3b30] flex items-center justify-center font-extrabold text-xs overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                  ) : (
                    user.firstName[0] + user.lastName[0]
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-200 leading-tight">{user.firstName} {user.lastName}</p>
                  <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">{user.role.replace('_', ' ')}</p>
                </div>
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Edit Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setProfileModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10">
            <h3 className="font-extrabold text-sm uppercase tracking-wider mb-4 text-slate-800 dark:text-white">Update Profile</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-250 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#ff3b30]" 
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-250 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#ff3b30]" 
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Avatar Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={avatar} 
                  onChange={(e) => setAvatar(e.target.value)} 
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-250 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2" 
                />
              </div>

              {profileError && <p className="text-xs text-[#ff3b30] font-semibold">{profileError}</p>}
              {profileSuccess && <p className="text-xs text-emerald-500 font-semibold">{profileSuccess}</p>}

              <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <button 
                  type="button" 
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4.5 py-2.5 text-xs font-bold text-white bg-[#ff3b30] hover:bg-[#e02d22] rounded-xl shadow-lg shadow-red-500/10 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
