'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import MultiUserSelect from '@/components/common/MultiUserSelect';
import { Pencil, FileText } from 'lucide-react';

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

export default function LeadDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserIds , setassignedUserIds ] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, assignedUserIds  }),
    });

    const newTask = await res.json();
    setTasks([newTask, ...tasks]);
    setTitle('');
    setDescription('');
    setassignedUserIds ([]);
    setIsModalOpen(false); 
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">📋 Lead Dashboard</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mb-6"
      >
        + Create Task
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                📝 Create New Task
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
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
                setSelectedUserIds={setassignedUserIds}
              />


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
                  🚀 Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <h2 className="text-2xl font-semibold text-gray-800 mb-4">📦 All Tasks</h2>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 transition hover:shadow-md">
            <div className="text-lg font-bold text-gray-800 mb-1">{task.title}</div>
            <div className="text-gray-600 mb-2">{task.description}</div>
            <div className="text-sm text-gray-500">
              Assigned to: 
              <span className="font-medium">
                {task.assignedUsers && task.assignedUsers.length > 0
                  ? task.assignedUsers.map((u) => u.name).join(', ')
                  : '-'}
              </span> 
              | Status: 
              <span className="uppercase font-semibold text-blue-600">{task.status}</span>
            </div>

            <div className="flex gap-4 mt-3">
              <a
                href={`/tasks/${task.id}/edit`}
                className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm"
              >
                <Pencil size={16} />
                Edit
              </a>
              <a
                href={`/tasks/${task.id}`}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <FileText size={16} />
                View Logs
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
