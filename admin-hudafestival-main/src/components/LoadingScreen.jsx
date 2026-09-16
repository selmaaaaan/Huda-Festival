import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ isReady = true, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    // Force the stamp animation to play for at least 1.2s before allowing exit
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, prefersReducedMotion ? 500 : 1200);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (isReady && minTimePassed) {
      setIsVisible(false);
    }
  }, [isReady, minTimePassed]);

  const handleExitComplete = () => {
    if (onComplete) onComplete();
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ 
            backgroundColor: '#FFF8EC',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.06'/%3E%3C/svg%3E")`
          }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="relative flex flex-col items-center">
            {/* Logo Stamp Container */}
            <div className="relative w-56 md:w-72 h-56 md:h-72 flex items-center justify-center z-10">
              <motion.img
                src="/logo-badge.png"
                alt="L'intervention Loading"
                className="w-full h-full object-contain relative z-10"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.4, rotate: -6 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
                transition={prefersReducedMotion 
                  ? { duration: 0.4 } 
                  : { 
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                      mass: 1,
                      delay: 0.1 // Tiny delay to let the screen render first
                    }
                }
              />
              
              {/* Ink Spread / Impact Glow */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 rounded-full mix-blend-multiply pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(217,119,6,0.3) 0%, rgba(217,119,6,0) 70%)'
                  }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.6, 1.3, 1.6] }}
                  transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
                />
              )}
            </div>

            {/* Horizontal Rule */}
            <motion.div
              className="w-40 h-[1px] bg-amber-900/20 mt-4 mb-5"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            />

            {/* Loading Text */}
            <motion.p
              className="text-amber-900/80 font-bold uppercase tracking-[0.15em] text-xs md:text-sm mb-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              Loading a brighter tomorrow...
            </motion.p>

            {/* Progress Bar */}
            <motion.div
              className="w-48 h-[3px] bg-amber-900/10 rounded-full overflow-hidden relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 w-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #F97316 0%, #22C55E 100%)',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }} // Initial fill
              />
              {/* Indeterminate shine passing over it */}
              <motion.div
                className="absolute inset-y-0 left-0 w-full bg-white/40"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, delay: 1.3, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
