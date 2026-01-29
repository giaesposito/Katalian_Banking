
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
        {label}
      </label>
      <input
        id={id}
        className={`block w-full px-4 py-4 bg-slate-950 border border-white/5 rounded-2xl shadow-inner placeholder-slate-800 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300 text-sm text-white font-medium ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-[10px] font-bold text-red-400 uppercase ml-1">{error}</p>}
    </div>
  );
};

export default Input;
