import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import ProgrammeMarquee from '../components/ui/ProgrammeMarquee';
import api from '../services/api';

const AnimatedCounter = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (value !== null && value !== undefined) {
      if (prefersReducedMotion) {
        count.set(value);
      } else {
        animate(count, value, { duration: 1.5, ease: "easeOut" });
      }
    }
  }, [value, count, prefersReducedMotion]);

  if (value === null) return <span>--</span>;
  return <motion.span>{rounded}</motion.span>;
};

const TEAM_BRANDING = {
  'Bastille': { icon: '🔥', tagline: 'Courage Unites' },
  'Syntagma': { icon: '🏛️', tagline: 'Ideas Rise' },
  'Tahrir': { icon: '🕊️', tagline: 'People Speak' },
  'Tiananmen': { icon: '🎋', tagline: 'A Brighter Tomorrow' }
};

const HomePage = () => {
  const [stats, setStats] = useState({
    programmes: null,
    participants: null,
    results: null,
    programmesList: [],
    teamsList: []
  });
  
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [progRes, candRes, resultRes, teamsRes] = await Promise.all([
          api.get('/programmes'),
          api.get('/candidates'),
          api.get('/results/published'),
          api.get('/teams').catch(() => ({ data: [] }))
        ]);
        
        setStats({
          programmes: progRes.data.length || 0,
          participants: candRes.data.length || 0,
          results: resultRes.data.length || 0,
          programmesList: progRes.data || [],
          teamsList: teamsRes.data || []
        });
      } catch (err) {
        console.error('Failed to fetch festival status:', err);
      }
    };
    fetchStats();
  }, []);

  const daysToGo = Math.max(0, Math.ceil((new Date('2026-05-01').getTime() - new Date().getTime()) / (1000 * 3600 * 24)));

  const featuredProgrammes = stats.programmesList.slice(0, 6);
  const TAGLINES = ["A festival of ideas", "Culture Connects Us", "Voices of the Future", "Creativity Unleashed", "Inspiring Generations"];

  return (
    <div className="min-h-screen bg-[var(--festival-cream)] text-[var(--festival-black)] pt-24 overflow-hidden relative">
      
      {/* Background oversized L'INTERVENTION */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none select-none z-0 opacity-5">
        <h1 className="text-[15vw] font-black font-display uppercase leading-none text-transparent" style={{ WebkitTextStroke: '2px var(--festival-black)' }}>
          L'INTERVENTION
        </h1>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 lg:px-12 pt-16 pb-20 flex flex-col items-center text-center">
        {/* Decorative Glyph Swarm */}
        <div className="absolute bottom-10 right-10 text-4xl font-black opacity-10 font-display rotate-12 select-none">ア 新 ก</div>
        <div className="absolute top-20 left-10 text-2xl font-black opacity-10 font-display -rotate-12 select-none">Ω ツ</div>

        {/* Small Annotations */}
        <div className="absolute hidden lg:block top-32 right-32 text-sm rotate-6" style={{ fontFamily: '"Comic Sans MS", "Caveat", cursive' }}>
          Different Voices,<br/>A Brighter Tomorrow
        </div>
        <div className="absolute hidden lg:block bottom-40 left-32 text-sm -rotate-6" style={{ fontFamily: '"Comic Sans MS", "Caveat", cursive' }}>
          Culture Connects Us
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* ECRIS LE MONDE */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-[2px] bg-[var(--festival-black)]"></div>
            <span className="text-sm font-bold tracking-[0.3em] uppercase">Écris le monde</span>
            <div className="w-12 h-[2px] bg-[var(--festival-black)]"></div>
          </div>

          {/* Huge Title */}
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] leading-none mb-6">
            <span style={{ fontFamily: 'Georgia, serif' }}>L'in</span>
            <span style={{ fontFamily: '"Brush Script MT", "Pacifico", cursive' }} className="text-[var(--festival-orange)] px-1">t</span>
            <span style={{ fontFamily: 'Georgia, serif' }}>erv</span>
            <span style={{ fontFamily: '"Brush Script MT", "Pacifico", cursive' }} className="text-[var(--festival-purple)] px-1">e</span>
            <span style={{ fontFamily: 'Georgia, serif' }}>ntion</span>
          </h1>

          {/* 2026 */}
          <div className="text-7xl md:text-9xl font-black font-display tracking-tighter mb-8 flex">
            <span className="text-[var(--festival-red)]">2</span>
            <span className="text-[var(--festival-teal)]">0</span>
            <span className="text-[var(--festival-yellow)]">2</span>
            <span className="text-[var(--festival-purple)]">6</span>
          </div>

          <p className="max-w-2xl text-xl md:text-2xl font-medium text-gray-700 mb-12">
            A festival of ideas. A celebration of voices. A brighter tomorrow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/programmes" className="px-8 py-4 bg-[var(--festival-red)] text-[var(--festival-cream)] font-bold uppercase tracking-wider text-lg hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] transition-all border-2 border-[var(--border)]">
              Explore Programmes →
            </Link>
            <Link to="/schedule" className="px-8 py-4 bg-[var(--festival-cream)] text-[var(--festival-black)] font-bold uppercase tracking-wider text-lg hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] transition-all border-2 border-[var(--border)]">
              View Schedule
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Strip */}
      <section className="border-y-4 border-[var(--border)] bg-white relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x-2 divide-[var(--border)] divide-y-2 md:divide-y-0 text-center">
            <div className="py-8 flex flex-col items-center justify-center bg-[var(--festival-yellow)]">
              <span className="text-sm font-bold uppercase tracking-wider mb-2">Status</span>
              <div className="flex items-center gap-2 text-2xl font-black font-display uppercase">
                <span className="w-3 h-3 rounded-full bg-[var(--festival-red)] animate-pulse"></span>
                LIVE
              </div>
            </div>
            <div className="py-8 flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-display"><AnimatedCounter value={stats.programmes} /></span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">Programmes</span>
            </div>
            <div className="py-8 flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-display"><AnimatedCounter value={stats.participants} /></span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">Participants</span>
            </div>
            <div className="py-8 flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-display"><AnimatedCounter value={stats.results} /></span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">Results Out</span>
            </div>
            <div className="py-8 flex flex-col items-center justify-center bg-[var(--festival-teal)] text-[var(--festival-cream)]">
              <span className="text-3xl font-black font-display"><AnimatedCounter value={daysToGo} /></span>
              <span className="text-xs font-bold uppercase tracking-widest mt-2">Days to Go</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Tickers */}
      <section className="py-12 border-b-4 border-[var(--border)] bg-[var(--festival-cream)] overflow-hidden space-y-4">
        {stats.programmesList.length > 0 && (
          <ProgrammeMarquee programmes={stats.programmesList} />
        )}
        <div className="relative flex overflow-x-hidden group">
          <div className="animate-marquee-reverse flex whitespace-nowrap group-hover:[animation-play-state:paused] hover:!animate-none">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="flex items-center text-3xl font-black font-display uppercase tracking-tighter text-[var(--festival-black)] opacity-50 px-4">
                {TAGLINES.map((t, idx) => (
                  <React.Fragment key={idx}>
                    {t} <span className="mx-6 text-[var(--festival-red)]">✦</span>
                  </React.Fragment>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Programmes */}
      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b-4 border-[var(--border)] pb-8">
          <h2 className="text-5xl md:text-7xl font-black font-display uppercase tracking-tighter">Featured<br/>Programmes</h2>
          <Link to="/programmes" className="mt-6 md:mt-0 font-bold uppercase tracking-widest hover:text-[var(--festival-red)] transition-colors">
            View All Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProgrammes.map((prog, i) => {
            const colors = ['var(--festival-orange)', 'var(--festival-teal)', 'var(--festival-purple)', 'var(--festival-yellow)', 'var(--festival-red)', 'var(--festival-blue)'];
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={prog._id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={prefersReducedMotion ? {} : { y: -8, scale: 1.02 }}
                className="bg-white border-4 border-[var(--border)] p-8 flex flex-col shadow-[8px_8px_0px_0px_rgba(17,17,17,1)]"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="text-5xl font-black font-display" style={{ color }}>
                    0{i + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full border border-[var(--border)]">
                    {prog.category || 'General'}
                  </span>
                </div>
                <h3 className="text-3xl font-black font-display uppercase tracking-tight mb-4 leading-tight">
                  {prog.name}
                </h3>
                <div className="mt-auto pt-8 flex justify-between items-center border-t-2 border-gray-100">
                  <span className="font-bold text-sm uppercase">{prog.type}</span>
                  <Link to={`/programmes/${prog._id}/results`} className="w-10 h-10 rounded-full border-2 border-[var(--border)] flex items-center justify-center hover:bg-[var(--festival-black)] hover:text-white transition-colors">
                    →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* The Teams */}
      {stats.teamsList.length > 0 && (
        <section className="py-24 bg-[var(--festival-black)] text-[var(--festival-cream)] border-y-4 border-[var(--border)]">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-5xl md:text-7xl font-black font-display uppercase tracking-tighter mb-16 text-center">The Teams</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.teamsList.map((team, i) => {
                const brand = TEAM_BRANDING[team.name] || { icon: '✨', tagline: 'Unite' };
                return (
                  <motion.div
                    key={team._id}
                    initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                    whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={prefersReducedMotion ? {} : { y: -10, rotate: i % 2 === 0 ? 2 : -2 }}
                    className="border-4 border-[var(--border)] p-8 text-center bg-[var(--festival-cream)] text-[var(--festival-black)] relative overflow-hidden group"
                    style={{ backgroundColor: team.color || 'var(--festival-cream)' }}
                  >
                    <div className="text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300">{brand.icon}</div>
                    <h3 className="text-3xl font-black font-display uppercase tracking-tight mb-2 text-white drop-shadow-md">{team.name}</h3>
                    <p className="text-sm font-bold tracking-widest uppercase text-white/90 drop-shadow-sm">{brand.tagline}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial & Gallery Preview */}
      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[var(--festival-orange)] text-8xl font-serif leading-none mb-4">"</div>
            <h3 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tighter leading-tight mb-8">
              A celebration that bridges traditions and sparks new creative horizons for everyone involved.
            </h3>
            <p className="font-bold uppercase tracking-widest text-gray-500">— L'intervention Committee</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-[var(--festival-teal)] rounded-tl-[3rem] border-4 border-[var(--border)] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] relative overflow-hidden group">
               <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')]"></div>
            </div>
            <div className="aspect-square bg-[var(--festival-red)] rounded-br-[3rem] border-4 border-[var(--border)] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] mt-12 relative overflow-hidden group">
               <div className="absolute inset-0 flex items-center justify-center text-white font-black font-display text-4xl opacity-50 group-hover:scale-110 transition-transform">2K26</div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Ticker */}
      <div className="border-t-4 border-[var(--border)] bg-[var(--festival-black)] text-[var(--festival-cream)] py-6 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex text-4xl font-black font-display uppercase tracking-widest">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-8">
              L'INTERVENTION 2026 <span className="text-[var(--festival-yellow)] mx-8">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
