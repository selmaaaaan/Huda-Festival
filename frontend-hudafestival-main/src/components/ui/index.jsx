import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const SectionHeading = ({ children, subtitle, align = 'left' }) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div 
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      {subtitle && (
        <p className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-2">
          {subtitle}
        </p>
      )}
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display uppercase tracking-tighter leading-none">
        {children}
      </h2>
    </motion.div>
  );
};

export const FilterPills = ({ options, selected, onChange }) => (
  <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`whitespace-nowrap px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-colors border-2 ${
          selected === opt.value
            ? 'bg-[var(--festival-black)] text-[var(--festival-white)] border-[var(--festival-black)]'
            : 'bg-[var(--festival-white)] text-[var(--festival-black)] border-[var(--border)] hover:bg-gray-100'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export const EmptyState = ({ title, message, icon }) => (
  <div className="py-20 flex flex-col items-center text-center border-2 border-[var(--border)] shadow-[8px_8px_0px_0px_rgba(23,23,23,1)] bg-[var(--festival-white)]">
    <div className="text-6xl mb-6 text-gray-300">{icon || '👀'}</div>
    <h3 className="text-2xl font-black font-display uppercase tracking-tight mb-2">{title}</h3>
    <p className="text-gray-600 max-w-sm">{message}</p>
  </div>
);
