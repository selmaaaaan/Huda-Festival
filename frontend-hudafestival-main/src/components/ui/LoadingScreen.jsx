import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const GLYPHS = ['新', 'ア', '水', 'ก', 'ข', 'シ', 'ツ', 'Ω', 'L', 'I', 'N', 'T', 'E', 'R', 'V', 'Σ', 'λ', 'Δ', '2', '6'];

const FESTIVAL_COLORS = [
  '#F44336', // red
  '#FF8A00', // orange
  '#FFC928', // yellow
  '#9B4DCA', // purple
  '#00A6A6', // teal
  '#1687D9', // blue
];

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
};

const LoadingScreen = ({ onComplete, isReady = true }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
  const [bgTint, setBgTint] = useState('rgba(255, 249, 238, 1)'); // cream base
  
  const prefersReducedMotion = useReducedMotion();

  // Background tint interpolation
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      const randomColor = FESTIVAL_COLORS[Math.floor(Math.random() * FESTIVAL_COLORS.length)];
      const opacity = (Math.random() * 0.03 + 0.05).toFixed(2); // 5-8% opacity
      setBgTint(`rgba(${hexToRgb(randomColor)}, ${opacity})`);
    }, 800); // smoothly transition every 800ms
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
    if (hasSeenLoading) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, prefersReducedMotion ? 1000 : 2500);

    const logoTimer = setTimeout(() => {
      setLogoReady(true);
    }, prefersReducedMotion ? 0 : 2000);

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

  // Generate independent random animations for glyphs
  const glyphAnimations = useMemo(() => {
    return GLYPHS.map(() => {
      return {
        duration: Math.random() * 3 + 5, // 5-8s
        x: [(Math.random() - 0.5) * 600, (Math.random() - 0.5) * 800, 0],
        y: [(Math.random() - 0.5) * 600, (Math.random() - 0.5) * 800, 0],
        rotate: [0, Math.random() * 720 - 360, 0],
        scale: [Math.random() * 2 + 1, Math.random() * 3 + 0.5, 0],
        opacity: [0, 0.5, 1, 0]
      };
    });
  }, []);

  const wordmark = "L'intervention".split('');

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000 ease-in-out"
          style={{ backgroundColor: prefersReducedMotion ? 'var(--festival-cream)' : bgTint }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Swarm of Glyphs */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {GLYPHS.map((glyph, i) => {
                const anim = glyphAnimations[i];
                return (
                  <motion.div
                    key={i}
                    className="absolute text-5xl md:text-8xl font-black text-black/10 font-display mix-blend-overlay"
                    initial={{ x: anim.x[0], y: anim.y[0], rotate: 0, scale: anim.scale[0], opacity: 0 }}
                    animate={
                      !logoReady 
                      ? {
                          x: anim.x,
                          y: anim.y,
                          rotate: anim.rotate,
                          scale: [anim.scale[0], anim.scale[1]],
                          opacity: [0, 0.8, 0.4]
                        }
                      : {
                          x: 0,
                          y: 0,
                          rotate: 0,
                          scale: 0,
                          opacity: 0
                        }
                    }
                    exit={{ x: anim.x[0] * 2, y: anim.y[0] * 2, scale: anim.scale[0] * 2, opacity: 0 }}
                    transition={
                      !logoReady 
                      ? { duration: anim.duration, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }
                      : { duration: 0.5, ease: "anticipate" }
                    }
                  >
                    {glyph}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Logo Container */}
          <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-12">
            <motion.img
              src="/logo-mark.png"
              alt="L'intervention Logo"
              className="w-full h-full object-contain"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={
                logoReady 
                ? { scale: [0.4, 1.12, 0.98, 1], opacity: 1 } 
                : { scale: 0.4, opacity: 0 }
              }
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>

          {/* Wordmark and Tagline */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex overflow-hidden pb-2">
              {wordmark.map((letter, i) => (
                <motion.span
                  key={i}
                  className="text-4xl md:text-6xl font-black font-display tracking-tighter uppercase text-[var(--festival-black)]"
                  initial={{ y: 50, opacity: 0, filter: 'blur(10px)' }}
                  animate={logoReady ? { y: 0, opacity: 1, filter: 'blur(0px)' } : { y: 50, opacity: 0, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, delay: logoReady ? i * 0.035 : 0 }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <div className="relative mt-2">
              <motion.span
                className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-gray-500"
                initial={{ opacity: 0 }}
                animate={logoReady ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: logoReady ? 1 : 0 }}
              >
                ÉCRIS LE MONDE
              </motion.span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[var(--festival-red)]"
                initial={{ scaleX: 0 }}
                animate={logoReady ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.6, delay: logoReady ? 1.2 : 0, ease: "easeOut" }}
                style={{ originX: 0.5 }}
              />
            </div>
          </div>

          {/* Animated Gradient Progress Bar */}
          <motion.div 
            className="relative z-10 mt-16 w-64 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={logoReady ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: logoReady ? 1.5 : 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full h-1.5 rounded-full overflow-hidden relative bg-black/10">
              <motion.div 
                className="absolute inset-y-0 left-0 w-full"
                style={{
                  background: 'linear-gradient(90deg, var(--festival-red), var(--festival-orange), var(--festival-purple), var(--festival-teal), var(--festival-red))',
                  backgroundSize: '200% 100%'
                }}
                animate={{ backgroundPosition: ['100% 0%', '0% 0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            {/* Soft Glow */}
            <motion.div 
              className="absolute top-0 w-full h-1.5 rounded-full blur-[8px] opacity-60"
              style={{
                background: 'linear-gradient(90deg, var(--festival-red), var(--festival-orange), var(--festival-purple), var(--festival-teal), var(--festival-red))',
                backgroundSize: '200% 100%'
              }}
              animate={{ backgroundPosition: ['100% 0%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <span className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              Loading a brighter tomorrow...
            </span>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
