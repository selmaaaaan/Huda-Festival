import { NextRequest, NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const day = searchParams.get('day') // 1..3
  const venue = searchParams.get('venue')

  const programmes = await backendFetch('/programmes')

  let filtered = programmes;
  if (day && day !== 'All') {
    filtered = filtered.filter((p: any) => p.day === Number(day));
  }
  if (venue && venue !== 'All') {
    filtered = filtered.filter((p: any) => p.venue === venue);
  }

  filtered = filtered.sort((a: any, b: any) => {
    if ((a.day || 0) !== (b.day || 0)) return (a.day || 0) - (b.day || 0);
    if ((a.venue || '') !== (b.venue || '')) return (a.venue || '').localeCompare(b.venue || '');
    if ((a.startTime || '') !== (b.startTime || '')) return (a.startTime || '').localeCompare(b.startTime || '');
    return 0;
  });

  const venuesSet = new Set<string>();
  programmes.forEach((p: any) => {
    if (p.venue) venuesSet.add(p.venue);
  });
  const venues = Array.from(venuesSet).sort();

  const days = [1, 2, 3].map((d) => ({
    day: d,
    date: ['2026-01-16', '2026-01-17', '2026-01-18'][d - 1],
    label: ['Friday, 16 Jan', 'Saturday, 17 Jan', 'Sunday, 18 Jan'][d - 1],
  }))

  return NextResponse.json({
    days,
    venues,
    items: filtered.map((p: any) => ({
      id: p._id,
      code: p.code || p.name.substring(0, 3).toUpperCase(),
      name: p.name,
      category: p.category,
      type: p.type,
      day: p.day || null,
      venue: p.venue || null,
      startTime: p.startTime || null,
      endTime: p.endTime || null,
    })),
  })
}
