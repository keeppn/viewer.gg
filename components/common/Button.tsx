import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', icon, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4';

  const variantClasses = {
    primary: 'bg-[#387B66] hover:bg-[#2E6B58] focus:ring-[#387B66]/50',
    secondary: 'bg-white/10 hover:bg-white/20 focus:ring-white/20',
    success: 'bg-[#387B66] hover:bg-[#2E6B58] focus:ring-[#387B66]/50',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500/50',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;