import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', icon, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none cursor-pointer';

  const variantClasses = {
    primary: 'bg-[#9381FF] text-white hover:bg-[#8270ee] active:bg-[#7461dd]',
    secondary: 'bg-transparent text-[#9381FF] border border-[#9381FF] hover:bg-[#9381FF]/10',
    success: 'bg-[#22C55E] text-white hover:bg-[#16a34a] active:bg-[#15803d]',
    danger: 'bg-[#EF4444] text-white hover:bg-[#dc2626] active:bg-[#b91c1c]',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      <span className="flex items-center gap-2">
        {icon && <span className="w-5 h-5">{icon}</span>}
        <span>{children}</span>
      </span>
    </button>
  );
};

export default Button;
