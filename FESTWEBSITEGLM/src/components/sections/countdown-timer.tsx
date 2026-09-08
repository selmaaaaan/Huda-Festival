'use client'

import { useEffect, useState } from 'react'

function diff(target: string) {
  const ms = new Date(target).getTime() - Date.now()
  const clamped = Math.max(0, ms)
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped / 3_600_000) % 24),
    minutes: Math.floor((clamped / 60_000) % 60),
    seconds: Math.floor((clamped / 1_000) % 60),
    live: ms <= 0,
  }
}

export function CountdownTimer({ target }: { target: string }) {
  const [t, setT] = useState(() => diff(target))

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (t.live) {
    return (
      <div className="inline-flex items-center gap-3 rounded-full border border-fest-gold/40 bg-fest-gold/10 backdrop-blur-sm px-6 py-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fest-red opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-fest-red" />
        </span>
        <span className="text-fest-gold font-bold uppercase tracking-[0.25em] text-sm">The fest is live!</span>
      </div>
    )
  }

  const cells = [
    { v: t.days, l: 'Days' },
    { v: t.hours, l: 'Hours' },
    { v: t.minutes, l: 'Minutes' },
    { v: t.seconds, l: 'Seconds' },
  ]

  return (
    <div
      className="inline-flex items-stretch rounded-2xl border border-white/15 bg-fest-green-deep/60 backdrop-blur-md shadow-2xl overflow-hidden"
      role="timer"
      aria-label="Countdown to festival"
    >
      {cells.map((c, i) => (
        <div key={c.l} className={`flex flex-col items-center px-4 sm:px-6 py-3 ${i > 0 ? 'border-l border-white/10' : ''}`}>
          <span className="font-fest-display text-2xl sm:text-4xl text-white tabular-nums leading-none">
            {String(c.v).padStart(2, '0')}
          </span>
          <span className="mt-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-fest-gold/80">{c.l}</span>
        </div>
      ))}
    </div>
  )
}
