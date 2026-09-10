import React from 'react';
import { Link } from 'react-router-dom';

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

const Footer = () => {
  return (
    <footer className="bg-[var(--festival-black)] pt-16 pb-8 border-t-4 border-[var(--border)] mt-auto relative z-10 text-[var(--festival-cream)]">
      <div className="container mx-auto px-6 max-w-[1440px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black font-display uppercase tracking-tighter leading-none mb-4 hover:text-[var(--festival-orange)] transition-colors cursor-default">L'INTERVENTION '26</h2>
            <p className="text-sm font-bold uppercase tracking-widest opacity-60">L'intervention Arts Fest</p>
          </div>
          
          <div className="text-center md:text-left flex flex-col items-center md:items-start gap-3">
            <h3 className="font-display font-black text-xl uppercase tracking-widest text-[var(--festival-teal)] mb-2">Explore</h3>
            <Link to="/programmes" className="text-sm font-bold uppercase tracking-widest hover:text-[var(--festival-teal)] transition-colors">Programmes</Link>
            <Link to="/schedule" className="text-sm font-bold uppercase tracking-widest hover:text-[var(--festival-teal)] transition-colors">Schedule</Link>
            <Link to="/leaderboards" className="text-sm font-bold uppercase tracking-widest hover:text-[var(--festival-teal)] transition-colors">Leaderboards</Link>
            <Link to="/gallery" className="text-sm font-bold uppercase tracking-widest hover:text-[var(--festival-teal)] transition-colors">Gallery</Link>
          </div>
          
          <div className="text-center md:text-right flex flex-col items-center md:items-end gap-3">
            <h3 className="font-display font-black text-xl uppercase tracking-widest text-[var(--festival-red)] mb-2">Portals</h3>
            <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="text-sm font-bold uppercase tracking-widest hover:text-[var(--festival-red)] transition-colors">Admin Panel</a>
            <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="text-sm font-bold uppercase tracking-widest hover:text-[var(--festival-red)] transition-colors">Registration Desk</a>
            <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="text-sm font-bold uppercase tracking-widest hover:text-[var(--festival-red)] transition-colors">Judge Panel</a>
          </div>
        </div>
        
        <div className="border-t-2 border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-bold uppercase tracking-widest opacity-50">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} L'intervention. All rights reserved.
          </div>
          <div>
            Huda Festival System
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
