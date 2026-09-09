import React from 'react';
import { motion } from 'framer-motion';

const FestivalPattern = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 select-none">
      {/* Massive Outlined Typography */}
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-10 text-[20vw] font-extrabold font-display leading-none text-transparent mix-blend-multiply"
        style={{ WebkitTextStroke: '2px var(--festival-black)', opacity: 0.1 }}
      >
        L'INTERVENTION
      </motion.div>
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 -right-20 text-[15vw] font-extrabold font-display leading-none text-transparent mix-blend-multiply"
        style={{ WebkitTextStroke: '2px var(--festival-black)', opacity: 0.08 }}
      >
        2026
      </motion.div>

      {/* Floating Geometric Shapes */}
      {/* Orange Circle */}
      <motion.div
        animate={{ y: [0, -40, 0], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 left-1/4 w-32 h-32 rounded-full bg-[var(--festival-orange)] mix-blend-multiply blur-2xl"
      />
      {/* Purple Triangle placeholder (using square rotated) */}
      <motion.div
        animate={{ y: [0, 50, 0], rotate: [45, 135, 45] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-1/4 w-40 h-40 bg-[var(--festival-purple)] mix-blend-multiply blur-3xl opacity-80"
      />
      {/* Teal Rectangle */}
      <motion.div
        animate={{ x: [0, 30, 0], rotate: [-10, 10, -10] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-10 w-48 h-24 bg-[var(--festival-teal)] mix-blend-multiply blur-2xl opacity-70"
      />
      {/* Red Circle */}
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, -20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-20 w-56 h-56 rounded-full bg-[var(--festival-red)] mix-blend-multiply blur-[64px] opacity-60"
      />
      {/* Yellow Star/Blob */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-10 w-40 h-40 rounded-3xl bg-[var(--festival-yellow)] mix-blend-multiply blur-3xl opacity-80"
      />
    </div>
  );
};

export default FestivalPattern;

