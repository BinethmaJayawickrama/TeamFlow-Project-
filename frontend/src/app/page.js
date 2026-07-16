'use client';

import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading, redirectDashboard } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        redirectDashboard(user.role);
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#ff3b30] dark:border-amber-500 border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Redirecting you to your workspace...</p>
      </div>
    </div>
  );
}
