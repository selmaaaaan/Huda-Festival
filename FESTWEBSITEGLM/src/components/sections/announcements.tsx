'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { fetchJson, type Announcement } from '@/lib/festival'

const RED = '#FF4655'
const GOLD = '#F6D24A'

/** Compact relative time — "just now", "2h ago", "3d ago", "16 Jan". */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.floor(Math.max(0, Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(then).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function Announcements() {
  const reduce = useReducedMotion()

  const [items, setItems] = useState<Announcement[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchJson<Announcement[]>('/api/announcements')
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

  return (
    <section
      id="announcements"
      className="border-y border-fest-line bg-fest-sand py-10"
      aria-label="Notice board"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="text-xl leading-none" aria-hidden="true">
            📢
          </span>
          <div>
            <h2 className="font-fest-display text-lg leading-tight text-fest-ink md:text-xl">
              Notice Board
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fest-muted">
              Live announcements from the fest office
            </p>
          </div>
        </div>

        {items === null && !failed ? (
          <div className="flex gap-3 overflow-hidden md:grid md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 w-[270px] flex-none animate-pulse rounded-xl border border-fest-line border-l-4 border-l-fest-gold bg-white md:w-auto md:flex-auto"
              />
            ))}
          </div>
        ) : failed || (items !== null && items.length === 0) ? (
          <p className="rounded-xl border border-dashed border-fest-line bg-white/60 py-8 text-center text-sm text-fest-muted">
            No announcements right now — enjoy the fest!
          </p>
        ) : (
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 fest-scroll md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
            {items?.map((a) => {
              const isHigh = (a.priority ?? '').toLowerCase() === 'high'
              return (
                <motion.article
                  key={a.id}
                  initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: reduce ? 0 : 0.4 }}
                  className="w-[270px] max-w-[340px] flex-none snap-start rounded-xl border border-fest-line border-l-4 bg-white p-4 shadow-sm md:w-auto md:max-w-none md:flex-auto"
                  style={{ borderLeftColor: isHigh ? RED : GOLD }}
                  aria-label={`${isHigh ? 'Urgent announcement' : 'Announcement'}: ${a.title}`}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    {isHigh ? (
                      <span className="rounded-sm bg-fest-red px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                        Urgent
                      </span>
                    ) : (
                      <span className="rounded-sm bg-fest-gold/25 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-700">
                        Notice
                      </span>
                    )}
                    <time dateTime={a.createdAt} className="text-[11px] font-semibold text-fest-muted">
                      {timeAgo(a.createdAt)}
                    </time>
                  </div>
                  <h3 className="text-sm font-bold leading-snug text-fest-ink">{a.title}</h3>
                  {a.body && <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-fest-muted">{a.body}</p>}
                </motion.article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default Announcements
