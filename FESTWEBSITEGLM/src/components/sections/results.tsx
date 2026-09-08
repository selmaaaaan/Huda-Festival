'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, Search, Trophy } from 'lucide-react'
import {
  CATEGORY_SHORT,
  TYPE_ICONS,
  fetchJson,
  type ResultEntry,
  type ResultGroup,
} from '@/lib/festival'
import { SectionHeading } from '@/components/festival/section-heading'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12

type TypeFilter = 'All' | 'Stage' | 'Non-Stage' | 'Sports'
const TYPE_FILTERS: TypeFilter[] = ['All', 'Stage', 'Non-Stage', 'Sports']

/** Relative luminance of a hex color (0–255). */
function hexLuminance(hex: string): number {
  const m = hex.replace('#', '')
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Readable text color to place on top of a team color block. */
function contrastText(hex: string): string {
  return hexLuminance(hex) > 175 ? '#1A1A1A' : '#FFFFFF'
}

/** Darkens a color that is too light to read on a light background (e.g. team gold). */
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

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

function RankCell({ entry }: { entry: ResultEntry }) {
  if (entry.rank !== null && MEDALS[entry.rank]) {
    return (
      <span className="flex h-6 w-6 items-center justify-center text-lg" title={`${entry.rank} place`}>
        <span aria-hidden="true">{MEDALS[entry.rank]}</span>
        <span className="sr-only">{entry.rank === 1 ? 'First' : entry.rank === 2 ? 'Second' : 'Third'} place</span>
      </span>
    )
  }
  if (entry.grade) {
    const isA = entry.grade === 'A'
    const isB = entry.grade === 'B'
    return (
      <span
        className={cn(
          'inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[10px] font-extrabold uppercase',
          isA
            ? 'bg-fest-gold text-fest-ink'
            : isB
              ? 'bg-emerald-400 text-fest-ink'
              : 'bg-fest-sand text-fest-ink'
        )}
        title={`Grade ${entry.grade}`}
      >
        {entry.grade}
        <span className="sr-only"> grade</span>
      </span>
    )
  }
  return (
    <span
      className="flex h-6 items-center justify-center text-[9px] font-bold uppercase tracking-wide text-fest-muted"
      title="Certificate"
    >
      Cert.
      <span className="sr-only">Certificate</span>
    </span>
  )
}

function TeamChip({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]"
      style={{
        backgroundColor: `${color}1a`,
        borderColor: `${color}55`,
        color: inkFor(color),
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {name}
    </span>
  )
}

function WinnerRow({ entry }: { entry: ResultEntry }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg px-3 py-2.5 odd:bg-fest-cream/70">
      <span className="flex w-16 shrink-0 items-center justify-center">
        <RankCell entry={entry} />
      </span>
      <a
        href="#participants"
        className="min-w-[9rem] flex-1 truncate font-bold text-fest-ink underline-offset-4 transition-colors hover:text-fest-red hover:underline"
        title={`View ${entry.name} on the participants wall`}
      >
        {entry.name}
      </a>
      <TeamChip name={entry.team} color={entry.teamColor} />
      <span className="ml-auto w-14 shrink-0 text-right font-bold tabular-nums text-fest-green">
        {entry.points}
        <span className="ml-0.5 text-[9px] font-semibold uppercase text-fest-muted">pts</span>
      </span>
    </li>
  )
}

/** Simple 1st/2nd/3rd podium for the flagship programme card. */
function MiniPodium({ winners }: { winners: ResultEntry[] }) {
  const reduced = useReducedMotion()
  const ranked = winners.filter((w) => w.rank !== null).slice(0, 3)
  if (ranked.length < 2) return null

  const slots: { w: ResultEntry; h: string; medal: string; place: string }[] = []
  if (ranked[1]) slots.push({ w: ranked[1], h: 'h-14 sm:h-16', medal: '🥈', place: '2nd' })
  if (ranked[0]) slots.push({ w: ranked[0], h: 'h-20 sm:h-24', medal: '🥇', place: '1st' })
  if (ranked[2]) slots.push({ w: ranked[2], h: 'h-10 sm:h-12', medal: '🥉', place: '3rd' })

  return (
    <div
      className="mb-2 rounded-xl border border-fest-line bg-fest-cream/70 p-4"
      role="img"
      aria-label={`Podium: first place ${ranked[0]?.name ?? ''}, second place ${ranked[1]?.name ?? ''}${ranked[2] ? `, third place ${ranked[2].name}` : ''}`}
    >
      <div className="flex items-end justify-center gap-2 sm:gap-4">
        {slots.map((s) => (
          <div key={s.place} className="flex w-24 flex-col items-center gap-1 sm:w-28">
            <span className="text-lg leading-none" aria-hidden="true">
              {s.medal}
            </span>
            <a
              href="#participants"
              className="w-full truncate text-center text-[11px] font-bold text-fest-ink underline-offset-2 hover:text-fest-red"
              title={`View ${s.w.name}`}
            >
              {s.w.name}
            </a>
            <motion.div
              initial={reduced ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: reduced ? 0 : 0.5, ease: 'easeOut' }}
              className={cn('flex w-full items-start justify-center rounded-t-lg pt-1.5', s.h)}
              style={{
                transformOrigin: 'bottom',
                background: `linear-gradient(180deg, ${s.w.teamColor}, ${s.w.teamColor}b3)`,
              }}
            >
              <span
                className="text-[10px] font-extrabold uppercase tracking-wide"
                style={{ color: contrastText(s.w.teamColor) }}
              >
                {s.place} · {s.w.points}p
              </span>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ResultCard({ group, index }: { group: ResultGroup; index: number }) {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  const { programme } = group
  const contentId = `winners-${programme.id}`

  // Ranked podium finishes first (1→3), then graded/certificate rows by points.
  const sortedWinners = useMemo(
    () =>
      [...group.winners].sort((a, b) => {
        const ra = a.rank ?? 99
        const rb = b.rank ?? 99
        if (ra !== rb) return ra - rb
        return b.points - a.points
      }),
    [group.winners]
  )

  const meta = [
    CATEGORY_SHORT[programme.category] ?? programme.category,
    programme.venue,
    programme.day != null ? `Day ${programme.day}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const winnerLabel =
    sortedWinners.length === 1 ? '1 winner' : `${sortedWinners.length} winners`

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.45, ease: 'easeOut' }}
    >
      <div
        className={cn(
          'overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors',
          open ? 'border-fest-gold/60' : 'border-fest-line hover:border-fest-gold/50'
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex min-h-[44px] w-full items-center gap-3 p-4 text-left"
        >
          <span className="shrink-0 rounded-md bg-fest-green px-2 py-1 font-mono text-[10px] font-bold text-fest-gold">
            {programme.code}
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 font-bold text-fest-ink">
              <span aria-hidden="true">{TYPE_ICONS[programme.type] ?? '🏁'}</span>
              <span className="truncate">{programme.name}</span>
            </span>
            {meta && <span className="mt-0.5 block truncate text-xs text-fest-muted">{meta}</span>}
          </span>

          <span className="hidden shrink-0 rounded-full bg-fest-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-fest-green sm:inline-flex">
            {winnerLabel}
          </span>

          <ChevronDown
            className={cn(
              'h-5 w-5 shrink-0 text-fest-muted motion-safe:transition-transform motion-safe:duration-300',
              open && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={contentId}
              role="region"
              aria-label={`Winners of ${programme.name}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.32, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="border-t border-fest-line bg-fest-cream/50 p-2 sm:p-3">
                {index === 0 && <MiniPodium winners={sortedWinners} />}
                <ul className="max-h-96 overflow-y-auto fest-scroll">
                  {sortedWinners.map((w, i) => (
                    <WinnerRow key={`${programme.id}-${w.admissionNo}-${w.rank ?? 'g'}-${i}`} entry={w} />
                  ))}
                </ul>
                <p className="px-3 pb-1 pt-2 text-[10px] text-fest-muted">
                  Tap a champion to find them on the participants wall.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[76px] w-full rounded-2xl" />
      ))}
    </div>
  )
}

export function Results() {
  const [groups, setGroups] = useState<ResultGroup[] | null>(null)
  const [error, setError] = useState(false)
  const [type, setType] = useState<TypeFilter>('All')
  const [search, setSearch] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    fetchJson<ResultGroup[]>('/api/results?limit=300')
      .then((d) => setGroups(d))
      .catch(() => setError(true))
  }, [])

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search.trim().toLowerCase()), 300)
    return () => clearTimeout(t)
  }, [search])

  const filtered = useMemo(() => {
    if (!groups) return []
    return groups.filter((g) => {
      if (type !== 'All' && g.programme.type !== type) return false
      if (debouncedQ && !g.programme.name.toLowerCase().includes(debouncedQ)) return false
      return true
    })
  }, [groups, type, debouncedQ])

  const visible = filtered.slice(0, visibleCount)
  const remaining = filtered.length - visible.length

  return (
    <section id="results" className="relative bg-fest-cream" aria-label="Results and winners">
      <div className="relative container mx-auto max-w-6xl px-4 py-16 md:py-24">
        <SectionHeading
          kicker="Hall of Fame"
          title="Results & Winners"
          description="Every programme, every podium. Published results from the stages, courts and contest halls of the Ustaverse — expand a programme to meet its champions."
        />

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter results by programme type"
          >
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => {
                  setType(t)
                  setVisibleCount(PAGE_SIZE)
                }}
                className={cn(
                  'inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors',
                  type === t
                    ? 'bg-fest-green text-white shadow-sm'
                    : 'border border-fest-line bg-white text-fest-muted hover:border-fest-green/40 hover:text-fest-green'
                )}
              >
                {t !== 'All' && <span aria-hidden="true">{TYPE_ICONS[t]}</span>}
                {t === 'All' ? 'All Types' : t}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fest-muted"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setVisibleCount(PAGE_SIZE)
              }}
              placeholder="Search programmes…"
              aria-label="Search results by programme name"
              className="h-11 rounded-full border-fest-line bg-white pl-9"
            />
          </div>
        </div>

        {groups === null && !error && <ResultsSkeleton />}

        {error && groups === null && (
          <div className="mx-auto max-w-md rounded-2xl border border-fest-red/30 bg-fest-red/5 p-8 text-center">
            <p className="font-semibold text-fest-ink">Results are still being tallied…</p>
            <p className="mt-1 text-sm text-fest-muted">
              The hall of fame could not be loaded right now. Please refresh in a moment.
            </p>
          </div>
        )}

        {groups !== null && (
          <>
            <p className="mb-4 text-sm text-fest-muted" aria-live="polite">
              <span className="font-bold tabular-nums text-fest-green">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'programme' : 'programmes'} with published winners
            </p>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-fest-line bg-white/70 px-6 py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fest-cream">
                  <Trophy className="h-6 w-6 text-fest-gold" aria-hidden="true" />
                </span>
                <p className="mt-4 font-bold text-fest-ink">No results match your search</p>
                <p className="mt-1 text-sm text-fest-muted">
                  Try a different programme name or switch the type filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setType('All')
                    setVisibleCount(PAGE_SIZE)
                  }}
                  className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-fest-green px-6 text-sm font-bold text-white transition-colors hover:bg-fest-green/90"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {visible.map((group, i) => (
                  <ResultCard key={group.programme.id} group={group} index={i} />
                ))}
              </div>
            )}

            {remaining > 0 && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-fest-green bg-white px-8 text-sm font-bold text-fest-green transition-colors hover:bg-fest-green hover:text-white"
                >
                  Load More
                  <span className="rounded-full bg-fest-cream px-2 py-0.5 text-[11px] tabular-nums">
                    {remaining}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default Results
