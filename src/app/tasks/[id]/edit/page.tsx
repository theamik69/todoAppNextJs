'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MultiUserSelect from '@/components/common/MultiUserSelect';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'TEAM' | 'LEAD';
};

type Task = {
  id?: string;
  title: string;
  description: string;
  status?: 'NOT_STARTED' | 'ON_PROGRESS' | 'DONE' | 'REJECT';
  assignedUserIds: string[];
};

export default function EditTaskPage() {
  const { id } = useParams();
  const router = useRouter();

  const [task, setTask] = useState<Task>({
    title: '',
    description: '',
    assignedUserIds: [],
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchTask = async () => {
      const res = await fetch(`/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log('Fetched tasks:', data); 
      const found = data.find((t: Task & { assignedUsers?: User[] }) => t.id === id);
      console.log('found:', found); 
      if (!found) {
        setError('Task not found');
        return;
      }

      setTitle(found.title);
      setDescription(found.description);
      setAssignedUserIds(found.assignedUsers?.map((u: User) => u.id) || []);
    };

    const fetchUsers = async () => {
      const res = await fetch(`/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.filter((u: User) => u.role === 'TEAM'));
    };

    fetchTask();
    fetchUsers();
  }, [id, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        assignedUserIds
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || 'Failed to update');
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Task</h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <form onSubmit={handleUpdate} className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            className="mt-1 w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="mt-1 w-full p-2 border rounded"
            value={description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Assign To</label>
          <MultiUserSelect
            users={users}
            selectedUserIds={assignedUserIds}
            setSelectedUserIds={setAssignedUserIds}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Update Task
        </button>
      </form>
    </div>
  );
}
