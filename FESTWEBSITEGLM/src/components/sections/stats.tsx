'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { fetchJson, Stats } from '@/lib/festival'

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.max(1, Math.floor(to / 45))
    const id = setInterval(() => {
      start += step
      if (start >= to) {
        start = to
        clearInterval(id)
      }
      setVal(start)
    }, 36)
    return () => clearInterval(id)
  }, [inView, to])

  return (
    <span ref={ref} className="tabular-nums">
      {val}
      {suffix}
    </span>
  )
}

export function StatsStrip() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetchJson<Stats>('/api/stats')
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  const items = [
    { label: 'Days of Festival', value: 3 },
    { label: 'Programmes', value: stats?.programmes ?? 333 },
    { label: 'Participants', value: stats?.candidates ?? 290 },
    { label: 'Venues', value: stats?.venues ?? 7 },
    { label: 'Results Published', value: stats?.results ?? 1243 },
  ]

  return (
    <section className="relative bg-white border-b border-fest-line" aria-label="Festival statistics">
      <div className="fest-dots absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative container mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 text-center">
          {items.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <span className="font-fest-display text-4xl md:text-5xl text-fest-green leading-none">
                <CountUp to={s.value} />
              </span>
              <span className="mt-3 text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] text-fest-muted">
                {s.label}
              </span>
              <div className="mt-3 h-1 w-8 rounded-full bg-fest-gold" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
