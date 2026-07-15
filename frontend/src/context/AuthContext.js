'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('teamflow_token');
        const storedUser = localStorage.getItem('teamflow_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token with backend
          try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
            localStorage.setItem('teamflow_user', JSON.stringify(res.data.user));
          } catch (err) {
            console.error('Session validation failed. Logging out.', err);
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Failed to parse auth cache:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Protect routes and redirect based on login status
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth');

    if (!user) {
      if (!isAuthRoute) {
        router.push('/auth/login');
      }
    } else {
      if (isAuthRoute) {
        redirectDashboard(user.role);
      }
    }
  }, [user, pathname, loading]);

  const redirectDashboard = (role) => {
    switch (role) {
      case 'ADMIN':
        router.push('/admin/dashboard');
        break;
      case 'PROJECT_MANAGER':
        router.push('/pm/dashboard');
        break;
      case 'TEAM_MEMBER':
        router.push('/member/dashboard');
        break;
      default:
        router.push('/auth/login');
    }
  };

  const handleLogin = async (email, password, roleOverride = null) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      // Force dynamic role override if selected on login form
      const finalUser = {
        ...receivedUser,
        role: roleOverride || receivedUser.role
      };

      localStorage.setItem('teamflow_token', receivedToken);
      localStorage.setItem('teamflow_user', JSON.stringify(finalUser));

      setToken(receivedToken);
      setUser(finalUser);

      redirectDashboard(finalUser.role);
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: errMsg };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teamflow_token');
    localStorage.removeItem('teamflow_user');
    setToken(null);
    setUser(null);
    router.push('/auth/login');
  };

  const handleUpdateProfile = (updatedUser) => {
    localStorage.setItem('teamflow_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        logout: handleLogout,
        updateProfile: handleUpdateProfile,
        redirectDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
