'use client';

import { ReactNode } from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  required?: boolean;
}

export default function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  rightElement,
  required = false,
}: InputFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="font-semibold text-gray-800 mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-xl px-3 h-12 focus-within:border-blue-500">
        {icon && <div className="text-gray-500">{icon}</div>}
        <input
          suppressHydrationWarning
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="ml-2 w-full border-none focus:outline-none text-gray-800 placeholder-gray-400"
          required={required}
        />
        {rightElement && <div className="ml-2">{rightElement}</div>}
      </div>
    </div>
  );
}
