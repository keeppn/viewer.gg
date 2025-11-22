import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', icon, ...props }) => {
  // 8pt spacing system: px-4 (16px), py-2 (8px), gap-2 (8px), rounded (8px)
  const baseClasses = 'px-4 py-2 rounded font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none cursor-pointer text-base';

  const variantClasses = {
    primary: 'bg-[var(--base)] text-white hover:bg-[var(--base-hover)] active:bg-[var(--base-active)] hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-transparent text-[var(--base)] border border-[var(--base)] hover:bg-[var(--base-dim)]',
    success: 'bg-[var(--semantic-success)] text-white hover:bg-[#16a34a] active:bg-[#15803d]',
    danger: 'bg-[var(--semantic-error)] text-white hover:bg-[#dc2626] active:bg-[#b91c1c]',
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
