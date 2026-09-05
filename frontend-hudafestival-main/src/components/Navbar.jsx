import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Moon, Sun, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const navLinks = [
  { to: '/', label: 'HOME', end: true },
  { to: '/programmes', label: 'RESULT' },
  { to: '/leaderboards', label: 'SCORE BOARD' },
  { to: '/search', label: 'CANDIDATE' }, // Fixed to the actual route in App.jsx /search
  { to: '/schedule', label: 'SCHEDULE' },
  { to: '/gallery', label: 'GALLERY' },
];

const ConfettiParticle = ({ index }) => {
  const angle = (index / 12) * Math.PI * 2;
  const velocity = 50 + Math.random() * 50;
  const tx = Math.cos(angle) * velocity;
  const ty = Math.sin(angle) * velocity;
  const colors = ['#FF4655', '#F6D24A', '#3B82F6', '#10B981'];
  
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
      style={{ backgroundColor: colors[index % colors.length], x: '-50%', y: '-50%' }}
      initial={{ opacity: 1, scale: 0, x: '-50%', y: '-50%' }}
      animate={{ opacity: 0, scale: 1.5, x: `calc(-50% + ${tx}px)`, y: `calc(-50% + ${ty}px)` }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  );
};

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (document.body.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const triggerCelebration = () => {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 1000);
  };

  return (
    <>
      <header className="absolute top-0 left-0 w-full py-4 md:py-6 z-50">
        <nav className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* Left: Logo with celebration */}
          <div className="relative flex-shrink-0 z-50">
            <NavLink to="/" end onClick={triggerCelebration}>
              <Logo size="small" />
            </NavLink>
            {celebrate && (
              <div className="absolute inset-0 pointer-events-none z-[-1]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ConfettiParticle key={i} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Center: Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ to, label, end }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `text-xs font-semibold tracking-widest transition-colors duration-300 ${
                      isActive
                        ? 'text-[var(--color-text-heading)] border-b-2 border-[var(--color-primary)] pb-1'
                        : 'text-[var(--color-text-body)] hover:text-[var(--color-text-heading)]'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4 md:space-x-6 text-[var(--color-text-heading)] z-50">
            <a href={import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173'} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] transition-colors p-2 md:p-0" title="Admin Portal">
              <User size={20} />
            </a>
            <button onClick={toggleDarkMode} className="hover:text-[var(--color-primary)] transition-colors p-2 md:p-0" aria-label="Toggle Dark Mode">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="md:hidden p-2 hover:text-[var(--color-primary)] transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex flex-col pt-24 px-6 md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <ul className="flex flex-col space-y-2">
              {navLinks.map(({ to, label, end }) => (
                <li key={label}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center h-12 text-sm font-semibold tracking-widest transition-colors ${
                        isActive
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-text-heading)]'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
