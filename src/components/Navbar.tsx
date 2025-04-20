'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutList } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserName = async () => {
      const res = await fetch('/api/users/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setUserName(data.name);
      } else {
        setUserName(null);
      }
    };

    fetchUserName();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md p-4 rounded-b-lg flex flex-col md:flex-row justify-between items-center gap-2 text-gray-800">
      <div className="flex items-center gap-2 text-blue-600 text-2xl font-semibold">
        <LayoutList className="w-6 h-6" />
        <span>ToDo App</span>
      </div>
      <div className="flex items-center gap-4">
        {userName && (
          <span className="text-sm text-gray-600">
            Welcome, <span className="font-medium">{userName}</span>
          </span>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-all text-white px-4 py-2 rounded-lg text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
}
