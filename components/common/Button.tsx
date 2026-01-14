
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, className, ...props }) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-bold py-3 px-6 rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed text-sm overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_10px_20px_rgba(16,185,129,0.2)]',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
