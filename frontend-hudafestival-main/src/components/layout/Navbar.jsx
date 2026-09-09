import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const LINKS = [
        { to: '/programmes', label: 'Programmes' },
        { to: '/schedule', label: 'Schedule' },
        { to: '/results', label: 'Results' },
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
                <div className="hidden lg:flex items-center gap-4">
                    <Link to="/search" className="p-2 hover:bg-black/5 rounded-full transition-colors" aria-label="Search">
                        <Search size={20} className="text-[var(--festival-black)]" />
                    </Link>
                    <Link to="/schedule" className="px-6 py-2 bg-[var(--festival-black)] text-[var(--festival-cream)] font-bold text-sm uppercase tracking-wider hover:-translate-y-1 hover:shadow-lg transition-all rounded-full">
                        Get Started
                    </Link>
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
                        
                        <Link to="/schedule" onClick={() => setMobileOpen(false)} className="w-full py-4 text-center bg-[var(--festival-black)] text-[var(--festival-cream)] font-bold text-xl uppercase tracking-wider">
                            Get Started
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
