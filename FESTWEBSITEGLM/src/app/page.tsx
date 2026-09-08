import { Navbar } from '@/components/sections/navbar'
import { Hero } from '@/components/sections/hero'
import { StatsStrip } from '@/components/sections/stats'
import { About } from '@/components/sections/about'
import { Programmes } from '@/components/sections/programmes'
import { Schedule } from '@/components/sections/schedule'
import { Teams } from '@/components/sections/teams'
import { Leaderboard } from '@/components/sections/leaderboard'
import { Results } from '@/components/sections/results'
import { ParticipantSearch } from '@/components/sections/participant-search'
import { Announcements } from '@/components/sections/announcements'
import { Gallery } from '@/components/sections/gallery'
import { Faq } from '@/components/sections/faq'
import { Footer } from '@/components/sections/footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-fest-cream">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsStrip />
        <About />
        <Programmes />
        <Schedule />
        <Teams />
        <Leaderboard />
        <Results />
        <ParticipantSearch />
        <Announcements />
        <Gallery />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
