import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', icon, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-[10px] font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none cursor-pointer relative overflow-hidden group';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#DAFF7C] to-[#c4e96e] text-[#1F1F1F] hover:shadow-lg hover:shadow-[#DAFF7C]/30 hover:scale-105 active:scale-95',
    secondary: 'bg-gradient-to-br from-[#2A2A2A] to-[#252525] text-white border border-[#9381FF]/20 hover:border-[#9381FF]/40 hover:shadow-lg hover:shadow-[#9381FF]/20 hover:scale-105 active:scale-95',
    success: 'bg-gradient-to-r from-[#DAFF7C] to-[#c4e96e] text-[#1F1F1F] hover:shadow-lg hover:shadow-[#DAFF7C]/30 hover:scale-105 active:scale-95',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/40 hover:scale-105 active:scale-95',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/20 to-transparent" />

      <span className="relative flex items-center gap-2">
        {icon && <span className="w-5 h-5">{icon}</span>}
        <span>{children}</span>
      </span>
    </button>
  );
};

export default Button;
