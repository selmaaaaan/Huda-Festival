import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const LoadingScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [statusIndex, setStatusIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const statuses = [
    "Preparing the stage...",
    "Tuning the instruments...",
    "Loading the festival..."
  ];

  useEffect(() => {
    // Only show once per session
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
    if (hasSeenLoading) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const statusTimer = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statuses.length);
    }, 600);

    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('hasSeenLoading', 'true');
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(statusTimer);
    };
  }, [onComplete, statuses.length]);

  const headline = "HUDA FESTIVAL 2026";
  
  const letterContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
  };
  
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } }
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#133E2B', backgroundImage: "url('/images/bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', perspective: '1000px' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.05, y: prefersReducedMotion ? 0 : -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* 3D Stamp and Orbits Container */}
          <div className="relative mb-12 flex items-center justify-center" style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
            {/* Stamp */}
            <motion.img
              src="/images/logo.png"
              alt="HUDA Stamp"
              className="w-48 md:w-64 drop-shadow-2xl relative z-10"
              initial={{ rotateY: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 20,
                delay: 0.1
              }}
            />

            {/* Orbiting Decor - Gold */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute w-8 h-8 rounded-full bg-[#F6D24A] mix-blend-screen opacity-60 filter blur-[2px]"
                initial={{ rotateX: 60, rotateZ: 0, x: -100, y: 50 }}
                animate={{ rotateZ: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: '150px -50px' }}
              />
            )}
            
            {/* Orbiting Decor - Coral */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute w-6 h-6 rounded-full bg-[#FF4655] mix-blend-screen opacity-60 filter blur-[2px]"
                initial={{ rotateX: -40, rotateZ: 180, x: 120, y: -40 }}
                animate={{ rotateZ: 540 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: '-100px 80px' }}
              />
            )}
          </div>

          {/* Staggered Wordmark */}
          {prefersReducedMotion ? (
            <h1 className="text-white text-5xl md:text-7xl font-[var(--font-display)] tracking-tighter">
              {headline}
            </h1>
          ) : (
            <motion.h1
              className="text-white text-5xl md:text-7xl font-[var(--font-display)] tracking-tighter flex space-x-1"
              variants={letterContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {headline.split('').map((char, i) => (
                <motion.span key={i} variants={letterVariants} style={{ display: 'inline-block' }}>
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.h1>
          )}

          {/* Status Line */}
          <div className="h-6 mt-4 relative w-full flex justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={statusIndex}
                className="text-[#F6D24A] text-sm font-semibold tracking-widest uppercase absolute"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {statuses[statusIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
