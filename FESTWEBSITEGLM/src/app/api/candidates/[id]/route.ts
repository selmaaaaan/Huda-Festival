import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numeric = Number(id)
  const candidate = await db.candidate.findFirst({
    where: Number.isFinite(numeric) && String(numeric) === id ? { admissionNo: numeric } : { id },
    include: {
      team: true,
      results: { where: { status: 'approved' }, include: { programme: true } },
    },
  })
  if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })

  const wins = candidate.results.filter((r) => r.rank === 1).length
  const podiums = candidate.results.filter((r) => r.rank && r.rank <= 3).length
  return NextResponse.json({
    id: candidate.id,
    name: candidate.name,
    admissionNo: candidate.admissionNo,
    category: candidate.category,
    class: candidate.classLevel,
    points: candidate.totalPoints,
    wins,
    podiums,
    team: { code: candidate.team.code, name: candidate.team.name, color: candidate.team.color },
    results: candidate.results
      .sort((a, b) => (a.rank ?? 9) - (b.rank ?? 9) || b.totalPoints - a.totalPoints)
      .map((r) => ({
        id: r.id,
        programme: { code: r.programme.code, name: r.programme.name, type: r.programme.type, venue: r.programme.venue, day: r.programme.day },
        rank: r.rank,
        grade: r.grade,
        points: r.totalPoints,
      })),
  })
}
