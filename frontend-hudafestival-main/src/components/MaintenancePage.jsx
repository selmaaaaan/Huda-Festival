import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import TopographyBackground from './TopographyBackground';

const MaintenancePage = ({ message }) => {
  const prefersReducedMotion = useReducedMotion();
  const headline = message || "We'll be back soon";

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

  // Helper to split text preserving words so they wrap correctly instead of breaking mid-word
  const words = headline.split(' ');

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#133E2B]">
      {/* Background layer */}
      <TopographyBackground />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Optional Logo */}
        <motion.img
          src="/images/logo.png"
          alt="HUDA Stamp"
          className="w-32 md:w-48 mb-12 drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        />

        {prefersReducedMotion ? (
          <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-[var(--font-display)] tracking-tighter drop-shadow-lg max-w-4xl">
            {headline}
          </h1>
        ) : (
          <motion.h1
            className="text-white text-4xl md:text-6xl lg:text-7xl font-[var(--font-display)] tracking-tighter flex flex-wrap justify-center drop-shadow-lg max-w-4xl"
            variants={letterContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-flex mr-3 mb-2">
                {word.split('').map((char, charIndex) => (
                  <motion.span key={charIndex} variants={letterVariants} style={{ display: 'inline-block' }}>
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;

