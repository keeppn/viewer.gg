"use client";

import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-[#2A2A2A] rounded-[10px] p-6 border border-white/10 hover:border-[#DAFF7C]/30 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-3xl font-semibold text-white">
            {value}
          </p>
        </div>
        <div className="w-12 h-12 rounded-[10px] bg-[#DAFF7C]/10 flex items-center justify-center flex-shrink-0">
          <div className="text-[#DAFF7C] w-6 h-6">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
