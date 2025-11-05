"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-gradient-to-br from-[#1E1E1E] to-[#161616] rounded-2xl p-6 shadow-xl border border-white/5 overflow-hidden"
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#387B66]/10 via-transparent to-[#FFCB82]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[#387B66]/20 to-[#FFCB82]/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 -z-10" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">{title}</p>
          <motion.p 
            className="text-4xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {value}
          </motion.p>
        </div>
        <motion.div 
          className="p-4 rounded-xl bg-gradient-to-br from-[#387B66] to-[#2d6352] shadow-lg group-hover:shadow-[#387B66]/50 transition-shadow duration-300"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="text-[#FFCB82] w-6 h-6">
            {icon}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Card;