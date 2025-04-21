'use client';

import { useState } from 'react';
import { Pencil, FileText, ClipboardCheck } from 'lucide-react';
import TaskLogModal from '../Tasklog';

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

type Props = {
  task: Task;
  mode: 'lead' | 'team';
  onEdit?: () => void;
  editingDesc?: string;
  onDescriptionChange?: (id: string, desc: string) => void;
  onSave?: (id: string, status: Task['status'], description?: string) => void;
  logs?: LogEntry[];
  allUsers?: User[];
};

export default function TaskCard({
  task,
  mode,
  onEdit,
  editingDesc,
  onDescriptionChange,
  onSave,
  logs,
  allUsers,
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const [showLogModal, setShowLogModal] = useState(false);

  const hasChanges =
    selectedStatus !== task.status ||
    (typeof editingDesc === 'string' && editingDesc !== task.description);

  const handleSave = () => {
    if (onSave) {
      onSave(task.id, selectedStatus, editingDesc);
    }
  };

  const statusColorMap = {
    NOT_STARTED: 'bg-gray-200 text-gray-700',
    ON_PROGRESS: 'bg-yellow-200 text-yellow-800',
    DONE: 'bg-green-200 text-green-800',
    REJECT: 'bg-red-200 text-red-800',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex justify-between items-center">
            <div className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="text-blue-500" size={20} />
              {task.title}
            </div>   
            <div className='ml-3'>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${statusColorMap[task.status]}`}
              >
                {task.status.replace('_', ' ')}
              </span>
            </div>       
            
          </div>
        {mode === 'lead' && onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm"
          >
            <Pencil size={16} />
            Edit
          </button>
        )}
      </div>

      {/* Description */}
      <div>
        {mode === 'team' && onDescriptionChange ? (
          <textarea
            className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={editingDesc}
            placeholder="Update description"
            onChange={(e) => onDescriptionChange(task.id, e.target.value)}
          />
        ) : (
          <p className="text-gray-600 text-sm">{task.description}</p>
        )}
      </div>

      {/* Assigned & Status */}
      <div className="flex flex-col md:flex-row justify-between text-sm text-gray-500">
        <div>
          <div>
            <strong>Assigned to:</strong>{' '}
            <div className="flex flex-wrap gap-2 mt-1">
              {task.assignedUsers?.length ? (
                task.assignedUsers.map((u, index) => {
                  const badgeColors = [
                    'bg-blue-100 text-blue-800',
                    'bg-green-100 text-green-800',
                    'bg-yellow-100 text-yellow-800',
                    'bg-purple-100 text-purple-800',
                    'bg-pink-100 text-pink-800',
                    'bg-indigo-100 text-indigo-800',
                    'bg-red-100 text-red-800',
                  ];
                  const colorClass = badgeColors[index % badgeColors.length]; 

                  return (
                    <span
                      key={u.id}
                      className={`text-xs font-medium px-2 py-1 rounded-full ${colorClass}`}
                    >
                      {u.name}
                    </span>
                  );
                })
              ) : (
                <span className="font-medium text-gray-700">-</span>
              )}
            </div>
          </div>

          {mode === 'team' && onSave && (
            <div className="mt-2 flex items-center">
              <strong className="mr-1">Status:</strong>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as Task['status'])}
                className="text-sm font-semibold text-blue-600 border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="ON_PROGRESS">On Progress</option>
                <option value="DONE">Done</option>
                <option value="REJECT">Reject</option>
              </select>
            </div>
          )}
        </div>

      </div>

      {/* View Log & Save */}
      <div className="flex justify-between items-center mt-4">
        {/* <a
          href={`/tasks/${task.id}`}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <FileText size={16} />
          View Logs
        </a> */}
        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <FileText size={16} />
          View Logs
        </button>
        <TaskLogModal
          taskId={task.id}
          logs={logs || []}
          allUsers={allUsers || []}
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
        />
        {mode === 'team' && onSave && hasChanges && (
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-sm rounded-md font-medium transition"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}

