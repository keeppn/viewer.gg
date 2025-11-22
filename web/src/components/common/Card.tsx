"use client";

import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor?: 'purple' | 'success' | 'error' | 'neutral';
}

const Card: React.FC<CardProps> = ({ title, value, icon, accentColor = 'neutral' }) => {
  const colorConfig = {
    purple: {
      border: 'border-[#9381FF]/20',
      label: 'text-[#9381FF]',
      iconBg: 'bg-[#9381FF]/10',
    },
    success: {
      border: 'border-[#22C55E]/20',
      label: 'text-[#22C55E]',
      iconBg: 'bg-[#22C55E]/10',
    },
    error: {
      border: 'border-[#EF4444]/20',
      label: 'text-[#EF4444]',
      iconBg: 'bg-[#EF4444]/10',
    },
    neutral: {
      border: 'border-white/10',
      label: 'text-white/70',
      iconBg: 'bg-white/5',
    }
  };

  const colors = colorConfig[accentColor];

  return (
    <div className={`bg-[#2A2A2A] rounded-xl p-6 border ${colors.border} hover:border-white/20 transition-all duration-200 relative overflow-hidden group hover:-translate-y-1`}>
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className={`${colors.label} text-xs font-semibold uppercase tracking-wide mb-2`}>
            {title}
          </p>
          <p className="text-3xl font-bold text-white">
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
