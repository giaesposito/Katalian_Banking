import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, ...props }) => {
  const baseClasses = "block w-full px-3 py-2 bg-gray-800 border rounded-md shadow-sm placeholder-gray-500 focus:outline-none sm:text-sm text-white";
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const normalClasses = "border-gray-600 focus:ring-teal-500 focus:border-teal-500";
  
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        className={`${baseClasses} ${error ? errorClasses : normalClasses}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default Input;