import React, { useMemo, useState } from 'react';
import { motion, useMotionValue, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion';

const BURST_COLORS = ['#F44336', '#FFC928', '#00A6A6', '#9B4DCA', '#FF8A00', '#1687D9'];

function Burst({ power, onDone }) {
  const count = Math.round(10 + power * 14);
  const parts = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        a: Math.random() * Math.PI * 2,
        d: 50 + Math.random() * power * 140,
        s: 5 + Math.random() * 7,
        c: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
      })),
    [count, power]
  );
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ width: p.s, height: p.s, background: p.c, boxShadow: `0 0 12px ${p.c}` }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.a) * p.d,
            y: Math.sin(p.a) * p.d,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: 0.9 + Math.random() * 0.5, ease: 'easeOut' }}
          onAnimationComplete={i === 0 ? onDone : undefined}
        />
      ))}
    </div>
  );
}

export default function LogoIntro({ onEnter }) {
  const prefersReduced = useReducedMotion();
  const [clicks, setClicks] = useState(0);
  const [bursts, setBursts] = useState([]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useTransform(mx, [-0.5, 0.5], [10, -10]);
  const rotateX = useTransform(my, [-0.5, 0.5], [-10, 10]);

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const handleClick = () => {
    if (prefersReduced) {
      onEnter();
      return;
    }
    const next = clicks + 1;
    if (next >= 4) {
      onEnter();
      return;
    }
    setClicks(next);
    const id = Date.now() + next;
    setBursts((b) => [...b, { id, power: next }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1600);
  };

  const hint =
    clicks === 0
      ? 'CLICK THE LOGO TO ENTER'
      : clicks === 1
      ? 'AGAIN — FEEL IT BUILD'
      : 'ONE MORE SPARK';

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6"
      style={{
        background:
          'radial-gradient(120% 90% at 50% 45%, rgba(10,10,20,0.15) 0%, rgba(8,8,16,0.55) 70%, rgba(4,4,10,0.8) 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence>
        {bursts.map((b) => (
          <Burst key={b.id} power={b.power} />
        ))}
      </AnimatePresence>

      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={reset}
        onClick={handleClick}
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        className="cursor-pointer select-none"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-6 justify-center"
        >
          <div className="w-12 h-[2px] bg-[var(--festival-cream)]/70" />
          <span className="text-sm font-bold tracking-[0.3em] uppercase text-[var(--festival-cream)]/80">
            Écris le monde
          </span>
          <div className="w-12 h-[2px] bg-[var(--festival-cream)]/70" />
        </motion.div>

        <h1 className="text-6xl md:text-8xl lg:text-[9rem] leading-none mb-4 drop-shadow-2xl">
          <span style={{ fontFamily: 'Georgia, serif' }} className="text-[var(--festival-cream)]">
            L'in
          </span>
          <span
            style={{ fontFamily: '"Brush Script MT", "Pacifico", cursive' }}
            className="text-[var(--festival-orange)] px-1 inline-block"
          >
            t
          </span>
          <span style={{ fontFamily: 'Georgia, serif' }} className="text-[var(--festival-cream)]">
            erv
          </span>
          <span
            style={{ fontFamily: '"Brush Script MT", "Pacifico", cursive' }}
            className="text-[var(--festival-purple)] px-1 inline-block"
          >
            e
          </span>
          <span style={{ fontFamily: 'Georgia, serif' }} className="text-[var(--festival-cream)]">
            ntion
          </span>
        </h1>

        <div className="text-5xl md:text-7xl font-black font-display tracking-tighter flex justify-center gap-1">
          <span className="text-[var(--festival-red)]">2</span>
          <span className="text-[var(--festival-teal)]">0</span>
          <span className="text-[var(--festival-yellow)]">2</span>
          <span className="text-[var(--festival-purple)]">6</span>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-[var(--festival-cream)]/80 font-bold uppercase tracking-[0.25em] text-sm"
      >
        {hint}
      </motion.p>
      <div className="mt-3 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 rounded-full border border-[var(--festival-cream)]/60 ${
              clicks > i ? 'bg-[var(--festival-yellow)]' : 'bg-transparent'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
