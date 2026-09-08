import { NextRequest, NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // Stage | Non-Stage | Sports
  const category = searchParams.get('category') // BIDAYAH | ULA | ...
  const day = searchParams.get('day')
  const venue = searchParams.get('venue')
  const q = searchParams.get('q')?.trim().toLowerCase()
  const limit = Math.min(Number(searchParams.get('limit')) || 600, 600)

  const [allProgrammes, allResults] = await Promise.all([
    backendFetch('/programmes'),
    backendFetch('/results/published')
  ]);

  let filtered = allProgrammes;

  if (type && type !== 'All') {
    filtered = filtered.filter((p: any) => p.type === type);
  }
  if (category && category !== 'All') {
    filtered = filtered.filter((p: any) => p.category === category);
  }
  if (venue && venue !== 'All') {
    filtered = filtered.filter((p: any) => p.venue === venue);
  }
  if (day && day !== 'All') {
    filtered = filtered.filter((p: any) => p.day === Number(day));
  }
  if (q) {
    filtered = filtered.filter((p: any) => p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q));
  }

  // Sort by day, startTime, code
  filtered = filtered.sort((a: any, b: any) => {
    if ((a.day || 0) !== (b.day || 0)) return (a.day || 0) - (b.day || 0);
    if ((a.startTime || '') !== (b.startTime || '')) return (a.startTime || '').localeCompare(b.startTime || '');
    return (a.code || '').localeCompare(b.code || '');
  }).slice(0, limit);

  return NextResponse.json(
    filtered.map((p: any) => {
      // count how many results exist for this programme
      const resultCount = allResults.filter((r: any) => r.programme?._id === p._id).length;

      return {
        id: p._id,
        code: p.code || p.name.substring(0, 3).toUpperCase(),
        name: p.name,
        category: p.category,
        type: p.type,
        format: p.format || 'Individual',
        quota: p.quota || 1,
        groupSize: p.groupSize || 1,
        maxParticipants: p.maxParticipants || 1,
        description: p.description || '',
        day: p.day || null,
        venue: p.venue || null,
        startTime: p.startTime || null,
        endTime: p.endTime || null,
        resultCount,
        isResultPublished: p.isResultPublished || false,
      }
    })
  )
}
