import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const ProgrammeMarquee = ({ programmes }) => {
  const prefersReducedMotion = useReducedMotion();
  
  if (!programmes || programmes.length === 0) return null;

  const activeProgrammes = programmes.filter(p => p.name);
  if (activeProgrammes.length === 0) return null;

  const displayTrack = activeProgrammes.map(p => p.name).join(' ✦ ') + ' ✦ ';
  
  if (prefersReducedMotion) {
    return (
      <div className="w-full bg-[var(--festival-black)] text-[var(--festival-cream)] py-4 border-y-4 border-[var(--border)] overflow-hidden">
        <div className="px-6 flex flex-wrap gap-4 justify-center">
          {activeProgrammes.map(p => (
            <span key={p._id} className="font-bold uppercase tracking-widest text-sm">{p.name} ✦</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--festival-black)] text-[var(--festival-cream)] py-4 border-y-4 border-[var(--border)] overflow-hidden flex whitespace-nowrap group">
      {/* We use a custom CSS animation block to handle pausing smoothly, 
          while maintaining the 0 to -50% structure as requested. */}
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .framer-marquee-emulation {
          animation: marquee-scroll 40s linear infinite;
        }
        .group:hover .framer-marquee-emulation {
          animation-play-state: paused;
        }
      `}</style>
      
      <div
        className="flex font-black font-display uppercase tracking-widest text-2xl md:text-3xl framer-marquee-emulation"
        style={{ width: "max-content" }}
      >
        <span className="pr-4">{displayTrack}</span>
        <span className="pr-4">{displayTrack}</span>
      </div>
    </div>
  );
};

export default ProgrammeMarquee;
