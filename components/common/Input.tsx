
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, ...props }) => {
  const baseClasses = "block w-full px-4 py-3 bg-slate-800/50 border rounded-xl shadow-sm placeholder-slate-600 focus:outline-none transition-all duration-200 text-sm text-white";
  const errorClasses = "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20";
  const normalClasses = "border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20";
  
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
        {label}
      </label>
      <input
        id={id}
        className={`${baseClasses} ${error ? errorClasses : normalClasses}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} className="mt-1 text-[10px] font-bold text-red-400 ml-1">{error}</p>}
    </div>
  );
};

export default Input;
