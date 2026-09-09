import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[var(--festival-black)] py-12 border-t-4 border-[var(--border)] mt-auto relative z-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-[var(--festival-white)]">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h2 className="text-3xl font-black font-display uppercase tracking-tighter leading-none mb-2">L'INTERVENTION '26</h2>
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">L'intervention</p>
        </div>
        
        <div className="text-center md:text-right text-xs font-bold uppercase tracking-widest opacity-60">
          &copy; {new Date().getFullYear()} L'intervention.<br/>
          All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
