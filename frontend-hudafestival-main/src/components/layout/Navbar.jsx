import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <header className="absolute top-0 left-0 w-full py-6 z-50">
            <nav className="container mx-auto px-4 flex justify-center">
                
                <ul className="bg-[var(--festival-white)] border-2 border-[var(--border)] p-2 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] flex items-center space-x-2">
                    {[
                        { to: '/', label: 'Home' },
                        { to: '/leaderboards', label: 'Leaderboards' },
                        { to: '/programmes', label: 'Programmes' },
                        { to: '/schedule', label: 'Schedule' },
                        { to: '/gallery', label: 'Gallery' },
                        { to: '/search', label: 'Search' }
                    ].map(link => (
                        <li key={link.to}>
                            <NavLink 
                                to={link.to} 
                                end={link.to === '/'}
                                className={({ isActive }) => 
                                    `block px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors duration-200 border-2 ${
                                        isActive 
                                            ? 'bg-[var(--festival-black)] text-[var(--festival-white)] border-[var(--festival-black)]' 
                                            : 'bg-transparent text-[var(--festival-black)] border-transparent hover:border-[var(--border)]'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;
