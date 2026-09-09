import React from 'react';
import { motion } from 'framer-motion';
import FestivalPattern from '../brand/FestivalPattern';

const MaintenancePage = ({ message }) => {
  const headline = message || "We'll be right back";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--festival-white)]">
      {/* Background layer */}
      <FestivalPattern />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-[var(--festival-black)] p-12 border-4 border-[var(--border)] shadow-[16px_16px_0px_0px_rgba(23,23,23,1)] max-w-2xl"
        >
           <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--festival-red)] block mb-6">System Update</span>
           <h1 className="text-white text-5xl md:text-7xl font-black font-display tracking-tighter uppercase leading-none mb-6">
             {headline}
           </h1>
           <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">
             The festival is preparing for the next act.
           </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenancePage;
