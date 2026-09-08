'use client'

import { useEffect, useState } from 'react'
import { Heart, Instagram, Facebook, Youtube, Mail, MapPin, Phone } from 'lucide-react'
import { fetchJson, Announcement } from '@/lib/festival'

/** Bottom announcement marquee that sits right above the footer. */
function AnnouncementTicker() {
  const [items, setItems] = useState<Announcement[]>([])
  useEffect(() => {
    fetchJson<Announcement[]>('/api/announcements').then(setItems).catch(() => {})
  }, [])
  if (items.length === 0) return null
  const text = items.map((a) => `${a.priority === 'high' ? '★' : '•'} ${a.title}`).join('   ')
  return (
    <div className="bg-fest-gold py-2.5 overflow-hidden" aria-label="Latest announcements">
      <div className="animate-fest-marquee-slow flex whitespace-nowrap w-max">
        <span className="mx-6 text-sm font-bold text-fest-green-deep uppercase tracking-wider">{text}</span>
        <span className="mx-6 text-sm font-bold text-fest-green-deep uppercase tracking-wider" aria-hidden="true">{text}</span>
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="mt-auto bg-fest-green-deep text-white relative overflow-hidden fest-noise" role="contentinfo">
      <AnnouncementTicker />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fest-red/15 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fest-gold/10 blur-3xl" aria-hidden="true" />

      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              { }
              <img src="/images/logo.png" alt="Huda Festival logo" className="h-12 w-12 object-contain" />
              <span className="font-fest-display text-2xl">
                HUDA<span className="text-fest-red">FEST</span> <span className="text-fest-gold">'26</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              The official portal of Huda Festival — SHIA Arts Fest 2026. Live scoreboard, results, schedule and
              certificates for 333 programmes across stage, non-stage and sports arenas.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[
                { icon: Instagram, label: 'Instagram' },
                { icon: Facebook, label: 'Facebook' },
                { icon: Youtube, label: 'YouTube' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#top"
                  aria-label={s.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 hover:text-fest-gold hover:border-fest-gold/50 transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Footer navigation">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-fest-gold mb-4">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ['#programmes', 'Programmes'],
                ['#schedule', 'Schedule'],
                ['#teams', 'Teams'],
                ['#leaderboard', 'Live Scoreboard'],
                ['#results', 'Results'],
                ['#participants', 'Participant Search'],
                ['#gallery', 'Gallery'],
                ['#faq', 'FAQ'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-white/60 hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-fest-gold mb-4">Fest Office</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-fest-red shrink-0" aria-hidden="true" />
                SHIA Campus, Festival Office, Kerala
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-fest-red shrink-0" aria-hidden="true" />
                +91 000 000 0000
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-fest-red shrink-0" aria-hidden="true" />
                fest@hudafestival.in
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© 2026 Huda Festival Committee · SHIA Arts Fest · All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Crafted with <Heart className="h-3.5 w-3.5 text-fest-red" aria-hidden="true" /> for the students of Samastha Huda Islamic Academy
          </p>
        </div>
      </div>
    </footer>
  )
}
