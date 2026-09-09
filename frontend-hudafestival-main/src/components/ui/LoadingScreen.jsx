import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const GLYPHS = ['新', 'ア', '水', 'L', 'i', 'n', 't', 'e', 'r', 'v', 'ก', 'ข', 'シ', 'ツ', 'H', 'U', 'D', 'A', '2', '6'];

const LoadingScreen = ({ onComplete, isReady = true }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Only show once per session
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
    if (hasSeenLoading) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, prefersReducedMotion ? 0 : 1500);

    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, prefersReducedMotion ? 1000 : 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(logoTimer);
    };
  }, [onComplete, prefersReducedMotion]);

  useEffect(() => {
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
    if (!hasSeenLoading && minTimePassed && isReady) {
      setIsVisible(false);
      sessionStorage.setItem('hasSeenLoading', 'true');
    }
  }, [minTimePassed, isReady]);

  // Orbit animations for glyphs
  const generateGlyphVariants = (index) => {
    const angle = (index / GLYPHS.length) * Math.PI * 2;
    const radius = 150; // Starting radius
    const startX = Math.cos(angle) * radius;
    const startY = Math.sin(angle) * radius;

    return {
      hidden: { opacity: 0, x: startX, y: startY, rotate: 0, scale: 0.5 },
      converge: { 
        opacity: [0, 1, 0], 
        x: 0, 
        y: 0, 
        rotate: 360,
        scale: 1,
        transition: { 
          duration: 1.5, 
          ease: "easeInOut" 
        } 
      }
    };
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[var(--festival-white)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle animated background gradient blobs */}
          {!prefersReducedMotion && (
            <>
              <motion.div 
                className="absolute w-[50vw] h-[50vw] rounded-full bg-[var(--festival-red)] opacity-5 blur-[100px]"
                animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ top: '-10%', left: '-10%' }}
              />
              <motion.div 
                className="absolute w-[40vw] h-[40vw] rounded-full bg-[var(--festival-teal)] opacity-5 blur-[100px]"
                animate={{ x: [0, -80, 0], y: [0, 80, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{ bottom: '-5%', right: '-5%' }}
              />
              <motion.div 
                className="absolute w-[30vw] h-[30vw] rounded-full bg-[var(--festival-yellow)] opacity-5 blur-[80px]"
                animate={{ x: [0, 50, -50, 0], y: [0, 50, 50, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ top: '30%', left: '40%' }}
              />
            </>
          )}

          {/* Logo Assembly Area */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            {/* The Glyphs Swarm */}
            {!prefersReducedMotion && !showLogo && (
              <div className="absolute inset-0 flex items-center justify-center">
                {GLYPHS.map((glyph, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-2xl font-black text-[var(--festival-black)]"
                    variants={generateGlyphVariants(i)}
                    initial="hidden"
                    animate="converge"
                  >
                    {glyph}
                  </motion.span>
                ))}
              </div>
            )}

            {/* The Real Logo Image */}
            <motion.img
              src="/logo-mark.png"
              alt="L'intervention Logo"
              className="w-full h-full object-contain relative z-10"
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
              animate={{ 
                opacity: showLogo ? 1 : 0, 
                scale: showLogo ? 1 : 0.8,
                filter: showLogo ? 'blur(0px)' : 'blur(10px)'
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onError={(e) => {
                // Fallback if logo isn't present
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          <div className="text-center relative z-10">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter leading-none text-[var(--festival-black)] flex items-center justify-center gap-4"
            >
              L'INTERVENTION
              <span className="text-sm md:text-xl bg-[var(--festival-red)] text-white px-3 py-1 rounded-sm tracking-widest border-2 border-[var(--festival-black)] shadow-[4px_4px_0px_0px_rgba(23,23,23,1)]">
                2K26
              </span>
            </motion.h1>
          </div>
          
          {/* Progress Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex items-center gap-3 relative z-10"
          >
             <div className="w-24 h-1 bg-black/10 overflow-hidden rounded-full">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                  className="h-full w-1/2 bg-[var(--festival-black)] rounded-full"
                />
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
