'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import TaskCard from '@/components/common/TaskCard';

type User = {
  id: string;
  name: string;
  email: string;
};

type LogEntry = {
  id: string;
  taskId: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  changedBy: {
    name: string;
    email: string;
  };
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: 'NOT_STARTED' | 'ON_PROGRESS' | 'DONE' | 'REJECT';
  assignedUsers?: User[];
  createdBy?: User;
};

export default function TeamDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDesc, setEditingDesc] = useState<{ [id: string]: string }>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const res = await fetch('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const all = await res.json();

        const payload = JSON.parse(atob(token.split('.')[1]));
        const filtered = all.filter((t: Task) =>
          t.assignedUsers?.some((u) => u.id === payload.id)
        );

        setTasks(filtered);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [token, router]);

  useEffect(() => {
    const fetchLogsAndUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token || tasks.length === 0) return;
  
      try {
        const usersRes = await fetch(`/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersRes.json();
        setAllUsers(usersData);
  
        const logPromises = tasks.map((task) =>
          fetch(`/api/tasks/${task.id}/logs`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json())
        );
  
        const logsArray = await Promise.all(logPromises);
        const mergedLogs = logsArray.flat(); // gabungkan semua log task
        setLogs(mergedLogs);
      } catch (err) {
        console.error('Error fetching logs/users:', err);
      }
    };
  
    fetchLogsAndUsers();
  }, [tasks]);

  const updateTask = async (
    id: string,
    status: Task['status'],
    description?: string
  ) => {
    const task = tasks.find((t) => t.id === id);
    const safeDescription = description ?? task?.description ?? '';

    const res = await fetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, description: safeDescription }),
    });

    if (!res.ok) {
      console.error('Failed to update task:', res.statusText);
      return;
    }

    const updated = await res.json();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...updated } : t
      )
    );
  
    setEditingDesc((prev) => ({ ...prev, [id]: safeDescription }));
  };

  const handleDescriptionChange = (id: string, desc: string) => {
    setEditingDesc((prev) => ({ ...prev, [id]: desc }));
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
    <div className="bg-gray-100/60 bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Team Dashboard</h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            mode="team"
            editingDesc={editingDesc[task.id] ?? task.description}
            onDescriptionChange={handleDescriptionChange}
            onSave={updateTask}
            logs={logs.filter((log) => log.taskId === task.id)}
            allUsers={allUsers}
          />
        ))}
      </div>
    </div>
  </div>
  );
}
