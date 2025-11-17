"use client";

import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-gradient-to-br from-[#2A2A2A] to-[#252525] rounded-[12px] p-6 border border-[#9381FF]/20 hover:border-[#9381FF]/40 hover:shadow-xl hover:shadow-[#9381FF]/20 transition-all duration-300 relative overflow-hidden group">
      {/* Purple accent glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#9381FF]/10 rounded-full blur-2xl group-hover:bg-[#9381FF]/20 transition-all duration-300" />

      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[#9381FF] text-xs font-semibold uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
            {value}
          </p>
        </div>
        <div className="w-14 h-14 rounded-[12px] bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/10 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#9381FF]/20 group-hover:shadow-[#9381FF]/40 group-hover:scale-110 transition-all duration-300">
          <div className="text-[#DAFF7C] w-7 h-7 drop-shadow-[0_0_8px_rgba(218,255,124,0.6)]">
            {icon}
          </div>
        </div>
      </div>

      {/* Bottom gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9381FF] via-[#DAFF7C] to-[#9381FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default Card;
