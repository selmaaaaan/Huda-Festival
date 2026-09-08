'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, CalendarDays, MapPin } from 'lucide-react'
import { CountdownTimer } from './countdown-timer'

const TICKER_ITEMS = [
  'HUDA FESTIVAL 2026',
  'SHIA ARTS FEST',
  'MOYILARITY & MODERNITY',
  '333 PROGRAMMES',
  '4 TEAMS • 1 CROWN',
  'JAN 16–18',
]

export function Hero() {
  const prefersReduced = useReducedMotion()

  return (
    <section id="top" className="relative min-h-screen flex flex-col overflow-hidden bg-fest-green fest-noise" aria-label="Festival hero">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: 'url(/images/bg.jpg)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-fest-green-deep/60 via-transparent to-fest-green-deep" aria-hidden="true" />

      {/* Floating orbs */}
      {!prefersReduced && (
        <>
          <div className="animate-fest-float absolute top-1/4 left-[12%] w-72 h-72 md:w-96 md:h-96 bg-fest-red/25 rounded-full mix-blend-screen blur-[110px]" aria-hidden="true" />
          <div className="animate-fest-float absolute bottom-1/4 right-[12%] w-72 h-72 md:w-96 md:h-96 bg-fest-gold/20 rounded-full mix-blend-screen blur-[110px] [animation-delay:-4s]" aria-hidden="true" />
        </>
      )}

      {/* Top marquee ticker */}
      <div className="absolute top-0 inset-x-0 z-20 overflow-hidden bg-fest-green-deep/80 backdrop-blur-sm border-b border-white/10 py-2.5" aria-hidden="true">
        <div className="animate-fest-marquee flex whitespace-nowrap w-max">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex">
              {TICKER_ITEMS.map((t, i) => (
                <span key={`${dup}-${i}`} className="mx-5 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-fest-gold">
                  {t} <span className="text-fest-red mx-3">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-28 pb-16">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.3 }}
        >
          { }
          <img
            src="/images/logo.png"
            alt="Huda Festival circular stamp logo"
            className="w-32 sm:w-40 md:w-52 mb-6 drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-fest-gold text-xs sm:text-sm font-bold uppercase tracking-[0.4em] mb-4"
        >
          SHIA Arts Fest presents
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7 }}
          className="font-fest-display text-[clamp(3.2rem,13vw,9rem)] text-white leading-[0.95] drop-shadow-lg"
        >
          USTA<span className="text-fest-red">VERSE</span>
          <span className="text-fest-gold">'26</span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.7 }}
          className="mt-4 text-lg sm:text-2xl md:text-3xl font-medium text-white/90 tracking-tight max-w-2xl"
        >
          Moyilarity <span className="text-fest-red">&</span> Modernity
        </motion.h2>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="mt-8"
        >
          <CountdownTimer target="2026-01-16T09:00:00+05:30" />
        </motion.div>

        {/* Meta chips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.85, duration: 0.6 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white">
            <CalendarDays className="h-4 w-4 text-fest-gold" />
            Fri 16 – Sun 18 Jan 2026
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white">
            <MapPin className="h-4 w-4 text-fest-red" />
            7 venues across campus
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.05, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <a
            href="#leaderboard"
            className="rounded-full bg-white px-9 py-4 font-bold text-fest-red shadow-xl hover:scale-[1.04] active:scale-95 transition-transform animate-fest-glow"
          >
            #ExploreTheFestival
          </a>
          <a
            href="#schedule"
            className="rounded-full border-2 border-white/30 bg-white/5 backdrop-blur-sm px-9 py-4 font-bold text-white hover:bg-white/15 hover:border-white/50 transition-colors"
          >
            View Schedule
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        aria-label="Scroll to about section"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/50 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] mb-2 font-bold">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.a>
    </section>
  )
}

export function CountdownTimerDisplay() {
  return <CountdownTimer target="2026-01-16T09:00:00+05:30" />
}
