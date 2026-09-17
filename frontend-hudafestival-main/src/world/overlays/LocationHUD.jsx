import React from 'react';
import { motion } from 'framer-motion';
import { WORLDS, STATION_T } from '../worldData';

// Persistent location indicator: "0i / 04 NAME" plus a journey rail that
// follows the camera position along the four worlds.
export default function LocationHUD({ progress, index }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <motion.div
      className="absolute bottom-28 left-6 md:left-10 z-20 text-[var(--festival-cream)] pointer-events-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-end gap-2 leading-none">
        <span className="text-4xl font-black font-display">{WORLDS[index].index}</span>
        <span className="text-lg font-bold mb-1 opacity-70">/ 04</span>
      </div>
      <div className="text-2xl md:text-3xl font-black font-display uppercase tracking-[0.15em] mt-1 drop-shadow">
        {WORLDS[index].name}
      </div>

      <div className="relative mt-4 h-[3px] w-44 md:w-60 bg-[var(--festival-cream)]/30 rounded-full">
        {STATION_T.map((t, i) => (
          <span
            key={i}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
              i === index ? 'bg-[var(--festival-yellow)] scale-125' : 'bg-[var(--festival-cream)]/60'
            }`}
            style={{ left: `${t * 100}%` }}
          />
        ))}
        <span
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[var(--festival-red)] shadow-[0_0_10px_rgba(244,67,54,0.9)]"
          style={{ left: `${pct}%` }}
        />
      </div>
    </motion.div>
  );
}
