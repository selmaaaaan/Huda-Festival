'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Printer, Search, SearchX, Trophy } from 'lucide-react'
import { SectionHeading } from '@/components/festival/section-heading'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CATEGORY_SHORT,
  TYPE_ICONS,
  fetchJson,
  type Candidate,
  type CandidateResult,
} from '@/lib/festival'

/** Team codes + accent colours used for the filter chips. */
const TEAM_FILTERS = [
  { code: 'All', label: 'All Teams', color: '#F6D24A' },
  { code: 'A', label: 'Team A', color: '#FF4655' },
  { code: 'B', label: 'Team B', color: '#F6D24A' },
  { code: 'C', label: 'Team C', color: '#34D399' },
  { code: 'D', label: 'Team D', color: '#FB923C' },
]

const MAX_INITIAL = 12
const MAX_SEARCH = 24

/** Best readable text colour on a given hex background. */
function textOn(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#FFFFFF'
  const n = parseInt(m[1], 16)
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum > 0.6 ? '#133E2B' : '#FFFFFF'
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2)
  if (parts.length === 0) return '?'
  return parts.map((w) => w.charAt(0).toUpperCase()).join('')
}

function ordinal(n: number): string {
  return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`
}

/** Rank medal / grade badge / participant pill for a single result row. */
function ResultBadge({ result }: { result: CandidateResult }) {
  if (result.rank) {
    const styles =
      result.rank === 1
        ? 'bg-fest-gold/30 text-amber-700'
        : result.rank === 2
          ? 'bg-neutral-200 text-neutral-700'
          : 'bg-orange-100 text-orange-700'
    const medal = result.rank === 1 ? '🥇' : result.rank === 2 ? '🥈' : '🥉'
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${styles}`}>
        <span aria-hidden="true">{medal}</span>
        {ordinal(result.rank)}
      </span>
    )
  }
  if (result.grade) {
    const isA = result.grade.toUpperCase() === 'A'
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
          isA ? 'bg-fest-gold/30 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}
      >
        Grade {result.grade.toUpperCase()}
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-fest-sand px-2.5 py-0.5 text-[11px] font-medium text-fest-muted">
      Participant
    </span>
  )
}

export function ParticipantSearch() {
  const reduce = useReducedMotion()

  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [team, setTeam] = useState('All')
  const [reloadKey, setReloadKey] = useState(0)
  // Response keyed by the request it answers — lets us derive loading/failed
  // instead of flipping flags synchronously inside the effect.
  const [response, setResponse] = useState<{ key: string; ok: boolean; data: Candidate[] } | null>(null)

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [detail, setDetail] = useState<Candidate | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const requestKey = `${query}|${team}|${reloadKey}`

  // Debounce the typed input by 300ms before it becomes the query.
  useEffect(() => {
    const t = setTimeout(() => setQuery(input.trim()), 300)
    return () => clearTimeout(t)
  }, [input])

  // Fetch candidates whenever the query or team filter changes.
  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (team !== 'All') params.set('team', team)
    fetchJson<Candidate[]>(`/api/candidates?${params.toString()}`)
      .then((data) => {
        if (!cancelled) setResponse({ key: requestKey, ok: true, data })
      })
      .catch(() => {
        if (!cancelled) setResponse({ key: requestKey, ok: false, data: [] })
      })
    return () => {
      cancelled = true
    }
  }, [requestKey, query, team])

  const loading = response === null || response.key !== requestKey
  const failed = response !== null && response.key === requestKey && !response.ok
  const list = response !== null && response.key === requestKey ? response.data : []
  const cap = query ? MAX_SEARCH : MAX_INITIAL
  const shown = list.slice(0, cap)
  const truncated = list.length > shown.length

  const openProfile = (c: Candidate) => {
    setSelected(c)
    setDetail(null)
    setOpen(true)
    setDetailLoading(true)
    fetchJson<Candidate>(`/api/candidates/${c.admissionNo}`)
      .then((full) => setDetail(full))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false))
  }

  const profile = detail ?? selected

  return (
    <section
      id="participants"
      className="fest-noise relative overflow-hidden bg-fest-green py-20 md:py-28"
      aria-label="Participant search"
    >
      <div className="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-fest-gold/10 blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-[-20%] left-[-8%] h-80 w-80 rounded-full bg-fest-red/10 blur-3xl" aria-hidden="true" />

      <div className="relative container mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          dark
          kicker="Find Your Champion"
          title="Participant Search"
          description="Type a name or admission number to see results, ranks and certificates."
        />

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.5 }}
          onSubmit={(e) => {
            e.preventDefault()
            setQuery(input.trim())
          }}
          className="mx-auto flex max-w-2xl items-center gap-2"
          role="search"
          aria-label="Search participants"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-fest-gold"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Name or admission number…"
              aria-label="Search by name or admission number"
              className="h-14 rounded-2xl border-white/15 bg-white/10 pl-14 text-base text-white shadow-inner placeholder:text-white/40 focus-visible:border-fest-gold focus-visible:ring-fest-gold/30 md:text-lg [&::-webkit-search-cancel-button]:brightness-0 [&::-webkit-search-cancel-button]:invert"
            />
          </div>
          <Button
            type="submit"
            className="h-14 rounded-2xl bg-fest-red px-6 text-base font-bold text-white hover:bg-fest-red/90"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </motion.form>

        {/* Team filter chips */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.5, delay: 0.1 }}
          className="mt-6 flex flex-wrap justify-center gap-2"
          role="group"
          aria-label="Filter by team"
        >
          {TEAM_FILTERS.map((tf) => {
            const active = team === tf.code
            return (
              <button
                key={tf.code}
                type="button"
                aria-pressed={active}
                onClick={() => setTeam(tf.code)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${
                  active
                    ? 'scale-105 shadow-lg'
                    : 'border-white/20 text-white/75 hover:border-white/40 hover:bg-white/5 hover:text-white'
                }`}
                style={active ? { backgroundColor: tf.color, borderColor: tf.color, color: textOn(tf.color) } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: active ? 'currentColor' : tf.color }}
                  aria-hidden="true"
                />
                {tf.label}
              </button>
            )
          })}
        </motion.div>

        {/* Results */}
        <div className="mt-10" aria-live="polite">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl bg-white/10" />
              ))}
            </div>
          ) : failed ? (
            <div className="rounded-2xl border border-dashed border-white/25 py-16 text-center">
              <SearchX className="mx-auto h-10 w-10 text-fest-gold/70" aria-hidden="true" />
              <p className="mt-3 font-fest-display text-xl text-white">Could not load participants</p>
              <p className="mt-1 text-sm text-white/60">Check your connection and try again.</p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 h-11 border-fest-gold/40 bg-transparent text-fest-gold hover:bg-fest-gold hover:text-fest-green"
                onClick={() => setReloadKey((k) => k + 1)}
              >
                Retry
              </Button>
            </div>
          ) : shown.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/25 py-16 text-center">
              <SearchX className="mx-auto h-10 w-10 text-fest-gold/70" aria-hidden="true" />
              <p className="mt-3 font-fest-display text-xl text-white">No participants found</p>
              <p className="mt-1 text-sm text-white/60">
                Try a different spelling, or search by admission number — for example 1042.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                {query
                  ? `${list.length} result${list.length === 1 ? '' : 's'} for “${query}”`
                  : `Top ${shown.length} champions by points`}
                {truncated ? ` · showing first ${shown.length}` : ''}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: reduce ? 0 : 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : Math.min(i * 0.05, 0.3) }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View profile of ${c.name}, admission number ${c.admissionNo}`}
                    onClick={() => openProfile(c)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openProfile(c)
                      }
                    }}
                    className="h-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-fest-gold/40 hover:bg-white/10 focus-visible:border-fest-gold focus-visible:outline-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-white">{c.name}</p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/60">
                          Adm. No. {c.admissionNo} · Class {c.class} ·{' '}
                          {CATEGORY_SHORT[c.category] ?? c.category}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{ backgroundColor: c.team.color, color: textOn(c.team.color) }}
                      >
                        {c.team.name}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-fest-gold">
                        <Trophy className="h-4 w-4" aria-hidden="true" />
                        {c.points} pts
                      </span>
                      <span className="text-xs text-white/70">
                        🥇 {c.wins} win{c.wins === 1 ? '' : 's'} · 🥉 {c.podiums} podium
                        {c.podiums === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                        {c.results.length} result{c.results.length === 1 ? '' : 's'}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-9 border-fest-gold/40 bg-transparent text-fest-gold hover:bg-fest-gold hover:text-fest-green"
                        onClick={(e) => {
                          e.stopPropagation()
                          openProfile(c)
                        }}
                      >
                        View Profile
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden rounded-2xl border-fest-line p-0 sm:max-w-lg">
          {profile && (
            <>
              <div className="fest-noise relative overflow-hidden bg-fest-green px-6 pt-6 pb-5">
                <div
                  className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-fest-gold/15 blur-2xl"
                  aria-hidden="true"
                />
                <div className="relative flex items-center gap-4">
                  <span
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-fest-display text-2xl ring-2 ring-fest-gold/50"
                    style={{ backgroundColor: profile.team.color, color: textOn(profile.team.color) }}
                    aria-hidden="true"
                  >
                    {initials(profile.name)}
                  </span>
                  <div className="min-w-0">
                    <DialogTitle className="truncate font-fest-display text-2xl leading-tight text-white">
                      {profile.name}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/60">
                      Admission No. {profile.admissionNo} · Class {profile.class} ·{' '}
                      {CATEGORY_SHORT[profile.category] ?? profile.category}
                    </DialogDescription>
                  </div>
                </div>
                <div className="relative mt-4">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                    style={{ backgroundColor: profile.team.color, color: textOn(profile.team.color) }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: textOn(profile.team.color) }}
                      aria-hidden="true"
                    />
                    {profile.team.name}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-fest-line bg-fest-cream p-3 text-center">
                    <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-fest-muted">
                      <Trophy className="h-3.5 w-3.5 text-fest-gold" aria-hidden="true" />
                      Points
                    </p>
                    <p className="mt-1 font-fest-display text-2xl text-fest-green tabular-nums">{profile.points}</p>
                  </div>
                  <div className="rounded-xl border border-fest-line bg-fest-cream p-3 text-center">
                    <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-fest-muted">
                      <span aria-hidden="true">🥇</span> Wins
                    </p>
                    <p className="mt-1 font-fest-display text-2xl text-fest-green tabular-nums">{profile.wins}</p>
                  </div>
                  <div className="rounded-xl border border-fest-line bg-fest-cream p-3 text-center">
                    <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-fest-muted">
                      <span aria-hidden="true">🥉</span> Podiums
                    </p>
                    <p className="mt-1 font-fest-display text-2xl text-fest-green tabular-nums">{profile.podiums}</p>
                  </div>
                </div>

                {/* Results list */}
                <h4 className="mt-6 mb-3 text-xs font-bold uppercase tracking-[0.18em] text-fest-muted">
                  Results ({profile.results.length})
                </h4>
                {detailLoading ? (
                  <div className="max-h-72 space-y-2 overflow-y-auto fest-scroll pr-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 rounded-lg" />
                    ))}
                  </div>
                ) : profile.results.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-fest-line py-8 text-center text-sm text-fest-muted">
                    No results yet — this champion&apos;s events are still ahead.
                  </p>
                ) : (
                  <ul className="max-h-72 space-y-2 overflow-y-auto fest-scroll pr-1">
                    {profile.results.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-fest-line bg-fest-cream/60 px-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="text-lg" aria-hidden="true">
                            {TYPE_ICONS[r.programme.type] ?? '🏁'}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-fest-ink">{r.programme.name}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-fest-muted">
                              {r.programme.type} · {r.programme.code}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <ResultBadge result={r} />
                          <span className="text-xs font-bold text-fest-green tabular-nums">+{r.points}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Certificate preview + print */}
              <div className="flex flex-col gap-4 border-t border-fest-line bg-fest-cream/60 px-6 py-5 sm:flex-row sm:items-center">
                <div className="relative flex-1 rounded-xl border-2 border-dashed border-fest-gold bg-white px-4 pt-4 pb-3 text-center">
                  <span
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white px-1 text-xl"
                    aria-hidden="true"
                  >
                    🏅
                  </span>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-fest-muted">
                    Certificate of Achievement
                  </p>
                  <p className="mt-1 font-fest-display text-base leading-tight text-fest-green">{profile.name}</p>
                  <p className="mt-0.5 text-[10px] text-fest-muted">Huda Festival · SHIA Arts Fest 2026</p>
                </div>
                <Button
                  type="button"
                  onClick={() => window.print()}
                  className="h-11 shrink-0 gap-2 font-bold sm:flex-col sm:gap-1"
                >
                  <Printer className="h-4 w-4" aria-hidden="true" />
                  Print
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default ParticipantSearch
