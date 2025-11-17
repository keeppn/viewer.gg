"use client";

import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color = '#DAFF7C' }) => {
  return (
    <div className="bg-[#2A2A2A] rounded-[10px] p-4 flex flex-col">
      {/* Icon container */}
      <div
        className="w-10 h-10 p-2.5 rounded-[10px] flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}19` }}
      >
        <div className="w-5 h-5" style={{ color: color }}>
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white/70 text-sm font-medium mb-2">
        {title}
      </h3>

      {/* Value */}
      <p className="text-white text-3xl font-semibold">
        {value}
      </p>
    </div>
  );
};

export default Card;
