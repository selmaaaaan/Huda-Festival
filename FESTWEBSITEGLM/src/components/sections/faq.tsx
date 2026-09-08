'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import { SectionHeading } from '@/components/festival/section-heading'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const FAQS = [
  {
    q: 'When and where is Huda Festival 2026?',
    a: 'The festival runs Friday to Sunday, 16–18 January 2026, on the SHIA (Samastha Huda Islamic Academy) campus. Competitions are spread across 7 venues — the Main Stage, Open Air Theatre, sports grounds, art courts and tech labs — from 9:00 AM to 8:00 PM each day.',
  },
  {
    q: 'What are the categories?',
    a: 'Students compete within their school category: Bidāyah (Grades 1–2), ʾŪlā (Grades 3–4), Thāniyah (Grades 5–6), Thānawiyyah (Grades 7–8) and ʿĀliyah (Grades 9–10). Kulliyyah programmes are the open battlegrounds where every category competes together.',
  },
  {
    q: 'How are points awarded?',
    a: 'In ranked events, 1st place earns 12 points, 2nd place 9 points and 3rd place 7 points. In graded events, Grade A earns 5 points and Grade B earns 3 points. Every individual point rolls up into the team totals that decide the overall champions.',
  },
  {
    q: 'How do I find my results and certificate?',
    a: 'Open the Participant Search section of this site and type your name or admission number. Your profile shows every result, rank and grade — press the Print button there to get your Certificate of Achievement.',
  },
  {
    q: 'Can parents attend the events?',
    a: 'Absolutely — all daytime venues are open to parents and visitors. The evening finals at the Open Air Theatre are the highlight of each day, and the Festival Gallery on this site is updated daily so families can relive every moment.',
  },
  {
    q: 'What are the photography rules?',
    a: 'Please switch off your flash during stage performances — it distracts the young artists. Official photographers cover every programme, and their photos appear in the Festival Gallery, usually within the same day.',
  },
  {
    q: 'What is Kulliyyah?',
    a: 'Kulliyyah literally means “for everybody” — these are open programmes where students from all categories compete on one stage. Signature Kulliyyah events include the Qawwali night, the Hackathon and the Wall Painting marathon.',
  },
  {
    q: 'Whom do I contact for help?',
    a: 'The fest office sits beside the registration desk and is open 8:00 AM–6:00 PM on all three festival days. Team coordinators handle participant queries, programme coordinators handle event rules, and urgent notices are always posted on the Notice Board section of this site.',
  },
]

export function Faq() {
  const reduce = useReducedMotion()

  return (
    <section id="faq" className="bg-fest-cream py-20 md:py-28" aria-label="Frequently asked questions">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-14">
          {/* Heading (left column on lg) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <SectionHeading
                align="left"
                kicker="Good to Know"
                title="Frequently Asked Questions"
                description="Everything students, parents and visitors ask us before the flags go up."
              />
              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: reduce ? 0 : 0.5, delay: 0.15 }}
                className="rounded-2xl border border-fest-line bg-white p-5 shadow-sm"
              >
                <p className="flex items-center gap-2 text-sm font-bold text-fest-ink">
                  <HelpCircle className="h-4 w-4 text-fest-red" aria-hidden="true" />
                  Still curious?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-fest-muted">
                  Find the fest office beside the registration desk, ask your team coordinator, or watch the{' '}
                  <a href="#announcements" className="font-semibold text-fest-red underline-offset-2 hover:underline">
                    Notice Board
                  </a>{' '}
                  for live updates.
                </p>
              </motion.div>
            </div>
          </div>

          {/* FAQ accordion — 2 columns on lg */}
          <div className="lg:col-span-3">
            <Accordion
              type="single"
              collapsible
              className="grid items-start gap-3 sm:grid-cols-2"
              aria-label="Frequently asked questions list"
            >
              {FAQS.map((f, i) => (
                <motion.div
                  key={f.q}
                  initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : (i % 4) * 0.07 }}
                >
                  <AccordionItem
                    value={`faq-${i}`}
                    className="rounded-2xl border border-fest-line border-b-0 bg-white px-5 shadow-sm transition-shadow data-[state=open]:border-fest-gold/60 data-[state=open]:shadow-md"
                  >
                    <AccordionTrigger className="gap-3 py-4 text-left hover:no-underline">
                      <span className="flex items-center gap-3">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fest-gold/25 font-fest-display text-sm text-amber-700"
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm font-bold text-fest-ink sm:text-[15px]">{f.q}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pl-11 text-sm leading-relaxed text-fest-muted">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Faq
