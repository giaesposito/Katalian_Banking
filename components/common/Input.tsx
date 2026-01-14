
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, ...props }) => {
  const baseClasses = "block w-full px-4 py-3 bg-slate-950 border rounded-2xl shadow-inner placeholder-slate-700 focus:outline-none transition-all duration-300 text-sm text-white font-medium";
  const errorClasses = "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10";
  const normalClasses = "border-white/5 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10";
  
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
        {label}
      </label>
      <input
        id={id}
        className={`${baseClasses} ${error ? errorClasses : normalClasses}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} className="mt-1 text-[10px] font-bold text-red-400 ml-1 uppercase tracking-wider">{error}</p>}
    </div>
  );
};

export default Input;
