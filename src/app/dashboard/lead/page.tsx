
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import MultiUserSelect from '@/components/common/MultiUserSelect';
import TaskCard from '@/components/common/TaskCard';

type User = {
  id: string;
  name: string;
  email: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: 'NOT_STARTED' | 'ON_PROGRESS' | 'DONE' | 'REJECT';
  assignedUsers?: User[];
  createdBy?: User;
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

export default function LeadDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('NOT_STARTED'); 
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const taskRes = await fetch('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!taskRes.ok) throw new Error('Failed to fetch tasks');
        const tasks = await taskRes.json();
        setTasks(tasks);

        const userRes = await fetch('/api/users/team', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error('Failed to fetch users');
        const users = await userRes.json();
        setUsers(users);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, router]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const [logRes, usersRes] = await Promise.all([
        fetch(`/api/tasks/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const [logData, userData] = await Promise.all([
        logRes.json(),
        usersRes.json(),
      ]);
      setLogs(logData);
      setAllUsers(userData);
    };
  
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingTask
      ? `/api/tasks/${editingTask.id}`
      : '/api/tasks';
    const method = editingTask ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(
        editingTask
          ? { title, description, assignedUserIds, status } 
          : { title, description, assignedUserIds }
      ),
    });

    const updatedTask = await res.json();

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    } else {
      setTasks([updatedTask, ...tasks]);
    }

    setTitle('');
    setDescription('');
    setStatus('NOT_STARTED'); 
    setAssignedUserIds([]);
    setEditingTask(null);
    setIsModalOpen(false);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="bg-gray-100/60 bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-lg">
        <h1 className="text-4xl font-bold text-blue-700 mb-6">Lead Dashboard</h1>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setEditingTask(null);
            setTitle('');
            setDescription('');
            setAssignedUserIds([]);
            setStatus('NOT_STARTED'); 
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mb-6"
        >
          + Create Task
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                  {editingTask ? '✏️ Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  ✖
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md w-full"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md w-full"
                  rows={3}
                  required
                />
                <MultiUserSelect
                  users={users}
                  selectedUserIds={assignedUserIds}
                  setSelectedUserIds={setAssignedUserIds}
                />

                {editingTask && ( 
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Task['status'])}
                    className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md w-full"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="ON_PROGRESS">On Progress</option>
                    <option value="DONE">Done</option>
                    <option value="REJECT">Rejected</option>
                  </select>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
                  >
                    {editingTask ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">All Tasks</h2>
        <ul className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              mode="lead"
              onEdit={() => {
                setEditingTask(task);
                setTitle(task.title);
                setDescription(task.description);
                setAssignedUserIds(task.assignedUsers?.map((u) => u.id) || []);
                setStatus(task.status); 
                setIsModalOpen(true);
              }}
              logs={logs.filter(log => log.taskId === task.id)}
              allUsers={allUsers}
            />
          ))}
        </ul>
      </div>
    </div>
    
  );
}
