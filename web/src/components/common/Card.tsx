"use client";

import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor?: 'purple' | 'success' | 'error' | 'neutral';
}

const Card: React.FC<CardProps> = ({ title, value, icon, accentColor = 'neutral' }) => {
  // BASE/CONTRAST/ACCENT color system with semantic colors
  const colorConfig = {
    purple: {
      border: 'border-[var(--base)]/20',
      label: 'text-[var(--base)]',
      iconBg: 'bg-[var(--base-dim)]',
    },
    success: {
      border: 'border-[var(--semantic-success)]/20',
      label: 'text-[var(--semantic-success)]',
      iconBg: 'bg-[var(--semantic-success)]/10',
    },
    error: {
      border: 'border-[var(--semantic-error)]/20',
      label: 'text-[var(--semantic-error)]',
      iconBg: 'bg-[var(--semantic-error)]/10',
    },
    neutral: {
      border: 'border-[var(--neutral-border)]',
      label: 'text-white/70',
      iconBg: 'bg-white/5',
    }
  };

  const colors = colorConfig[accentColor];

  // 8pt spacing: p-6 (24px), rounded-2xl (16px), gap-2 (8px), w-12 (48px), h-12 (48px)
  return (
    <div className={`bg-[var(--neutral-2-surface)] rounded-2xl p-6 border ${colors.border} hover:border-white/20 transition-all duration-200 relative overflow-hidden group hover:-translate-y-1`}>
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className={`${colors.label} text-xs font-semibold uppercase tracking-wide mb-2`}>
            {title}
          </p>
          <p className="text-[32px] leading-[40px] font-bold text-white">
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${colors.iconBg} flex items-center justify-center flex-shrink-0 transition-all duration-200`}>
          <div className="text-white/90 w-6 h-6">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
