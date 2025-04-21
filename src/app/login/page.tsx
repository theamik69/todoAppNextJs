'use client';

import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800 drop-shadow-md">
          ToDo App
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
