// 

import { useState, useMemo } from 'react';
import { X } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
};

export default function MultiUserSelect({
  users,
  selectedUserIds,
  setSelectedUserIds,
}: {
  users: User[];
  selectedUserIds: string[];
  setSelectedUserIds: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  const handleSelect = (id: string) => {
    if (!selectedUserIds.includes(id)) {
      setSelectedUserIds((prev) => [...prev, id]);
    }
    setSearch('');
    setShowDropdown(false);
  };

  const handleRemove = (id: string) => {
    setSelectedUserIds((prev) => prev.filter((uid) => uid !== id));
  };

  return (
    <div className="relative">
      {/* Selected Users as Cards */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedUserIds.map((id) => {
          const user = users.find((u) => u.id === id);
          if (!user) return null;
          return (
            <div
              key={id}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm"
            >
              <span>{user.name}</span>
              <button
                onClick={() => handleRemove(id)}
                className="hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Trigger Input */}
      <div
        className="border border-gray-300 rounded-md p-2 cursor-pointer w-full bg-white"
        onClick={() => setShowDropdown(true)}
      >
        {selectedUserIds.length === 0 ? 'Assign to team...' : 'Add more...'}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-10 mt-2 w-full max-h-60 overflow-auto bg-white border border-gray-300 rounded-md shadow">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border-b border-gray-200 focus:outline-none"
          />
          <ul>
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => handleSelect(user.id)}
                className={`p-2 cursor-pointer hover:bg-blue-50 ${
                  selectedUserIds.includes(user.id) ? 'bg-blue-100 font-medium' : ''
                }`}
              >
                {user.name} ({user.email})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
