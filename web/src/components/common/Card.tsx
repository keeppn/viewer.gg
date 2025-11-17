"use client";

import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor?: 'purple' | 'lime' | 'orange' | 'red';
}

const Card: React.FC<CardProps> = ({ title, value, icon, accentColor = 'purple' }) => {
  const colorConfig = {
    purple: {
      border: 'border-[#9381FF]/20 hover:border-[#9381FF]/40',
      glow: 'bg-[#9381FF]/10 group-hover:bg-[#9381FF]/20',
      shadow: 'shadow-[#9381FF]/20 group-hover:shadow-[#9381FF]/40',
      label: 'text-[#9381FF]',
      iconBg: 'from-[#9381FF]/20 to-[#DAFF7C]/10',
      iconShadow: 'shadow-[#9381FF]/20',
      gradient: 'from-[#9381FF] via-[#DAFF7C] to-[#9381FF]'
    },
    lime: {
      border: 'border-[#DAFF7C]/20 hover:border-[#DAFF7C]/40',
      glow: 'bg-[#DAFF7C]/10 group-hover:bg-[#DAFF7C]/20',
      shadow: 'shadow-[#DAFF7C]/20 group-hover:shadow-[#DAFF7C]/40',
      label: 'text-[#DAFF7C]',
      iconBg: 'from-[#DAFF7C]/20 to-[#9381FF]/10',
      iconShadow: 'shadow-[#DAFF7C]/20',
      gradient: 'from-[#DAFF7C] via-[#9381FF] to-[#DAFF7C]'
    },
    orange: {
      border: 'border-[#fd934e]/20 hover:border-[#fd934e]/40',
      glow: 'bg-[#fd934e]/10 group-hover:bg-[#fd934e]/20',
      shadow: 'shadow-[#fd934e]/20 group-hover:shadow-[#fd934e]/40',
      label: 'text-[#fd934e]',
      iconBg: 'from-[#fd934e]/20 to-[#DAFF7C]/10',
      iconShadow: 'shadow-[#fd934e]/20',
      gradient: 'from-[#fd934e] via-[#DAFF7C] to-[#fd934e]'
    },
    red: {
      border: 'border-red-500/20 hover:border-red-500/40',
      glow: 'bg-red-500/10 group-hover:bg-red-500/20',
      shadow: 'shadow-red-500/20 group-hover:shadow-red-500/40',
      label: 'text-red-400',
      iconBg: 'from-red-500/20 to-red-600/10',
      iconShadow: 'shadow-red-500/20',
      gradient: 'from-red-500 via-red-400 to-red-500'
    }
  };

  const colors = colorConfig[accentColor];

  return (
    <div className={`bg-gradient-to-br from-[#2A2A2A] to-[#252525] rounded-[12px] p-6 border ${colors.border} hover:shadow-xl ${colors.shadow} transition-all duration-300 relative overflow-hidden group`}>
      {/* Accent glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${colors.glow} rounded-full blur-2xl transition-all duration-300`} />

      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className={`${colors.label} text-xs font-semibold uppercase tracking-wider mb-2`}>
            {title}
          </p>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
            {value}
          </p>
        </div>
        <div className={`w-14 h-14 rounded-[12px] bg-gradient-to-br ${colors.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg ${colors.iconShadow} group-hover:scale-110 transition-all duration-300`}>
          <div className="text-[#DAFF7C] w-7 h-7 drop-shadow-[0_0_8px_rgba(218,255,124,0.6)]">
            {icon}
          </div>
        </div>
      </div>

      {/* Bottom gradient accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  );
};

export default Card;
