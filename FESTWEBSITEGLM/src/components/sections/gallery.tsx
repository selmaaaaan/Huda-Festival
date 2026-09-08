'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { SectionHeading } from '@/components/festival/section-heading'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchJson, type GalleryItem } from '@/lib/festival'

const CATEGORIES = [
  { key: 'all', label: 'All', emoji: '✨' },
  { key: 'stage', label: 'Stage', emoji: '🎭' },
  { key: 'art', label: 'Art', emoji: '🎨' },
  { key: 'sports', label: 'Sports', emoji: '🏃' },
  { key: 'tech', label: 'Tech', emoji: '💻' },
  { key: 'candid', label: 'Candid', emoji: '📸' },
] as const

/** Rotating aspect ratios for the masonry-ish grid. */
const ASPECTS = ['aspect-[3/4]', 'aspect-[4/3]', 'aspect-square', 'aspect-[4/5]']

const CATEGORY_BADGE: Record<string, string> = {
  stage: 'bg-fest-red/10 text-fest-red',
  art: 'bg-fest-gold/25 text-amber-700',
  sports: 'bg-emerald-100 text-emerald-700',
  tech: 'bg-orange-100 text-orange-700',
  candid: 'bg-fest-green/10 text-fest-green',
}

export function Gallery() {
  const reduce = useReducedMotion()

  const [items, setItems] = useState<GalleryItem[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchJson<GalleryItem[]>('/api/gallery')
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items?.length ?? 0 }
    for (const it of items ?? []) c[it.category] = (c[it.category] ?? 0) + 1
    return c
  }, [items])

  const filtered = useMemo(() => {
    if (!items) return []
    if (filter === 'all') return items
    return items.filter((it) => it.category === filter)
  }, [items, filter])

  const current = lightbox !== null ? (filtered[lightbox] ?? null) : null

  const step = (dir: 1 | -1) => {
    setLightbox((i) =>
      i === null ? i : (i + dir + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)
    )
  }

  // Choosing a new category resets the lightbox so indices stay valid.
  const applyFilter = (key: string) => {
    setFilter(key)
    setLightbox(null)
  }

  // Keyboard navigation (← →) while the lightbox is open.
  const isOpen = lightbox !== null
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, filtered.length])

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-white py-20 md:py-28"
      aria-label="Festival photo gallery"
    >
      <div className="fest-dots absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="relative container mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          kicker="Moments"
          title="The Festival Gallery"
          description="Relive the lights, the colours and the chaos."
        />

        {/* Category filter chips */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.5 }}
          className="mb-8 flex flex-wrap justify-center gap-2"
          role="group"
          aria-label="Filter photos by category"
        >
          {CATEGORIES.map((cat) => {
            const active = filter === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                aria-pressed={active}
                onClick={() => applyFilter(cat.key)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${
                  active
                    ? 'border-fest-green bg-fest-green text-white shadow-md'
                    : 'border-fest-line bg-white text-fest-ink hover:border-fest-green/40 hover:bg-fest-cream'
                }`}
              >
                <span aria-hidden="true">{cat.emoji}</span>
                {cat.label}
                <span
                  className={`tabular-nums text-xs ${active ? 'text-fest-gold' : 'text-fest-muted'}`}
                  aria-label={`${counts[cat.key] ?? 0} photos`}
                >
                  {counts[cat.key] ?? 0}
                </span>
              </button>
            )
          })}
        </motion.div>

        {/* Grid */}
        {items === null && !failed ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className={`rounded-2xl ${ASPECTS[i % ASPECTS.length]}`} />
            ))}
          </div>
        ) : failed ? (
          <div className="rounded-2xl border border-dashed border-fest-line py-16 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-fest-red/60" aria-hidden="true" />
            <p className="mt-3 font-fest-display text-xl text-fest-ink">The gallery is being curated</p>
            <p className="mt-1 text-sm text-fest-muted">Photos will appear here as the festival unfolds.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-fest-line py-16 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-fest-red/60" aria-hidden="true" />
            <p className="mt-3 font-fest-display text-xl text-fest-ink">No photos in this category yet</p>
            <p className="mt-1 text-sm text-fest-muted">Check another category — the official photographers are everywhere.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((item, i) => (
                <motion.button
                  key={item.id}
                  layout
                  type="button"
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reduce ? 1 : 0.92 }}
                  transition={{ duration: reduce ? 0 : 0.35 }}
                  onClick={() => setLightbox(i)}
                  aria-label={`Open photo: ${item.title}`}
                  className={`group relative overflow-hidden rounded-2xl border border-fest-line bg-fest-sand shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-fest-green ${ASPECTS[i % ASPECTS.length]}`}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
                  />
                  <span
                    className="absolute inset-0 bg-gradient-to-t from-fest-green/85 via-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                    <span className="min-w-0 text-left">
                      <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                      {item.caption && (
                        <span className="block truncate text-[11px] text-white/75">{item.caption}</span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                      {item.category}
                    </span>
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog
        open={isOpen}
        onOpenChange={(o) => {
          if (!o) setLightbox(null)
        }}
      >
        <DialogContent className="gap-3 rounded-2xl border-fest-line bg-fest-cream p-3 sm:p-4 sm:max-w-3xl">
          {current && (
            <>
              <div className="relative">
                <img
                  src={current.url}
                  alt={current.title}
                  className="max-h-[62vh] w-full rounded-xl bg-fest-green/10 object-contain"
                />
                {filtered.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Previous photo"
                      className="absolute top-1/2 left-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-fest-green shadow-lg transition hover:bg-white focus-visible:outline-2 focus-visible:outline-fest-red"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Next photo"
                      className="absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-fest-green shadow-lg transition hover:bg-white focus-visible:outline-2 focus-visible:outline-fest-red"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-start justify-between gap-3 px-1 pb-1">
                <div className="min-w-0">
                  <DialogTitle className="truncate font-fest-display text-lg text-fest-ink">
                    {current.title}
                  </DialogTitle>
                  {current.caption ? (
                    <DialogDescription className="mt-1 text-sm leading-relaxed text-fest-muted">
                      {current.caption}
                    </DialogDescription>
                  ) : (
                    <DialogDescription className="sr-only">
                      Photo from the {current.category} category.
                    </DialogDescription>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      CATEGORY_BADGE[current.category] ?? 'bg-fest-sand text-fest-muted'
                    }`}
                  >
                    <span aria-hidden="true">
                      {CATEGORIES.find((c) => c.key === current.category)?.emoji ?? '📸'}
                    </span>
                    {current.category}
                  </span>
                  {lightbox !== null && (
                    <span className="text-xs font-semibold text-fest-muted tabular-nums">
                      {lightbox + 1} / {filtered.length}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default Gallery
