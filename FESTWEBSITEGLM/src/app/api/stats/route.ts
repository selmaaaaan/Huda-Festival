import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'

export const dynamic = 'force-dynamic'

const cache = new Map<string, { data: unknown; ts: number }>()
const TTL = 30_000

export async function GET() {
  const hit = cache.get('stats')
  if (hit && Date.now() - hit.ts < TTL) {
    return NextResponse.json(hit.data)
  }
  
  const [teams, programmes, candidates, results] = await Promise.all([
    backendFetch('/teams'),
    backendFetch('/programmes'),
    backendFetch('/candidates'),
    backendFetch('/results/published')
  ]);
  
  const venueList = [...new Set(programmes.map((p: any) => p.venue).filter(Boolean))];

  const data = {
    teams: teams.length,
    programmes: programmes.length,
    candidates: candidates.length,
    results: results.length,
    venues: venueList.length,
    days: 3,
    dates: ['2026-01-16', '2026-01-17', '2026-01-18'],
  }
  cache.set('stats', { data, ts: Date.now() })
  return NextResponse.json(data)
}
