import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

type UserPayload = {
  id: string;
  email: string;
  role: 'LEAD' | 'TEAM';
};

export default function useAuth() {
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwt.decode(token) as UserPayload;
      setUser(decoded);
    } catch {
      console.error('Invalid token');
    }
  }, []);

  return user;
}
