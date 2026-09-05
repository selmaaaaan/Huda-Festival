import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion, useAnimation } from 'framer-motion';
import { CalendarDays, Trophy, Image as ImageIcon, ChevronDown } from 'lucide-react';
import api from '../services/api';

// --- Helper: CountUp Animation Component ---
const CountUp = ({ to, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isInView) {
      if (prefersReducedMotion) {
        setCount(to);
        return;
      }
      let start = 0;
      const end = parseInt(to, 10);
      if (start === end) return;
      const totalMilSecDur = parseInt(duration, 10) * 1000;
      const incrementTime = (totalMilSecDur / end) * 3; 

      const timer = setInterval(() => {
        start += Math.max(1, Math.floor(end / 40)); // fast increment
        if (start > end) start = end;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [to, duration, isInView, prefersReducedMotion]);

  return <span ref={ref}>{count}</span>;
};

// --- Helper: Staggered Text Reveal ---
const SplitText = ({ text, className }) => {
  const prefersReducedMotion = useReducedMotion();
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 1.2 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: 40,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      style={{ display: "inline-block", overflow: "hidden" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {text.split("").map((word, index) => (
        <motion.span
          variants={child}
          style={{ display: "inline-block", paddingRight: word === " " ? "0.3em" : "0" }}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};


const HomePage = () => {
  const [stats, setStats] = useState({ teams: 0, programmes: 0 });
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [progRes, leadRes] = await Promise.all([
          api.get('/programmes'),
          api.get('/leaderboards')
        ]);
        setStats({
          programmes: progRes.data.length || 42, // fallback if empty
          teams: leadRes.data?.teamLeaderboard?.length || 10,
        });
      } catch (err) {
        setStats({ programmes: 42, teams: 10 }); // fallback static stats
      }
    };
    fetchStats();
  }, []);

  // --- Animation Variants ---
  const heroStampVariant = {
    hidden: { scale: 0.8, opacity: 0, rotate: -3 },
    visible: { 
      scale: 1, opacity: 1, rotate: 0,
      transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.8 }
    }
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const cardContainerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#133E2B]">
        {/* Background Image / Noise */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: "url('/images/bg.jpg')" }}
        />
        
        {/* Subtle Floating Orbs (Accent pops) */}
        {!prefersReducedMotion && (
          <>
            <motion.div 
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF4655] rounded-full mix-blend-screen filter blur-[100px] opacity-30"
              animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F6D24A] rounded-full mix-blend-screen filter blur-[100px] opacity-20"
              animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </>
        )}

        {/* Marquee Ticker */}
        <div className="absolute top-0 w-full overflow-hidden bg-[#111111]/80 backdrop-blur-sm border-b border-white/10 py-2 z-20">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 15, repeat: Infinity }}
          >
            <span className="text-[#F6D24A] text-sm font-semibold tracking-widest uppercase mx-4">
              HUDA FESTIVAL 2025 • MOYILARITY AND MODERNITY • 
            </span>
            <span className="text-[#F6D24A] text-sm font-semibold tracking-widest uppercase mx-4">
              HUDA FESTIVAL 2025 • MOYILARITY AND MODERNITY • 
            </span>
            <span className="text-[#F6D24A] text-sm font-semibold tracking-widest uppercase mx-4">
              HUDA FESTIVAL 2025 • MOYILARITY AND MODERNITY • 
            </span>
            <span className="text-[#F6D24A] text-sm font-semibold tracking-widest uppercase mx-4">
              HUDA FESTIVAL 2025 • MOYILARITY AND MODERNITY • 
            </span>
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center mt-16 px-4">
          <motion.div
            variants={prefersReducedMotion ? {} : heroStampVariant}
            initial="hidden"
            animate="visible"
          >
            <img src="/images/logo.png" alt="Stamp" className="w-40 md:w-56 mb-6 drop-shadow-2xl" />
          </motion.div>

          <SplitText 
            text="USTAVERSE'25" 
            className="text-[clamp(48px,12vw,120px)] font-[var(--font-display)] text-white leading-none tracking-[-0.04em] mb-4 drop-shadow-lg" 
          />

          <motion.h2 
            className="text-xl md:text-3xl font-medium text-white/90 tracking-tight font-[var(--font-body)] max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.8 }}
          >
            Moyilarity and modernity
          </motion.h2>

          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.6, duration: 0.5 }}
          >
            <Link to="/leaderboards">
              <motion.button
                className="px-10 py-4 font-semibold text-[#FF4655] bg-white rounded-full shadow-[0_0_15px_rgba(255,70,85,0.4)]"
                whileHover={{ scale: 1.05, shadow: "0_0_25px_rgba(255,70,85,0.6)" }}
                animate={{ boxShadow: ["0 0 10px rgba(255,70,85,0.3)", "0 0 20px rgba(255,70,85,0.6)", "0 0 10px rgba(255,70,85,0.3)"] }}
                transition={{ boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
              >
                #ExploreTheFestival
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 z-10 text-white/50 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 1 }}
        >
          <span className="text-xs uppercase tracking-[0.2em] mb-2 font-semibold">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS STRIP SECTION */}
      <section className="bg-white border-b border-[var(--color-border)]">
        <div className="container mx-auto px-4 py-16 md:py-20 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { label: "Days of Festival", value: 3 },
              { label: "Programmes", value: stats.programmes },
              { label: "Competing Teams", value: stats.teams },
              { label: "Venues", value: 5 }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-text-heading)] mb-2 tracking-tight">
                  <CountUp to={stat.value} />
                </span>
                <span className="text-sm font-semibold text-[var(--color-text-body)] uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="w-8 h-1 bg-[#F6D24A] mt-4 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S HAPPENING SECTION */}
      <section className="bg-[var(--color-public-bg)] py-24 md:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-text-heading)] mb-4 tracking-[-0.02em]">
              What's Happening
            </h2>
            <p className="text-lg text-[var(--color-text-body)] max-w-2xl mx-auto">
              Dive into the heart of the festival. Check timings, track the live scoreboard, and relive the best moments.
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={cardContainerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Card 1 */}
            <motion.div variants={fadeUpVariant}>
              <Link to="/schedule" className="block h-full group">
                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 h-full transition-all duration-300 group-hover:border-[#FF4655] group-hover:shadow-[0_8px_30px_rgba(255,70,85,0.12)]">
                  <div className="w-14 h-14 bg-[#FF4655]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <CalendarDays className="text-[#FF4655]" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--color-text-heading)] mb-3">Event Schedule</h3>
                  <p className="text-[var(--color-text-body)] leading-relaxed">
                    Plan your days. View full timings and venues for all upcoming performances and competitions.
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={fadeUpVariant}>
              <Link to="/leaderboards" className="block h-full group">
                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 h-full transition-all duration-300 group-hover:border-[#F6D24A] group-hover:shadow-[0_8px_30px_rgba(246,210,74,0.15)]">
                  <div className="w-14 h-14 bg-[#F6D24A]/15 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Trophy className="text-yellow-600" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--color-text-heading)] mb-3">Live Scoreboard</h3>
                  <p className="text-[var(--color-text-body)] leading-relaxed">
                    Track the competition in real-time. See which teams are dominating the festival leaderboards.
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={fadeUpVariant}>
              <Link to="/gallery" className="block h-full group">
                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 h-full transition-all duration-300 group-hover:border-blue-500 group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)]">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ImageIcon className="text-blue-500" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--color-text-heading)] mb-3">Photo Gallery</h3>
                  <p className="text-[var(--color-text-body)] leading-relaxed">
                    Relive the magic. Browse high-quality photos from performances, awards, and candid moments.
                  </p>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
