'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import InputField from '../common/InputField';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col gap-4 bg-white/80 backdrop-blur-md p-8 w-full max-w-md rounded-3xl shadow-2xl border border-gray-200"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">Sign In to Your Account</h2>

      {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}

      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your Email"
        icon={<Mail className="w-5 h-5" />}
        required
      />

      <InputField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your Password"
        icon={<Lock className="w-5 h-5" />}
        required
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />

      <button
        type="submit"
        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl h-12 mt-4 hover:opacity-90 transition-all shadow-md"
      >
        Sign In
      </button>
    </form>
  );
}
