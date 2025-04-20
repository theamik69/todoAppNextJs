import { useState, useMemo } from 'react';

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

  const toggleSelect = (id: string) => {
    setSelectedUserIds((prev) => {
      const updatedUserIds = prev.includes(id)
        ? prev.filter((uid) => uid !== id)
        : [...prev, id];
      return updatedUserIds;
    });
  };

  return (
    <div className="relative">
      <div
        className="border border-gray-300 rounded-md p-2 cursor-pointer w-full bg-white"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {selectedUserIds.length > 0
          ? users
              .filter((u) => selectedUserIds.includes(u.id))
              .map((u) => u.name)
              .join(', ')
          : 'Assign to team...'}
      </div>

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
              onClick={() => {
                console.log('User clicked:', user.id);  
                toggleSelect(user.id);
              }}
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
