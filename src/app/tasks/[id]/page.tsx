'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface LogEntry {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  changedBy: { name: string; email: string };
}

export default function TaskLogsPage() {
  const params = useParams();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchLogs = async () => {
      const res = await fetch(`/api/tasks/${params.id}/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setLogs(data);
      setLoading(false);
    };

    fetchLogs();
  }, [params.id, router]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Task Logs</h1>
      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No logs available for this task.</p>
      ) : (
        <ul className="space-y-4">
          {logs.map((log) => (
            <li key={log.id} className="border p-4 rounded bg-white shadow">
              <div className="text-sm text-gray-600">
                {new Date(log.createdAt).toLocaleString()} —{' '}
                <strong>{log.changedBy.name}</strong> ({log.changedBy.email})
              </div>
              <div className="mt-2">
                <span className="font-semibold">Action:</span>{' '}
                <span className="uppercase text-blue-600">{log.action}</span>
              </div>
              <div className="mt-1">
                <span className="font-semibold">Old:</span>{' '}
                <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
                  {log.oldValue || '-'}
                </pre>
              </div>
              <div className="mt-1">
                <span className="font-semibold">New:</span>{' '}
                <pre className="bg-green-100 p-2 rounded text-sm whitespace-pre-wrap">
                  {log.newValue || '-'}
                </pre>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
