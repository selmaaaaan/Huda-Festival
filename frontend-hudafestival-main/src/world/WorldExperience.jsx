import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import api from '../services/api';
import { WORLDS, stationIndexAt } from './worldData';
import WorldCanvas from './WorldCanvas';
import { useTravel } from './useTravel';
import LogoIntro from './overlays/LogoIntro';
import LocationReveal from './overlays/LocationReveal';
import LocationHUD from './overlays/LocationHUD';

const DEFAULT_PROGRAMMES = [
  'ARABIC DEBATE',
  'CALLIGRAPHY',
  'MULTILINGUAL ESSAY',
  'ESSAY WRITING',
  'DIGITAL ART',
  'STREET PLAY',
];

function ProgramTicker({ items }) {
  const track = (items.length ? items.join('  ✦  ') : DEFAULT_PROGRAMMES.join('  ✦  ')) + '  ✦  ';
  return (
    <div className="absolute bottom-0 left-0 w-full z-20 bg-[var(--festival-black)] text-[var(--festival-cream)] border-t-4 border-[var(--border)] overflow-hidden flex whitespace-nowrap group">
      <style>{`
        @keyframes huda-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .huda-marquee { animation: huda-marquee 34s linear infinite; }
        .group:hover .huda-marquee { animation-play-state: paused; }
      `}</style>
      <div className="flex font-black font-display uppercase tracking-widest text-xl md:text-2xl huda-marquee" style={{ width: 'max-content' }}>
        <span className="py-3 pr-4">{track}</span>
        <span className="py-3 pr-4">{track}</span>
      </div>
    </div>
  );
}

function CTAOverlay() {
  return (
    <motion.div
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 pointer-events-none"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row gap-3 pointer-events-auto">
        <Link
          to="/programmes"
          className="px-7 py-3.5 bg-[var(--festival-red)] text-[var(--festival-cream)] font-bold uppercase tracking-wider text-base md:text-lg border-2 border-[var(--border)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] transition-all text-center"
        >
          Explore Programmes →
        </Link>
        <Link
          to="/leaderboards"
          className="px-7 py-3.5 bg-[var(--festival-cream)] text-[var(--festival-black)] font-bold uppercase tracking-wider text-base md:text-lg border-2 border-[var(--border)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] transition-all text-center"
        >
          View Leaderboard →
        </Link>
      </div>
    </motion.div>
  );
}

function TravelHint({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-4 py-2 bg-black/40 backdrop-blur-sm text-[var(--festival-cream)] text-xs md:text-sm font-bold uppercase tracking-[0.25em] rounded-full border border-[var(--festival-cream)]/30">
            Move your mouse to journey · scroll to nudge
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function WorldExperience() {
  const prefersReduced = useReducedMotion();
  const travel = useTravel();
  const heroRef = useRef();

  const [phase, setPhase] = useState('intro');
  const [hud, setHud] = useState({ progress: 0, index: 0 });
  const [revealWorld, setRevealWorld] = useState(null);
  const [programmes, setProgrammes] = useState([]);
  const [quality, setQuality] = useState('high');
  const [inView, setInView] = useState(true);
  const [showHint, setShowHint] = useState(false);

  // Push per-frame camera progress to React for HUD / reveal overlays.
  useEffect(() => {
    travel.controls.current.onHud = (p) => {
      setHud({ progress: p, index: stationIndexAt(p) });
    };
  }, [travel]);

  // Quality: low on small screens or when reduced motion is requested.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const update = () => setQuality(mq.matches || prefersReduced ? 'low' : 'high');
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [prefersReduced]);

  // Pause the render loop when the hero scrolls out of view.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Chapter reveal whenever we (re)enter explore or arrive at a new world.
  useEffect(() => {
    if (phase !== 'explore') return;
    setRevealWorld(WORLDS[hud.index]);
    const t = setTimeout(() => setRevealWorld(null), 2600);
    return () => clearTimeout(t);
  }, [phase, hud.index]);

  // Show the travel hint briefly after entering.
  useEffect(() => {
    if (phase !== 'explore') return;
    setShowHint(true);
    const t = setTimeout(() => setShowHint(false), 6500);
    return () => clearTimeout(t);
  }, [phase]);

  // Programme names for the ticker.
  useEffect(() => {
    let alive = true;
    api
      .get('/programmes')
      .then((res) => {
        if (!alive) return;
        const list = (res.data || []).map((p) => p.name).filter(Boolean).slice(0, 10);
        if (list.length) setProgrammes(list);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const handleEnter = () => {
    setPhase('explore');
    travel.triggerBoost();
  };

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden bg-[#c4d6e6]">
      <WorldCanvas controls={travel.controls} quality={quality} frameloop={inView ? 'always' : 'never'} />

      <LocationReveal world={revealWorld} />

      <AnimatePresence>
        {phase === 'intro' && <LogoIntro key="logo" onEnter={handleEnter} />}
      </AnimatePresence>

      {phase === 'explore' && (
        <>
          <LocationHUD progress={hud.progress} index={hud.index} />
          <CTAOverlay />
          <TravelHint show={showHint} />
          <ProgramTicker items={programmes} />
        </>
      )}
    </section>
  );
}
