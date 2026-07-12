'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * RouteGuard checks if the user is authenticated and has permissions.
 * Redirects to login or dashboard if unauthorized.
 */
export default function RouteGuard({ children, allowedRoles }) {
  const { user, loading, redirectDashboard } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not logged in -> redirect to login
      router.push('/auth/login');
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Logged in but insufficient permissions -> redirect to their default dashboard
      redirectDashboard(user.role);
    }
  }, [user, loading, pathname, allowedRoles]);

  if (loading || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  return children;
}
