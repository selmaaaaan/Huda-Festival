'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CalendarDays,
  ChevronRight,
  Clock,
  MapPin,
  RotateCcw,
  Search,
  SearchX,
  Trophy,
  Users,
  X,
} from 'lucide-react'

import { SectionHeading } from '@/components/festival/section-heading'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CATEGORY_LABELS,
  CATEGORY_SHORT,
  fetchJson,
  type Programme,
  type ProgrammeType,
} from '@/lib/festival'

/* ── constants ─────────────────────────────────────────── */

const PAGE_SIZE = 24

type TypeFilter = ProgrammeType | 'All'
type DayFilter = 1 | 2 | 3 | 'All'

const TYPE_FILTERS: { value: TypeFilter; label: string; emoji: string }[] = [
  { value: 'All', label: 'All', emoji: '✨' },
  { value: 'Stage', label: 'Stage', emoji: '🎭' },
  { value: 'Non-Stage', label: 'Non-Stage', emoji: '✍️' },
  { value: 'Sports', label: 'Sports', emoji: '🏃' },
]

const CATEGORY_KEYS = ['BIDAYAH', 'ULA', 'THANIYAH', 'THANAWIYYAH', 'ALIYAH', 'KULLIYYAH'] as const
const DAY_FILTERS: DayFilter[] = ['All', 1, 2, 3]

/** Colored top edge per programme type (Stage=red · Non-Stage=green · Sports=gold). */
const TYPE_TOP_BORDER: Record<ProgrammeType, string> = {
  Stage: 'border-t-fest-red',
  'Non-Stage': 'border-t-fest-green',
  Sports: 'border-t-fest-gold',
}

const TYPE_PILL: Record<ProgrammeType, string> = {
  Stage: 'bg-fest-red/10 text-fest-red',
  'Non-Stage': 'bg-fest-green/10 text-fest-green',
  Sports: 'bg-fest-gold/25 text-fest-green-deep',
}

const TYPE_CHIP_ACTIVE: Record<ProgrammeType, string> = {
  Stage: 'border-fest-red bg-fest-red text-white',
  'Non-Stage': 'border-fest-green bg-fest-green text-white',
  Sports: 'border-fest-gold bg-fest-gold text-fest-green-deep',
}

const TYPE_STRIPE: Record<ProgrammeType, string> = {
  Stage: 'bg-fest-red',
  'Non-Stage': 'bg-fest-green',
  Sports: 'bg-fest-gold',
}

/* ── helpers ───────────────────────────────────────────── */

function chipClass(active: boolean): string {
  return active
    ? 'border-fest-green bg-fest-green text-white shadow-sm'
    : 'border-fest-line bg-white text-fest-ink hover:border-fest-green/40 hover:bg-fest-sand'
}

function scheduleLine(p: Programme): string {
  const parts: string[] = []
  if (p.day) parts.push(`Day ${p.day}`)
  if (p.startTime && p.endTime) parts.push(`${p.startTime}–${p.endTime}`)
  else if (p.startTime) parts.push(p.startTime)
  if (p.venue) parts.push(p.venue)
  return parts.length ? parts.join(' · ') : 'Schedule to be announced'
}

/* ── component ─────────────────────────────────────────── */

export function Programmes() {
  const [data, setData] = useState<Programme[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilter>('All')
  const [category, setCategory] = useState<string>('All')
  const [day, setDay] = useState<DayFilter>('All')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [selected, setSelected] = useState<Programme | null>(null)

  const reduced = useReducedMotion()

  /* fetch once on mount — state is only updated from async callbacks */
  useEffect(() => {
    let alive = true
    fetchJson<Programme[]>('/api/programmes')
      .then((d) => {
        if (!alive) return
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        if (!alive) return
        setError('Could not reach the programmes desk. Please try again.')
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const retry = () => {
    setLoading(true)
    setError(null)
    fetchJson<Programme[]>('/api/programmes')
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not reach the programmes desk. Please try again.')
        setLoading(false)
      })
  }

  /* debounced search (250ms) */
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 250)
    return () => clearTimeout(t)
  }, [searchInput])

  /* filter setters — every change resets pagination */
  const onSearchInput = (v: string) => {
    setSearchInput(v)
    setVisible(PAGE_SIZE)
  }
  const onType = (t: TypeFilter) => {
    setType(t)
    setVisible(PAGE_SIZE)
  }
  const onCategory = (c: string) => {
    setCategory(c)
    setVisible(PAGE_SIZE)
  }
  const onDay = (d: DayFilter) => {
    setDay(d)
    setVisible(PAGE_SIZE)
  }

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search)) return false
      if (type !== 'All' && p.type !== type) return false
      if (category !== 'All' && p.category !== category) return false
      if (day !== 'All' && p.day !== day) return false
      return true
    })
  }, [data, search, type, category, day])

  const shown = useMemo(() => filtered.slice(0, visible), [filtered, visible])

  const hasFilters = searchInput !== '' || type !== 'All' || category !== 'All' || day !== 'All'

  const resetFilters = () => {
    setSearchInput('')
    setType('All')
    setCategory('All')
    setDay('All')
    setVisible(PAGE_SIZE)
  }

  return (
    <section id="programmes" className="relative bg-fest-cream py-20 md:py-28" aria-label="Programmes">
      <div className="fest-dots absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading
          kicker="Explore"
          title="333 Programmes. One Universe."
          description="Browse every competition of the festival — stage performances, off-stage contests and sports meets. Filter by category, day or type and build your own festival plan."
        />

        {/* ── sticky filter bar ── */}
        <div className="sticky top-[66px] z-30 -mx-4 mb-8 border-y border-fest-line bg-fest-cream/95 py-3 shadow-sm shadow-fest-green/5 backdrop-blur-md sm:-mx-6 sm:px-6">
          <div className="space-y-3 px-4 sm:px-0">
            {/* search + day chips */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative w-full lg:max-w-sm">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fest-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => onSearchInput(e.target.value)}
                  placeholder="Search programmes by name…"
                  aria-label="Search programmes by name"
                  className="h-11 w-full rounded-xl border border-fest-line bg-white pl-10 pr-11 text-sm text-fest-ink shadow-xs outline-none transition-colors placeholder:text-fest-muted focus:border-fest-gold focus:ring-[3px] focus:ring-fest-gold/40 [&::-webkit-search-cancel-button]:hidden"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => onSearchInput('')}
                    aria-label="Clear search"
                    className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-fest-muted transition-colors hover:bg-fest-sand hover:text-fest-ink"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* day chips */}
              <div className="flex flex-wrap items-center gap-2 lg:ml-auto" role="group" aria-label="Filter by day">
                {DAY_FILTERS.map((d) => {
                  const active = day === d
                  return (
                    <button
                      key={String(d)}
                      type="button"
                      onClick={() => onDay(d)}
                      aria-pressed={active}
                      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-all ${chipClass(active)}`}
                    >
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {d === 'All' ? 'All Days' : `Day ${d}`}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* type chips */}
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by programme type">
              {TYPE_FILTERS.map((f) => {
                const active = type === f.value
                const cls =
                  active && f.value !== 'All'
                    ? TYPE_CHIP_ACTIVE[f.value as ProgrammeType]
                    : chipClass(active)
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => onType(f.value)}
                    aria-pressed={active}
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-all ${cls}`}
                  >
                    <span aria-hidden="true">{f.emoji}</span>
                    {f.label}
                  </button>
                )
              })}
            </div>

            {/* category chips */}
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by school category">
              <button
                type="button"
                onClick={() => onCategory('All')}
                aria-pressed={category === 'All'}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-all ${chipClass(category === 'All')}`}
              >
                All Categories
              </button>
              {CATEGORY_KEYS.map((c) => {
                const active = category === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onCategory(c)}
                    aria-pressed={active}
                    className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-all ${chipClass(active)}`}
                  >
                    {CATEGORY_SHORT[c] ?? c}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── result counter ── */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-fest-muted" aria-live="polite">
            {loading ? (
              'Loading programmes…'
            ) : (
              <>
                Showing <span className="font-bold text-fest-ink tabular-nums">{shown.length}</span> of{' '}
                <span className="font-bold text-fest-ink tabular-nums">{filtered.length}</span> programmes
              </>
            )}
          </p>
          {hasFilters && !loading && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-fest-red transition-colors hover:bg-fest-red/5"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Clear all filters
            </button>
          )}
        </div>

        {/* ── grid ── */}
        {loading ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <li key={i}>
                <div className="space-y-3 rounded-2xl border border-fest-line bg-white p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-16 rounded-md" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-11/12" />
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="rounded-2xl border border-fest-red/30 bg-fest-red/5 px-6 py-14 text-center">
            <p className="font-fest-display text-xl text-fest-red">Couldn&apos;t load the programme list</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-fest-muted">{error}</p>
            <Button onClick={retry} variant="outline" className="mt-5 min-h-11 rounded-full px-6">
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : shown.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-4 rounded-2xl border border-dashed border-fest-line bg-white/70 px-6 py-16 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-fest-sand text-fest-green">
              <SearchX className="size-7" aria-hidden="true" />
            </span>
            <p className="font-fest-display text-2xl text-fest-ink">No programmes found</p>
            <p className="max-w-sm text-sm leading-relaxed text-fest-muted">
              We searched every corner of the festival universe but found nothing matching your filters. Try
              different keywords or clear the filters.
            </p>
            <Button onClick={resetFilters} variant="outline" className="min-h-11 rounded-full px-6">
              <RotateCcw className="size-4" aria-hidden="true" />
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((p, i) => (
                <motion.li
                  key={p.id}
                  className="h-full"
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: (i % PAGE_SIZE) * 0.035, ease: 'easeOut' }}
                >
                  <article
                    className={`group flex h-full flex-col rounded-2xl border border-fest-line border-t-4 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-fest-green/10 ${TYPE_TOP_BORDER[p.type]}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(p)}
                      aria-label={`View details of ${p.name} (${p.code})`}
                      className="flex grow flex-col gap-2.5 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md bg-fest-sand px-2 py-1 font-mono text-[11px] font-bold tracking-wide text-fest-green">
                          {p.code}
                        </span>
                        {p.isResultPublished && p.resultCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-fest-gold/25 px-2 py-1 text-[11px] font-bold text-fest-green-deep">
                            <Trophy className="size-3" aria-hidden="true" />
                            <span className="tabular-nums">{p.resultCount}</span> results
                          </span>
                        ) : p.resultCount > 0 ? (
                          <span className="inline-flex items-center rounded-full border border-fest-line px-2 py-1 text-[11px] font-bold text-fest-muted">
                            Results soon
                          </span>
                        ) : null}
                      </div>

                      <span className="line-clamp-2 font-semibold leading-snug text-fest-ink transition-colors group-hover:text-fest-green">
                        {p.name}
                      </span>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${TYPE_PILL[p.type]}`}
                        >
                          {p.type}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-fest-line px-2.5 py-1 text-[11px] font-semibold text-fest-muted">
                          {CATEGORY_SHORT[p.category] ?? p.category}
                        </span>
                      </div>

                      <div className="mt-auto space-y-1.5 pt-1 text-xs text-fest-muted">
                        <p className="flex items-center gap-1.5">
                          <Users className="size-3.5 shrink-0" aria-hidden="true" />
                          <span>
                            {p.format} · {p.quota}/team
                            {p.groupSize > 1 ? ` · groups of ${p.groupSize}` : ''}
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                          <span className="line-clamp-1">{scheduleLine(p)}</span>
                        </p>
                      </div>

                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-fest-red">
                        View details
                        <ChevronRight
                          className="size-3.5 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  </article>
                </motion.li>
              ))}
            </ul>

            {/* ── load more ── */}
            {shown.length < filtered.length && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="min-h-11 rounded-full border-fest-green/25 px-8 font-bold transition-colors hover:bg-fest-green hover:text-white"
                >
                  Load More
                  <span className="tabular-nums opacity-70">
                    ({filtered.length - shown.length} more)
                  </span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── programme detail dialog ── */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto rounded-2xl border-fest-line bg-fest-cream p-0 sm:max-w-lg">
            <div className={`h-1.5 w-full rounded-t-xl ${TYPE_STRIPE[selected.type]}`} aria-hidden="true" />
            <div className="space-y-5 p-6">
              <DialogHeader className="space-y-3 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-fest-sand px-2 py-1 font-mono text-xs font-bold tracking-wide text-fest-green">
                    {selected.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${TYPE_PILL[selected.type]}`}
                  >
                    {selected.type}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-fest-line bg-white px-2.5 py-1 text-xs font-semibold text-fest-muted">
                    {CATEGORY_SHORT[selected.category] ?? selected.category}
                  </span>
                </div>
                <DialogTitle className="font-fest-display text-2xl leading-tight text-fest-ink">
                  {selected.name}
                </DialogTitle>
                <DialogDescription className="text-left leading-relaxed text-fest-muted">
                  {selected.description ??
                    `${selected.type} competition for the ${CATEGORY_LABELS[selected.category] ?? selected.category} category.`}
                </DialogDescription>
              </DialogHeader>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-fest-line bg-white p-3">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-fest-muted">Category</dt>
                  <dd className="mt-1 font-semibold text-fest-ink">
                    {CATEGORY_LABELS[selected.category] ?? selected.category}
                  </dd>
                </div>
                <div className="rounded-xl border border-fest-line bg-white p-3">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-fest-muted">Format</dt>
                  <dd className="mt-1 font-semibold text-fest-ink">{selected.format}</dd>
                </div>
                <div className="rounded-xl border border-fest-line bg-white p-3">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-fest-muted">Quota</dt>
                  <dd className="mt-1 font-semibold text-fest-ink">
                    <span className="tabular-nums">{selected.quota}</span> per team
                  </dd>
                </div>
                <div className="rounded-xl border border-fest-line bg-white p-3">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-fest-muted">Group size</dt>
                  <dd className="mt-1 font-semibold text-fest-ink tabular-nums">{selected.groupSize}</dd>
                </div>
                <div className="rounded-xl border border-fest-line bg-white p-3">
                  <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-fest-muted">
                    <CalendarDays className="size-3" aria-hidden="true" /> Day
                  </dt>
                  <dd className="mt-1 font-semibold text-fest-ink">
                    {selected.day ? `Day ${selected.day}` : 'To be announced'}
                  </dd>
                </div>
                <div className="rounded-xl border border-fest-line bg-white p-3">
                  <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-fest-muted">
                    <Clock className="size-3" aria-hidden="true" /> Time
                  </dt>
                  <dd className="mt-1 font-semibold text-fest-ink tabular-nums">
                    {selected.startTime && selected.endTime
                      ? `${selected.startTime}–${selected.endTime}`
                      : selected.startTime ?? 'TBA'}
                  </dd>
                </div>
                <div className="col-span-2 rounded-xl border border-fest-line bg-white p-3">
                  <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-fest-muted">
                    <MapPin className="size-3" aria-hidden="true" /> Venue
                  </dt>
                  <dd className="mt-1 font-semibold text-fest-ink">{selected.venue ?? 'To be announced'}</dd>
                </div>
              </dl>

              <p className="rounded-xl bg-fest-sand p-3 text-xs leading-relaxed text-fest-green">
                <Users className="mr-1 inline size-3.5 -translate-y-px" aria-hidden="true" />
                Each of the four teams may enter{' '}
                <strong className="tabular-nums">{selected.quota}</strong> participant
                {selected.quota > 1 ? 's' : ''}
                {selected.groupSize > 1 ? (
                  <>
                    {' '}
                    — group events admit up to{' '}
                    <strong className="tabular-nums">{selected.groupSize}</strong> members per entry
                  </>
                ) : (
                  ''
                )}
                , for up to <strong className="tabular-nums">{selected.maxParticipants}</strong> participants in
                total.
              </p>

              <DialogFooter>
                <Button asChild className="min-h-11 rounded-full bg-fest-red px-6 font-bold hover:bg-[#e03a47]">
                  <a href="#results" onClick={() => setSelected(null)}>
                    <Trophy className="size-4" aria-hidden="true" />
                    View Results
                  </a>
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  )
}

export default Programmes
