import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', icon, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-[10px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

  const variantClasses = {
    primary: 'bg-[#DAFF7C] text-[#1F1F1F] hover:bg-[#DAFF7C]/90',
    secondary: 'bg-[#2A2A2A] text-white border border-white/10 hover:border-[#DAFF7C]/30 hover:bg-[#2A2A2A]/80',
    success: 'bg-[#DAFF7C] text-[#1F1F1F] hover:bg-[#DAFF7C]/90',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
