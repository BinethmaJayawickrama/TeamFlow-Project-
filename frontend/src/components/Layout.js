'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';
import api from '../services/api';
import { 
  LayoutDashboard, Users, FolderKanban, FileSpreadsheet, 
  CheckSquare, Bell, LogOut, Sun, Moon, Menu, X, Calendar, 
  History, User, Settings, Check, CheckCircle2
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
      // Poll notifications every 30 seconds
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

  // Define sidebar links based on role
  const getNavLinks = () => {
    if (!user) return [];
    
    const base = [
      { name: 'Dashboard', path: `/${user.role.toLowerCase().replace('_', '')}/dashboard`, icon: LayoutDashboard }
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
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/30">T</div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">TeamFlow</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium text-sm transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <Menu size={22} />
            </button>
            <h1 className="font-semibold text-lg text-slate-800 dark:text-slate-100 capitalize">
              {pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              >
                <Bell size={20} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-semibold text-sm">Notifications</span>
                      {unreadNotifications.length > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">No notifications.</div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${n.isRead ? 'opacity-60 hover:bg-slate-50 dark:hover:bg-slate-800/30' : 'bg-slate-50/50 dark:bg-indigo-950/10 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                          >
                            <div className="mt-0.5 text-indigo-600">
                              <CheckCircle2 size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-800 dark:text-slate-200 leading-normal">{n.content}</p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
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
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                  ) : (
                    user.firstName[0] + user.lastName[0]
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 leading-tight">{user.firstName} {user.lastName}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{user.role.replace('_', ' ')}</p>
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10">
            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Update Profile</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">First Name</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Last Name</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Avatar Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={avatar} 
                  onChange={(e) => setAvatar(e.target.value)} 
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                />
              </div>

              {profileError && <p className="text-xs text-rose-500 font-medium">{profileError}</p>}
              {profileSuccess && <p className="text-xs text-emerald-500 font-medium">{profileSuccess}</p>}

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
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
