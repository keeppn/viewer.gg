import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-[#1E1E1E] rounded-lg p-5 shadow-sm border border-white/10 flex items-center justify-between">
      <div>
        <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="p-3 rounded-lg bg-[#387B66]/50 text-[#FFCB82]">
        {icon}
      </div>
    </div>
  );
};

export default Card;