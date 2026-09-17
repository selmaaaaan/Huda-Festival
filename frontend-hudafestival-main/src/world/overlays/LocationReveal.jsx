import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Cinematic chapter-reveal card (GTA-style). Slides in from the left, pauses,
// then fades. `world` is the WORLDS entry (or null when nothing is showing).
export default function LocationReveal({ world }) {
  return (
    <AnimatePresence mode="wait">
      {world && (
        <motion.div
          key={world.index}
          className="absolute inset-0 z-30 flex flex-col items-start justify-center pl-8 md:pl-24 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 160, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[var(--festival-cream)]"
          >
            <div className="w-24 h-[3px] bg-[var(--festival-yellow)] mb-5" />
            <div className="text-7xl md:text-9xl font-black font-display leading-none drop-shadow-[6px_6px_0_rgba(0,0,0,0.4)]">
              {world.index}
            </div>
            <h2
              className="text-6xl md:text-[7rem] font-black font-display uppercase leading-[0.85] tracking-tighter mt-2 drop-shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
              style={{ textShadow: '0 0 40px rgba(0,0,0,0.5)' }}
            >
              {world.name}
            </h2>
            <div className="mt-5 flex items-center gap-3 text-xl md:text-2xl font-bold uppercase tracking-[0.3em]">
              <span>{world.city}</span>
              <span className="text-[var(--festival-yellow)]">·</span>
              <span>{world.country}</span>
            </div>
            <p className="mt-6 max-w-md text-lg md:text-xl font-medium text-[var(--festival-cream)]/85">
              {world.description}
            </p>
            <div className="w-24 h-[3px] bg-[var(--festival-yellow)] mt-6" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
