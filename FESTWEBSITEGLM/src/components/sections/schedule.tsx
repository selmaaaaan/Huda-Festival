'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CalendarX2,
  Dumbbell,
  ListFilter,
  MapPin,
  Mic,
  Monitor,
  Music,
  Palette,
  RotateCcw,
  Sun,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { SectionHeading } from '@/components/festival/section-heading'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CATEGORY_SHORT,
  TYPE_ICONS,
  fetchJson,
  type ProgrammeType,
  type ScheduleItem,
  type ScheduleResponse,
} from '@/lib/festival'

/* ── constants ─────────────────────────────────────────── */

const VENUE_ICONS: Record<string, LucideIcon> = {
  'Main Stage': Mic,
  'Mini Auditorium': Music,
  'Open Air Theatre': Sun,
  'Seminar Hall': Users,
  'Art Pavilion': Palette,
  'Computer Lab': Monitor,
  'Sports Ground': Dumbbell,
}

const TYPE_BADGE: Record<ProgrammeType, string> = {
  Stage: 'border-fest-red/30 bg-fest-red/15 text-fest-red',
  'Non-Stage': 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  Sports: 'border-fest-gold/30 bg-fest-gold/15 text-fest-gold',
}

/* ── helpers ───────────────────────────────────────────── */

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

const sortKey = (it: ScheduleItem) => (it.startTime ? toMinutes(it.startTime) : 24 * 60)

/** Local calendar date as YYYY-MM-DD (matches the API's day.date format). */
const localDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

interface VenueGroup {
  venue: string
  items: ScheduleItem[]
}

/* ── component ─────────────────────────────────────────── */

export function Schedule() {
  const [data, setData] = useState<ScheduleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState(1)
  const [venue, setVenue] = useState<string>('All')

  const reduced = useReducedMotion()

  /* fetch once on mount — state is only updated from async callbacks */
  useEffect(() => {
    let alive = true
    fetchJson<ScheduleResponse>('/api/schedule')
      .then((d) => {
        if (!alive) return
        setData(d)
        setError(null)
        setLoading(false)
      })
      .catch(() => {
        if (!alive) return
        setError('Could not load the timetable. Please try again.')
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const retry = () => {
    setLoading(true)
    setError(null)
    fetchJson<ScheduleResponse>('/api/schedule')
      .then((d) => {
        setData(d)
        setError(null)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load the timetable. Please try again.')
        setLoading(false)
      })
  }

  /* group the selected day's items by venue, time-ordered */
  const { groups, total } = useMemo(() => {
    if (!data) return { groups: [] as VenueGroup[], total: 0 }
    const dayItems = data.items.filter(
      (it) => it.day === activeDay && (venue === 'All' || it.venue === venue),
    )
    const map = new Map<string, ScheduleItem[]>()
    for (const it of dayItems) {
      const key = it.venue ?? 'To be announced'
      const arr = map.get(key)
      if (arr) arr.push(it)
      else map.set(key, [it])
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => sortKey(a) - sortKey(b) || a.code.localeCompare(b.code))
    }
    const order = venue === 'All' ? data.venues : [venue]
    const ordered = order.filter((v) => map.has(v))
    const extra = [...map.keys()].filter((k) => !order.includes(k))
    return {
      groups: [...ordered, ...extra].map((v) => ({ venue: v, items: map.get(v) ?? [] })),
      total: dayItems.length,
    }
  }, [data, activeDay, venue])

  /* "live now" — only on the real date matching the selected day */
  const now = new Date()
  const activeDate = data?.days.find((d) => d.day === activeDay)?.date ?? null
  const isToday = activeDate === localDateKey(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const isLive = (it: ScheduleItem) =>
    isToday &&
    !!it.startTime &&
    !!it.endTime &&
    toMinutes(it.startTime) <= nowMinutes &&
    nowMinutes < toMinutes(it.endTime)

  return (
    <section
      id="schedule"
      className="relative overflow-hidden bg-fest-green py-20 md:py-28"
      aria-label="Festival schedule"
    >
      <div className="fest-noise absolute inset-0" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute -top-32 right-[-10%] size-96 rounded-full bg-fest-gold/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-20%] left-[-8%] size-96 rounded-full bg-fest-red/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          dark
          kicker="Plan Your Days"
          title="The Three-Day Timetable"
          description="Every minute, every venue, all three days — follow the gold thread through the timetable and never miss a moment."
        />

        {loading ? (
          /* ── loading skeleton ── */
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[74px] rounded-2xl bg-white/10" />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-28 rounded-full bg-white/10" />
              ))}
            </div>
            <div className="space-y-6 rounded-3xl border border-white/10 bg-fest-green-deep p-4 sm:p-5">
              {Array.from({ length: 2 }).map((_, g) => (
                <div key={g} className="space-y-3">
                  <Skeleton className="h-9 w-56 rounded-xl bg-white/10" />
                  {Array.from({ length: 4 }).map((_, r) => (
                    <Skeleton key={r} className="h-[72px] rounded-xl bg-white/10" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          /* ── error state ── */
          <div className="rounded-3xl border border-fest-red/40 bg-fest-red/10 px-6 py-14 text-center">
            <p className="font-fest-display text-xl text-white">Couldn&apos;t load the timetable</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-white/70">{error}</p>
            <Button
              onClick={retry}
              variant="outline"
              className="mt-5 min-h-11 rounded-full border-white/25 bg-transparent px-6 font-bold text-white hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* ── day switcher ── */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-label="Select festival day">
              {data.days.map((d) => {
                const active = activeDay === d.day
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setActiveDay(d.day)}
                    aria-pressed={active}
                    className={`flex min-h-11 flex-col items-center justify-center rounded-2xl border px-2 py-3 transition-all ${
                      active
                        ? 'border-fest-gold bg-fest-gold text-fest-green-deep shadow-lg shadow-fest-gold/15'
                        : 'border-white/15 bg-white/5 text-white/75 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-fest-display text-base leading-none sm:text-lg">Day {d.day}</span>
                    <span className="mt-1.5 text-[10px] font-bold uppercase tracking-wider opacity-80 sm:text-[11px]">
                      {d.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* ── venue filter ── */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by venue">
              <button
                type="button"
                onClick={() => setVenue('All')}
                aria-pressed={venue === 'All'}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-all ${
                  venue === 'All'
                    ? 'border-fest-gold bg-fest-gold text-fest-green-deep'
                    : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                }`}
              >
                <ListFilter className="size-3.5" aria-hidden="true" />
                All Venues
              </button>
              {data.venues.map((v) => {
                const Icon = VENUE_ICONS[v] ?? MapPin
                const active = venue === v
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVenue(v)}
                    aria-pressed={active}
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-all ${
                      active
                        ? 'border-fest-gold bg-fest-gold text-fest-green-deep'
                        : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {v}
                  </button>
                );
              })}
            </div>

            {/* ── day summary ── */}
            <p className="flex flex-wrap items-center gap-2 text-sm text-white/60" aria-live="polite">
              <span className="font-bold tabular-nums text-fest-gold">{total}</span>{' '}events{' '}
              {venue === 'All' ? (
                <>
                  {' '}across <span className="font-bold text-white">{groups.length}</span>{' '}venue{' '}
                  {groups.length === 1 ? '' : 's'}
                </>
              ) : (
                <>
                  {' '}at <span className="font-bold text-white">{venue}</span>
                </>
              )}
              {' '}on <span className="font-bold text-white">{data.days.find((d) => d.day === activeDay)?.label}</span>
              {isToday && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-fest-gold/30 bg-fest-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-fest-gold">
                  Today
                </span>
              )}
            </p>

            {/* ── timeline panel ── */}
            <div className="rounded-3xl border border-white/10 bg-fest-green-deep p-3 shadow-xl shadow-black/20 sm:p-5">
              <div className="max-h-[28rem] overflow-y-auto pr-1 fest-scroll sm:pr-2">
                {groups.length === 0 ? (
                  /* empty state */
                  <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                    <span className="grid size-16 place-items-center rounded-full border border-fest-gold/30 bg-fest-gold/10 text-fest-gold">
                      <CalendarX2 className="size-7" aria-hidden="true" />
                    </span>
                    <p className="font-fest-display text-2xl text-white">Nothing scheduled here</p>
                    <p className="max-w-sm text-sm leading-relaxed text-white/60">
                      No events{venue === 'All' ? '' : ` at ${venue}`} on Day {activeDay}. Try another venue or
                      switch days above.
                    </p>
                    {venue !== 'All' && (
                      <Button
                        variant="outline"
                        onClick={() => setVenue('All')}
                        className="mt-1 min-h-11 rounded-full border-white/25 bg-transparent font-bold text-white hover:bg-white/10 hover:text-white"
                      >
                        Show all venues
                      </Button>
                    )}
                  </div>
                ) : (
                  <motion.div
                    key={`${activeDay}-${venue}`}
                    initial={reduced ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="space-y-6"
                  >
                    {groups.map((g) => {
                      const Icon = VENUE_ICONS[g.venue] ?? MapPin
                      return (
                        <motion.section
                          key={g.venue}
                          aria-label={`${g.venue} events`}
                          initial={reduced ? false : { opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-40px' }}
                          transition={{ duration: 0.45, ease: 'easeOut' }}
                        >
                          <header className="sticky top-0 z-10 flex items-center gap-3 bg-fest-green-deep py-2">
                            <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-fest-gold/25 bg-fest-gold/15 text-fest-gold">
                              <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <h3 className="font-fest-display text-lg leading-tight text-white">{g.venue}</h3>
                            <span className="ml-auto rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold tabular-nums text-fest-gold">
                              {g.items.length} events
                            </span>
                          </header>

                          <ul>
                            {g.items.map((it, i) => {
                              const live = isLive(it)
                              return (
                                <motion.li
                                  key={it.id}
                                  initial={reduced ? false : { opacity: 0, x: -12 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  viewport={{ once: true, margin: '-20px' }}
                                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04, ease: 'easeOut' }}
                                  className="relative grid gap-1.5 sm:grid-cols-[7rem_1fr]"
                                >
                                  {/* timeline connectors */}
                                  <span
                                    aria-hidden="true"
                                    className="absolute bottom-0 left-[7px] top-[5px] w-px bg-gradient-to-b from-fest-gold/60 via-fest-gold/25 to-transparent sm:hidden"
                                  />
                                  <span
                                    aria-hidden="true"
                                    className="absolute bottom-0 left-[7.5rem] top-[24px] hidden w-px bg-gradient-to-b from-fest-gold/60 via-fest-gold/25 to-transparent sm:block"
                                  />
                                  <span
                                    aria-hidden="true"
                                    className="absolute left-[2px] top-[5px] size-2.5 rounded-full bg-fest-gold ring-4 ring-fest-green-deep sm:hidden"
                                  />
                                  <span
                                    aria-hidden="true"
                                    className="absolute left-[calc(7.5rem-5px)] top-[19px] hidden size-2.5 rounded-full bg-fest-gold ring-4 ring-fest-green-deep sm:block"
                                  />

                                  {/* time column */}
                                  <div className="pl-6 sm:pl-0 sm:pt-2 sm:text-right">
                                    <time className="block whitespace-nowrap text-sm font-bold leading-tight tabular-nums text-fest-gold">
                                      {it.startTime ?? 'TBA'}
                                    </time>
                                    {it.endTime && (
                                      <span className="block whitespace-nowrap text-[11px] leading-tight tabular-nums text-white/45">
                                        – {it.endTime}
                                      </span>
                                    )}
                                  </div>

                                  {/* event card */}
                                  <article
                                    className={`relative mb-3 rounded-xl border p-3.5 transition-colors sm:ml-6 ${
                                      live
                                        ? 'border-fest-gold/50 bg-fest-gold/10'
                                        : 'border-white/10 bg-white/[0.05] hover:border-white/25 hover:bg-white/[0.08]'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <h4 className="text-sm font-semibold leading-snug text-white">{it.name}</h4>
                                      <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-fest-gold">
                                        {it.code}
                                      </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                      <span
                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${TYPE_BADGE[it.type]}`}
                                      >
                                        <span aria-hidden="true">{TYPE_ICONS[it.type] ?? '🎫'}</span>
                                        {it.type}
                                      </span>
                                      <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                                        {CATEGORY_SHORT[it.category] ?? it.category}
                                      </span>
                                      {live && (
                                        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-fest-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                          <span className="relative flex size-1.5" aria-hidden="true">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 motion-safe:animate-ping" />
                                            <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                                          </span>
                                          Live
                                        </span>
                                      )}
                                    </div>
                                  </article>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.section>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Schedule
