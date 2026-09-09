import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import FestivalPattern from '../components/brand/FestivalPattern';
import ProgrammeMarquee from '../components/ui/ProgrammeMarquee';
import api from '../services/api';

const AnimatedCounter = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (value === null || value === '--') return;
    if (prefersReducedMotion) {
      count.set(value);
    } else {
      const animation = animate(count, value, { duration: 2, ease: "easeOut" });
      return animation.stop;
    }
  }, [value, count, prefersReducedMotion]);

  if (value === null || value === '--') return '--';
  return <motion.span>{rounded}</motion.span>;
};

const HomePage = () => {
  const [stats, setStats] = useState({
    programmes: null,
    participants: null,
    results: null,
    programmesList: []
  });
  
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [progRes, candRes, resultRes] = await Promise.all([
          api.get('/programmes'),
          api.get('/candidates'),
          api.get('/results/published')
        ]);
        
        setStats({
          programmes: progRes.data.length || 0,
          participants: candRes.data.length || 0,
          results: resultRes.data.length || 0,
          programmesList: progRes.data || []
        });
      } catch (err) {
        console.error('Failed to fetch festival status:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--festival-white)] text-[var(--festival-black)] overflow-hidden">
      <FestivalPattern />
      
      {/* Main Hero Container */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 pt-24 pb-32 min-h-screen flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 flex flex-col items-start text-left z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-block px-4 py-1.5 mb-6 border-2 border-[var(--border)] rounded-full text-sm font-bold uppercase tracking-widest bg-[var(--festival-white)] text-[var(--festival-black)] shadow-[4px_4px_0px_0px_rgba(23,23,23,1)]"
            >
              L'intervention
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="text-[12vw] md:text-[8vw] lg:text-[7rem] font-black font-display leading-[0.85] tracking-tighter uppercase mb-6"
            >
              L'INTERVENTION <br />
              <span className="text-[var(--festival-red)]">2026</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="text-xl md:text-2xl font-medium max-w-xl text-gray-800 mb-10 leading-snug"
            >
              Celebrating talent. Creativity. Competition. <br className="hidden md:block"/>
              The ultimate cultural showcase.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link
                to="/programmes"
                className="group relative px-8 py-4 bg-[var(--festival-red)] text-white font-bold text-lg rounded-sm overflow-hidden border-2 border-transparent transition-all hover:bg-[var(--festival-black)] hover:shadow-[6px_6px_0px_0px_rgba(23,23,23,1)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  EXPLORE FESTIVAL
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/schedule"
                className="px-8 py-4 bg-transparent text-[var(--festival-black)] font-bold text-lg border-2 border-[var(--border)] rounded-sm hover:bg-[var(--festival-black)] hover:text-[var(--festival-white)] transition-colors"
              >
                VIEW SCHEDULE
              </Link>
            </motion.div>
          </div>
          
          <div className="lg:col-span-4 relative hidden lg:block z-10">
            {/* Right-hand collage with continuous idle motion on decorative blocks */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full aspect-[4/5] bg-[var(--festival-yellow)] border-4 border-[var(--border)] shadow-[12px_12px_0px_0px_rgba(23,23,23,1)] overflow-hidden p-6 flex flex-col justify-between"
            >
              <motion.div 
                animate={prefersReducedMotion ? {} : { scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
                transition={prefersReducedMotion ? {} : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-32 h-32 bg-[var(--festival-teal)] rounded-bl-full border-b-4 border-l-4 border-[var(--border)] origin-top-right" 
              />
              <motion.div 
                animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
                transition={prefersReducedMotion ? {} : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 -left-10 w-40 h-40 bg-[var(--festival-red)] rounded-full border-4 border-[var(--border)] mix-blend-multiply" 
              />
              
              <h2 className="text-4xl font-black font-display uppercase tracking-tighter leading-none relative z-10 mt-10">
                IDEAS<br/>PEOPLE<br/>CULTURE
              </h2>
              
              <div className="relative z-10 w-full h-48 bg-[var(--festival-black)] mt-auto" style={{ backgroundImage: "url('/images/bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%) contrast(120%)' }} />
            </motion.div>
          </div>
        </div>

        {/* Festival Status Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-[1440px] mx-auto mt-24 mb-10 bg-[var(--festival-white)] border-y-2 border-[var(--border)] lg:border-2 lg:shadow-[8px_8px_0px_0px_rgba(23,23,23,1)] grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-[var(--border)] lg:divide-y-0 divide-y-2 lg:divide-x-2"
        >
          <div className="p-6 md:p-8 flex items-center justify-center gap-4 border-b-2 lg:border-b-0 border-[var(--border)]">
             <div className="w-4 h-4 rounded-full bg-[var(--festival-teal)] animate-pulse" />
             <span className="font-bold text-lg uppercase tracking-wider">Festival<br/>Live</span>
          </div>
          
          <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
            <span className="text-3xl md:text-5xl font-black font-display">
              <AnimatedCounter value={stats.programmes} />
            </span>
            <span className="text-sm font-bold uppercase tracking-widest text-gray-500 mt-1">Programmes</span>
          </div>

          <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
            <span className="text-3xl md:text-5xl font-black font-display">
              <AnimatedCounter value={stats.participants} />
            </span>
            <span className="text-sm font-bold uppercase tracking-widest text-gray-500 mt-1">Participants</span>
          </div>

          <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
            <span className="text-3xl md:text-5xl font-black font-display">
              <AnimatedCounter value={stats.results} />
            </span>
            <span className="text-sm font-bold uppercase tracking-widest text-gray-500 mt-1">Results</span>
          </div>
        </motion.div>

      </div>

      <div className="relative z-20 mt-auto">
        <ProgrammeMarquee programmes={stats.programmesList} />
      </div>
    </div>
  );
};

export default HomePage;
