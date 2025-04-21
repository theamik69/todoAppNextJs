

import React from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

interface LogEntry {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  changedBy: { name: string; email: string };
}

interface TaskLogModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  allUsers: User[];
}

function renderParsedLog(value: string, users: User[]) {
  try {
    const parsed = JSON.parse(value);
    return (
      <div className="text-sm space-y-1">
        {parsed.title && <div><strong>Title:</strong> {parsed.title}</div>}
        {parsed.description && <div><strong>Description:</strong> {parsed.description}</div>}
        {parsed.assignedUserIds && Array.isArray(parsed.assignedUserIds) && (
          <div>
            <strong>Assigned to:</strong>{' '}
            {parsed.assignedUserIds
              .map((id: string) => users.find(u => u.id === id)?.name || id)
              .join(', ')}
          </div>
        )}
      </div>
    );
  } catch (e) {
    return <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">{value}</pre>;
  }
}

export default function TaskLogModal({
  taskId,
  isOpen,
  onClose,
  logs,
  allUsers,
}: TaskLogModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">Task Logs</h2>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="bg-gray-50 border rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">
                {new Date(log.createdAt).toLocaleString()} —{' '}
                <strong>{log.changedBy.name}</strong> ({log.changedBy.email})
              </div>
              <div className="text-xs text-gray-500 mb-1">
                <strong>Action:</strong>{' '}
                <span className="uppercase text-blue-600">{log.action}</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-700">Old Value:</div>
                {renderParsedLog(log.oldValue || '-', allUsers)}
              </div>
              <div className="mt-2">
                <div className="text-xs font-semibold text-gray-700">New Value:</div>
                {renderParsedLog(log.newValue || '-', allUsers)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
