'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu, X, Ticket } from 'lucide-react'

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#programmes', label: 'Programmes' },
  { href: '#schedule', label: 'Schedule' },
  { href: '#teams', label: 'Teams' },
  { href: '#leaderboard', label: 'Scoreboard' },
  { href: '#results', label: 'Results' },
  { href: '#participants', label: 'Participants' },
  { href: '#gallery', label: 'Gallery' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 40))

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1))
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(`#${e.target.id}`)
        }
      },
      { rootMargin: '-30% 0px -55% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-fest-green-deep/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      {/* thin gold top rule */}
      <div className="h-0.5 w-full bg-gradient-to-r from-fest-gold/0 via-fest-gold/60 to-fest-gold/0" />
      <nav className="container mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-16" aria-label="Main navigation">
        <a href="#top" className="flex items-center gap-3 group" aria-label="Huda Festival home">
          { }
          <img src="/images/logo.png" alt="Huda Festival stamp logo" className="h-10 w-10 object-contain drop-shadow-md group-hover:rotate-6 transition-transform" />
          <span className="font-fest-display text-white text-xl tracking-wide hidden sm:block">
            HUDA<span className="text-fest-red">FEST</span>
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`relative px-3 py-2 text-[13px] font-semibold uppercase tracking-wider rounded-full transition-colors ${
                  active === l.href ? 'text-fest-gold' : 'text-white/80 hover:text-white'
                }`}
              >
                {l.label}
                {active === l.href && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/10 border border-white/15" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#leaderboard"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-fest-red px-4 py-2 text-[13px] font-bold uppercase tracking-wider text-white animate-fest-glow hover:bg-[#e03a47] transition-colors"
          >
            <Ticket className="h-4 w-4" />
            Live Scores
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-xl bg-white/10 border border-white/15 text-white"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-fest-green-deep/95 backdrop-blur-md border-b border-white/10"
          >
            <ul className="px-4 py-4 space-y-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors ${
                      active === l.href ? 'bg-white/10 text-fest-gold' : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
