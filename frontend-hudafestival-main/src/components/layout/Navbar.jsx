import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, LogIn, ChevronDown } from 'lucide-react';

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [portalOpen, setPortalOpen] = useState(false);

    const LINKS = [
        { to: '/programmes', label: 'Programmes' },
        { to: '/schedule', label: 'Schedule' },
        { to: '/leaderboards', label: 'Leaderboards' },
        { to: '/gallery', label: 'Gallery' }
    ];

    return (
        <header className="absolute top-0 left-0 w-full py-6 z-50 px-6 md:px-12">
            <nav className="flex justify-between items-center bg-[var(--festival-cream)] border-2 border-[var(--border)] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] py-3 px-6">
                
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 group">
                        <img src="/logo-mark.png" alt="L'intervention Logo" className="w-8 h-8 object-contain group-hover:rotate-12 transition-transform" />
                        <span className="font-black font-display text-xl uppercase tracking-tighter">L'intervention</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <ul className="hidden lg:flex items-center space-x-1">
                    {LINKS.map(link => (
                        <li key={link.to}>
                            <NavLink 
                                to={link.to} 
                                className={({ isActive }) => 
                                    `block px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 rounded-full ${
                                        isActive 
                                            ? 'bg-[var(--festival-black)] text-[var(--festival-cream)]' 
                                            : 'bg-transparent text-[var(--festival-black)] hover:bg-black/5'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Actions */}
                <div className="hidden lg:flex items-center gap-3">
                    <Link to="/search" className="p-2 hover:bg-black/5 rounded-full transition-colors" aria-label="Search">
                        <Search size={20} className="text-[var(--festival-black)]" />
                    </Link>
                    
                    {/* Portal Login Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setPortalOpen(!portalOpen)}
                            onBlur={() => setTimeout(() => setPortalOpen(false), 200)}
                            className="flex items-center gap-1 px-4 py-2 bg-[var(--festival-black)] text-[var(--festival-cream)] font-bold text-sm uppercase tracking-wider hover:-translate-y-0.5 hover:shadow-lg transition-all rounded-full"
                        >
                            <LogIn size={16} /> Portal <ChevronDown size={14} className={`transition-transform ${portalOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {portalOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-56 bg-white border-2 border-[var(--border)] shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] overflow-hidden z-50"
                                >
                                    <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="block px-4 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[var(--festival-red)] hover:text-white transition-colors border-b-2 border-[var(--border)]">
                                        Admin Panel
                                    </a>
                                    <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="block px-4 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[var(--festival-teal)] hover:text-white transition-colors">
                                        Registration Desk
                                    </a>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mobile Hamburger */}
                <button 
                    className="lg:hidden p-2 text-[var(--festival-black)]"
                    onClick={() => setMobileOpen(true)}
                >
                    <Menu size={24} />
                </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-[var(--festival-cream)] z-[60] flex flex-col px-8 pt-8 pb-12"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <span className="font-black font-display text-2xl uppercase tracking-tighter">L'intervention</span>
                            <button onClick={() => setMobileOpen(false)} className="p-2">
                                <X size={32} className="text-[var(--festival-black)]" />
                            </button>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center gap-6">
                            <Link to="/" onClick={() => setMobileOpen(false)} className="text-4xl font-black font-display uppercase hover:text-[var(--festival-red)] transition-colors">Home</Link>
                            {LINKS.map(link => (
                                <Link 
                                    key={link.to} 
                                    to={link.to} 
                                    onClick={() => setMobileOpen(false)}
                                    className="text-4xl font-black font-display uppercase hover:text-[var(--festival-teal)] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link to="/search" onClick={() => setMobileOpen(false)} className="text-4xl font-black font-display uppercase hover:text-[var(--festival-orange)] transition-colors">Search</Link>
                        </div>
                        
                        <div className="space-y-3">
                            <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="block w-full py-3 text-center bg-[var(--festival-black)] text-[var(--festival-cream)] font-bold text-lg uppercase tracking-wider">
                                Admin Panel
                            </a>
                            <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="block w-full py-3 text-center border-2 border-[var(--festival-black)] text-[var(--festival-black)] font-bold text-lg uppercase tracking-wider">
                                Registration Desk
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
