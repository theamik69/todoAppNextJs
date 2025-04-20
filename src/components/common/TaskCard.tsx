'use client';

import React from 'react';

export type TaskStatus = 'NOT_STARTED' | 'ON_PROGRESS' | 'DONE' | 'REJECT';

type User = {
  id: string;
  name: string;
  email: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedUsers?: User[];
  createdBy?: User;
};

type TaskCardProps = {
  task: Task;
  editingDesc: string;
  onDescriptionChange: (id: string, desc: string) => void;
  onSave: (id: string, status: TaskStatus, description?: string) => Promise<void>;
};

const statuses: TaskStatus[] = ['NOT_STARTED', 'ON_PROGRESS', 'DONE', 'REJECT'];

export default function TaskCard({
  task,
  editingDesc,
  onDescriptionChange,
  onSave,
}: TaskCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">{task.title}</h2>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            task.status === 'NOT_STARTED'
              ? 'bg-gray-200 text-gray-800'
              : task.status === 'ON_PROGRESS'
              ? 'bg-yellow-200 text-yellow-800'
              : task.status === 'DONE'
              ? 'bg-green-200 text-green-800'
              : 'bg-red-200 text-red-800'
          }`}
        >
          {task.status.replace('_', ' ')}
        </span>
      </div>

      <textarea
        className="w-full border rounded p-2 text-gray-700 mb-2"
        value={editingDesc}
        onChange={(e) => onDescriptionChange(task.id, e.target.value)}
      />

      <button
        onClick={() => onSave(task.id, task.status, editingDesc)}
        className="mb-4 text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
      >
        💾 Save Description
      </button>

      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() =>
              onSave(
                task.id,
                s,
                editingDesc 
              )
            }
            className={`text-sm px-3 py-1 rounded-full font-medium transition ${
              task.status === s
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <a
        href={`/tasks/${task.id}`}
        className="inline-block text-sm text-blue-600 hover:underline"
      >
        🔍 View Logs
      </a>
    </div>
  );
}
