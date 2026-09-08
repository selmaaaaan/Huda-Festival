'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Crown, RefreshCw } from 'lucide-react'
import {
  CATEGORY_SHORT,
  fetchJson,
  type LeaderboardResponse,
  type TeamStanding,
  type TopIndividual,
} from '@/lib/festival'
import { SectionHeading } from '@/components/festival/section-heading'
import { Skeleton } from '@/components/ui/skeleton'

function medalFor(rank: number): string | null {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return null
}

function StandingRow({
  team,
  index,
  maxPoints,
}: {
  team: TeamStanding
  index: number
  maxPoints: number
}) {
  const reduced = useReducedMotion()
  const isTop = team.rank === 1
  const pct = Math.max(5, Math.round((team.points / maxPoints) * 100))

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: 'easeOut' }}
      className={
        isTop
          ? 'rounded-xl border border-fest-gold/70 bg-white/[0.07] p-4 ring-2 ring-fest-gold/50'
          : 'rounded-xl border border-white/10 bg-white/[0.03] p-4'
      }
      aria-label={`Rank ${team.rank}: ${team.name}, ${team.points} points, ${team.golds} golds, ${team.members} members`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="w-7 shrink-0 text-center font-fest-display text-2xl leading-none text-white/35 tabular-nums">
            {team.rank}
          </span>
          <span
            className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white/20"
            style={{ backgroundColor: team.color }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-bold text-white">
              <span className="truncate">{team.name}</span>
              {isTop && <Crown className="h-4 w-4 shrink-0 text-fest-gold" aria-hidden="true" />}
            </p>
            <p className="mt-0.5 text-[11px] text-white/50">
              <span aria-hidden="true">🥇</span> {team.golds} golds · {team.members} members
            </p>
          </div>
        </div>
        <p className="shrink-0 font-fest-display text-xl leading-none tabular-nums" style={{ color: team.color }}>
          {team.points.toLocaleString('en-US')}
          <span className="ml-1 font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
            pts
          </span>
        </p>
      </div>

      <div
        className="mt-3 h-3 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={team.points}
        aria-valuemin={0}
        aria-valuemax={maxPoints}
        aria-label={`${team.name} points`}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: 0.15 + index * 0.08, duration: reduced ? 0 : 0.9, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${team.color}59, ${team.color})` }}
        />
      </div>
    </motion.li>
  )
}

function ChampionRow({ entry, index }: { entry: TopIndividual; index: number }) {
  const reduced = useReducedMotion()
  const medal = medalFor(entry.rank)

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.35, ease: 'easeOut' }}
      className="flex items-center gap-3 py-3"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold tabular-nums text-white"
        aria-label={`Rank ${entry.rank}`}
      >
        {medal ? (
          <>
            <span aria-hidden="true">{medal}</span>
            <span className="sr-only">{entry.rank}</span>
          </>
        ) : (
          entry.rank
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{entry.name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/50">
          <span className="tabular-nums">#{entry.admissionNo}</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-semibold text-white/70">
            {(CATEGORY_SHORT[entry.category] ?? entry.category) + ` · Cl ${entry.class}`}
          </span>
        </p>
      </div>

      <span
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{
          backgroundColor: `${entry.team.color}26`,
          borderColor: `${entry.team.color}66`,
          color: entry.team.color,
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: entry.team.color }}
          aria-hidden="true"
        />
        {entry.team.name}
      </span>

      <span className="shrink-0 text-right font-bold tabular-nums text-fest-gold">
        {entry.points}
        <span className="ml-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">pts</span>
      </span>
    </motion.li>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2" aria-hidden="true">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <Skeleton className="mb-5 h-7 w-44 bg-white/10" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <Skeleton className="mb-5 h-7 w-48 bg-white/10" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  // Fetch on mount and on every refresh; state updates happen in async
  // callbacks only, so no cascading synchronous renders.
  useEffect(() => {
    let cancelled = false
    fetchJson<LeaderboardResponse>('/api/leaderboard')
      .then((d) => {
        if (cancelled) return
        setData(d)
        setError(false)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const refresh = useCallback(() => {
    setLoading(true)
    setReloadToken((t) => t + 1)
  }, [])

  const maxPoints = useMemo(
    () => Math.max(1, ...(data?.teamLeaderboard ?? []).map((t) => t.points)),
    [data]
  )

  const teams = data?.teamLeaderboard ?? []
  const individuals = data?.topIndividuals ?? []

  return (
    <section
      id="leaderboard"
      className="relative bg-fest-green-deep text-white"
      aria-label="Live festival leaderboard"
    >
      {/* Gold ticker strip */}
      {teams.length > 0 && (
        <div
          className="relative overflow-hidden border-y border-fest-gold/25 bg-fest-green/60 py-2.5"
          aria-hidden="true"
        >
          <div className="animate-fest-marquee flex w-max">
            {/* Two identical halves (each repeating the teams) for a seamless loop */}
            {[0, 1].map((half) => (
              <div key={half} className="flex shrink-0 items-center">
                {[...teams, ...teams, ...teams, ...teams].map((t, idx) => (
                  <span
                    key={`${half}-${idx}`}
                    className="flex items-center whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.22em]"
                  >
                    <span className="text-fest-gold">{t.name}</span>
                    <span className="ml-2 tabular-nums text-white/85">
                      {t.points.toLocaleString('en-US')} pts
                    </span>
                    <span className="mx-6 text-fest-red" aria-hidden="true">
                      ✦
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative container mx-auto max-w-6xl px-4 py-16 md:py-24">
        {/* Pulsing LIVE badge */}
        <div className="mb-5 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fest-red/50 bg-fest-red/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-fest-red">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-fest-red opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-fest-red" />
            </span>
            Live
          </span>
        </div>

        <SectionHeading
          dark
          kicker="Live"
          title="The Ustaverse Scoreboard"
          description="Points flow in as judges announce results across every venue. Team standings and the top individual champions, straight from the festival floor."
        />

        {data === null && !error && <LeaderboardSkeleton />}

        {error && data === null && (
          <div className="mx-auto max-w-md rounded-2xl border border-fest-red/40 bg-fest-red/10 p-8 text-center">
            <p className="font-semibold text-fest-gold">The scoreboard is briefly offline.</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-fest-red px-6 text-sm font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-fest-red/85"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </button>
          </div>
        )}

        {data !== null && (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            {/* Team standings */}
            <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="font-fest-display text-xl text-white">Team Standings</h3>
                <button
                  type="button"
                  onClick={refresh}
                  disabled={loading}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-xs font-bold uppercase tracking-[0.15em] text-white/80 transition-colors hover:border-fest-gold/50 hover:text-fest-gold disabled:opacity-60"
                  aria-label="Refresh leaderboard"
                >
                  <RefreshCw
                    className={loading ? 'h-4 w-4 motion-safe:animate-spin' : 'h-4 w-4'}
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">{loading ? 'Syncing…' : 'Refresh'}</span>
                </button>
              </div>

              <ul className="flex flex-col gap-3.5">
                {teams.map((team, i) => (
                  <StandingRow key={team.id} team={team} index={i} maxPoints={maxPoints} />
                ))}
              </ul>

              <p className="mt-5 text-[11px] leading-relaxed text-white/40">
                Bars are scaled against the leading house. Golds count first-place finishes across
                all published programmes.
              </p>
            </div>

            {/* Top 10 individuals */}
            <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-fest-display text-xl text-white">Top 10 Champions</h3>
                <span className="rounded-full border border-fest-gold/40 bg-fest-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-fest-gold">
                  Individuals
                </span>
              </div>

              <ol className="fest-scroll max-h-96 divide-y divide-white/10 overflow-y-auto pr-2">
                {individuals.map((entry, i) => (
                  <ChampionRow key={entry.id} entry={entry} index={i} />
                ))}
              </ol>

              <p className="mt-4 text-[11px] leading-relaxed text-white/40">
                Ranked by total individual points across all programmes — the top ten performers of
                the Ustaverse.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Leaderboard
