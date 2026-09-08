import { NextRequest, NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const team = searchParams.get('team')
  const category = searchParams.get('category')
  const limit = Math.min(Number(searchParams.get('limit')) || 300, 300)

  // Fetch candidates and published results from backend
  const [allCandidates, allResults] = await Promise.all([
    backendFetch('/candidates'),
    backendFetch('/results/published')
  ]);

  // Filter candidates locally
  let filteredCandidates = allCandidates;
  
  if (q) {
    const qLower = q.toLowerCase();
    filteredCandidates = filteredCandidates.filter((c: any) => 
      (c.name && c.name.toLowerCase().includes(qLower)) || 
      (c.admissionNo && String(c.admissionNo).includes(q))
    );
  }
  
  if (team && team !== 'All') {
    // team might be team code or name, depending on frontend. Usually team name.
    filteredCandidates = filteredCandidates.filter((c: any) => c.team?.name === team || c.team?.code === team);
  }
  
  if (category && category !== 'All') {
    filteredCandidates = filteredCandidates.filter((c: any) => c.category === category);
  }

  // Sort by points desc, limit
  filteredCandidates = filteredCandidates.sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0)).slice(0, limit);

  return NextResponse.json(
    filteredCandidates.map((c: any) => {
      // Find results for this candidate
      const candidateResults = allResults.filter((r: any) => r.candidate?._id === c._id);
      
      const wins = candidateResults.filter((r: any) => r.rank === 1).length;
      const podiums = candidateResults.filter((r: any) => r.rank && r.rank <= 3).length;
      
      return {
        id: c._id,
        name: c.name,
        admissionNo: Number(c.admissionNo) || 0,
        category: c.category || '',
        class: Number(c.classLevel) || 1,
        points: c.totalPoints || 0,
        wins,
        podiums,
        team: { 
          code: c.team?.name?.substring(0, 3).toUpperCase() || '', 
          name: c.team?.name || '', 
          color: c.team?.color || '#000000' 
        },
        results: candidateResults
          .sort((a: any, b: any) => (a.rank ?? 9) - (b.rank ?? 9))
          .slice(0, 8)
          .map((r: any) => ({
            id: r._id,
            programme: { 
              code: r.programme?.code || '', 
              name: r.programme?.name || '', 
              type: r.programme?.type || '' 
            },
            rank: r.rank,
            grade: r.grade,
            points: r.totalPoints,
          })),
      }
    })
  )
}
