
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, className, ...props }) => {
  const baseClasses = 'font-bold py-2.5 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200 ease-out transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 shadow-[0_4px_14px_rgba(20,184,166,0.3)]',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)]',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
