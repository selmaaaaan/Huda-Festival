'use client'

import { motion } from 'framer-motion'

interface SectionHeadingProps {
  kicker: string
  title: string
  description?: string
  dark?: boolean
  align?: 'left' | 'center'
}

/** Consistent heading block used by every section of the festival site. */
export function SectionHeading({ kicker, title, description, dark = false, align = 'center' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={`mb-10 md:mb-14 ${align === 'center' ? 'text-center mx-auto max-w-2xl' : 'max-w-2xl'}`}
    >
      <span
        className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] mb-3 ${
          dark ? 'text-fest-gold' : 'text-fest-red'
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dark ? 'bg-fest-gold' : 'bg-fest-red'}`} />
        {kicker}
        <span className={`h-1.5 w-1.5 rounded-full ${dark ? 'bg-fest-gold' : 'bg-fest-red'}`} />
      </span>
      <h2
        className={`font-fest-display text-3xl sm:text-4xl md:text-5xl leading-[1.05] ${
          dark ? 'text-white' : 'text-fest-ink'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-base md:text-lg leading-relaxed ${dark ? 'text-white/70' : 'text-fest-muted'}`}>
          {description}
        </p>
      )}
      <div
        className={`mt-5 h-[3px] w-16 rounded-full bg-gradient-to-r from-fest-gold to-fest-red ${
          align === 'center' ? 'mx-auto' : ''
        }`}
      />
    </motion.div>
  )
}
