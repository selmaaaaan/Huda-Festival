'use client'

import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { Crown, Users } from 'lucide-react'
import { fetchJson, type LeaderboardResponse, type TeamStanding } from '@/lib/festival'
import { SectionHeading } from '@/components/festival/section-heading'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** Relative luminance of a hex color (0–255). */
function hexLuminance(hex: string): number {
  const m = hex.replace('#', '')
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Darkens a color that is too light to read on a white card (e.g. team gold). */
function inkFor(hex: string): string {
  if (hexLuminance(hex) <= 175) return hex
  const m = hex.replace('#', '')
  const f = 0.6
  const ch = (i: number) =>
    Math.round(parseInt(m.slice(i, i + 2), 16) * f)
      .toString(16)
      .padStart(2, '0')
  return `#${ch(0)}${ch(2)}${ch(4)}`
}

/** Animated count-up powered by a framer-motion motion value (reduced-motion aware). */
function MotionCountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduced = useReducedMotion()
  const value = useMotionValue(0)
  const display = useTransform(value, (v) => Math.round(v).toLocaleString('en-US'))

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      value.set(to)
      return
    }
    const controls = animate(value, to, { duration: 1.4, ease: 'easeOut' })
    return () => controls.stop()
  }, [inView, reduced, to, value])

  return (
    <motion.span ref={ref} className="tabular-nums">
      {display}
    </motion.span>
  )
}

/** Gentle drifting confetti dots for the leading team card. */
function Confetti({ color }: { color: string }) {
  const reduced = useReducedMotion()
  if (reduced) return null

  const palette = ['#F6D24A', color, '#FF4655', '#34D399']
  const dots = [
    { left: '9%', top: '26%', delay: 0 },
    { left: '24%', top: '12%', delay: 0.5 },
    { left: '46%', top: '18%', delay: 1 },
    { left: '64%', top: '9%', delay: 1.5 },
    { left: '84%', top: '24%', delay: 0.8 },
    { left: '92%', top: '52%', delay: 1.9 },
    { left: '14%', top: '66%', delay: 1.2 },
    { left: '70%', top: '72%', delay: 2.2 },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{ left: d.left, top: d.top, backgroundColor: palette[i % palette.length] }}
          animate={{ y: [-4, 18, -4], opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function TeamCard({ team, index }: { team: TeamStanding; index: number }) {
  const reduced = useReducedMotion()
  const letter = team.code.trim().slice(-1).toUpperCase()
  const isLeading = team.rank === 1
  const pointsColor = inkFor(team.color)

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.09, duration: 0.55, ease: 'easeOut' }}
      whileHover={reduced ? undefined : { y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-fest-line border-l-4 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
      style={{ borderLeftColor: team.color }}
      aria-label={`${team.name}: rank ${team.rank}, ${team.points} points, ${team.members} members, ${team.golds} gold medals`}
    >
      {/* Team color accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: team.color }} aria-hidden="true" />

      {/* Big letter watermark */}
      <span
        className="pointer-events-none absolute -right-4 -top-7 select-none font-fest-display text-[7.5rem] leading-none opacity-[0.09]"
        style={{ color: team.color }}
        aria-hidden="true"
      >
        {letter}
      </span>

      {isLeading && <Confetti color={team.color} />}

      <div className="relative flex h-full flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full border border-fest-line bg-fest-cream px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-fest-green">
            Rank #{team.rank}
          </span>
          {isLeading && (
            <motion.span
              initial={reduced ? false : { scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.4, ease: 'backOut' }}
              className="inline-flex items-center gap-1.5 rounded-full border border-fest-gold bg-fest-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-fest-ink"
            >
              <Crown className="h-3.5 w-3.5 text-fest-gold" strokeWidth={2.5} aria-hidden="true" />
              Leading
            </motion.span>
          )}
        </div>

        <div>
          <h3 className="font-fest-display text-2xl leading-tight text-fest-ink">{team.name}</h3>
          {team.motto && (
            <p className="mt-1.5 text-sm italic leading-relaxed text-fest-muted">“{team.motto}”</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-[13px] text-fest-muted">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-fest-green/70" aria-hidden="true" />
            <span className="font-bold tabular-nums text-fest-ink">{team.members}</span> members
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true">🥇</span>
            <span className="font-bold tabular-nums text-fest-ink">{team.golds}</span> golds
          </span>
        </div>

        <div className="mt-auto border-t border-fest-line pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-fest-muted">
            House points
          </p>
          <p className="mt-0.5 font-fest-display text-4xl leading-none" style={{ color: pointsColor }}>
            <MotionCountUp to={team.points} />
            <span className="ml-1.5 text-xs font-sans font-bold uppercase tracking-[0.2em] text-fest-muted">
              pts
            </span>
          </p>
        </div>
      </div>
    </motion.article>
  )
}

function TeamSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-fest-line bg-white p-6">
          <Skeleton className="h-1.5 w-full rounded-none" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="mt-6 h-10 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function Teams() {
  const [teams, setTeams] = useState<TeamStanding[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchJson<LeaderboardResponse>('/api/leaderboard')
      .then((d) => setTeams(d.teamLeaderboard))
      .catch(() => setError(true))
  }, [])

  return (
    <section id="teams" className="relative bg-white" aria-label="Festival teams">
      <div className="fest-dots absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative container mx-auto max-w-6xl px-4 py-16 md:py-24">
        <SectionHeading
          kicker="The Houses"
          title="Four Teams. One Crown."
          description="Team A, B, C and D — four houses of the Ustaverse battling across every stage, court and contest hall for the festival crown. Count the golds, chase the points, and see which house wears it."
        />

        {teams === null && !error && <TeamSkeletons />}

        {teams !== null && teams.length > 0 && (
          <div
            className={cn(
              'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4',
              teams.length <= 2 && 'lg:grid-cols-2'
            )}
          >
            {teams.map((team, i) => (
              <TeamCard key={team.id} team={team} index={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-2xl border border-fest-red/30 bg-fest-red/5 p-8 text-center">
            <p className="font-semibold text-fest-ink">The houses are still assembling…</p>
            <p className="mt-1 text-sm text-fest-muted">
              Team standings could not be loaded right now. Please refresh in a moment.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Teams
