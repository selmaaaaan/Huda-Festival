'use client'

import { motion } from 'framer-motion'
import { Sparkles, Languages, Trophy, Users } from 'lucide-react'
import { SectionHeading } from '@/components/festival/section-heading'
import { CATEGORY_SHORT } from '@/lib/festival'

const PILLARS = [
  {
    icon: Sparkles,
    title: 'Moyilarity & Modernity',
    body: 'One stage where tradition meets the digital age — classical recitations share the spotlight with AI video craft and prompt engineering.',
    accent: 'text-fest-red',
    bg: 'bg-fest-red/10',
  },
  {
    icon: Languages,
    title: 'Five languages, one voice',
    body: 'Malayalam, English, Arabic, Urdu and Hindi competitions — debates, songs, poetry and storytelling in every tongue on campus.',
    accent: 'text-fest-green',
    bg: 'bg-fest-green/10',
  },
  {
    icon: Trophy,
    title: '333 programmes, 4 houses',
    body: 'Every point counts. Team A, B, C and D battle across stage, non-stage and sports arenas for the Ustaverse crown.',
    accent: 'text-amber-600',
    bg: 'bg-fest-gold/15',
  },
  {
    icon: Users,
    title: '290 champions',
    body: 'From Bidāyah first-graders to ʿĀliyah seniors — every student competes, and every result is published with a certificate.',
    accent: 'text-orange-600',
    bg: 'bg-orange-100',
  },
]

const CATEGORY_NOTES: Record<string, string> = {
  BIDAYAH: 'Foundation',
  ULA: 'Primary',
  THANIYAH: 'Junior',
  THANAWIYYAH: 'Middle',
  ALIYAH: 'Senior',
  KULLIYYAH: 'Open',
}

export function About() {
  return (
    <section id="about" className="relative bg-fest-cream py-20 md:py-28 overflow-hidden" aria-label="About the festival">
      <div className="fest-dots absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative container mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          kicker="The Fest"
          title="Three days that turn a campus into a universe"
          description="Huda Festival — SHIA Arts Fest 2026 — is the annual arts, literary and sports carnival of Samastha Huda Islamic Academy. One weekend, seven venues, and a school reborn in colour."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              className="group relative rounded-2xl border border-fest-line bg-white p-6 md:p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${p.bg}`}>
                <p.icon className={`h-6 w-6 ${p.accent}`} aria-hidden="true" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-fest-ink mb-2">{p.title}</h3>
              <p className="text-sm md:text-[15px] leading-relaxed text-fest-muted">{p.body}</p>
              <div className="absolute top-6 right-6 font-fest-display text-5xl text-fest-line select-none" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Category ladder */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mt-12 rounded-3xl bg-fest-green p-6 md:p-10 text-white relative overflow-hidden fest-noise"
        >
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-fest-gold/20 blur-3xl" aria-hidden="true" />
          <h3 className="font-fest-display text-2xl md:text-3xl mb-2">The Category Ladder</h3>
          <p className="text-white/70 text-sm md:text-base max-w-xl mb-8">
            Competitions are levelled by school category — every student fights in their own arena. Kulliyyah events are
            open battlegrounds where all categories collide.
          </p>
          <ol className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(CATEGORY_SHORT).map(([code, label], i) => (
              <li
                key={code}
                className="rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-4 hover:bg-white/10 hover:border-fest-gold/40 transition-colors"
              >
                <span className="font-fest-display text-2xl text-fest-gold block leading-none">{String(i + 1).padStart(2, '0')}</span>
                <span className="mt-2 block text-sm font-bold">{label}</span>
                <span className="mt-0.5 block text-[11px] uppercase tracking-wider text-white/60">{CATEGORY_NOTES[code]}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  )
}
