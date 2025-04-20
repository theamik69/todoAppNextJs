'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === 'LEAD') router.replace('/dashboard/lead');
      else if (payload.role === 'TEAM') router.replace('/dashboard/team');
      else router.replace('/login');
    } catch {
      router.replace('/login');
    }
  }, [router]);

  return <p className="text-center mt-20">Redirecting...</p>;
}
