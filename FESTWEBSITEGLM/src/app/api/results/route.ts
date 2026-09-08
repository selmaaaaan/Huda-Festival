import { NextRequest, NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const programmeId = searchParams.get('programmeId')
  const type = searchParams.get('type')
  const category = searchParams.get('category')
  const q = searchParams.get('q')?.trim().toLowerCase()
  const limit = Math.min(Number(searchParams.get('limit')) || 100, 300)

  // Fetch all published results
  const allResults = await backendFetch('/results/published');

  if (programmeId) {
    // winners for one programme
    let results = allResults.filter((r: any) => r.programme?._id === programmeId);
    
    results = results.sort((a: any, b: any) => {
      if ((a.rank || 9) !== (b.rank || 9)) return (a.rank || 9) - (b.rank || 9);
      return (b.totalPoints || 0) - (a.totalPoints || 0);
    });

    return NextResponse.json(
      results.map((r: any) => ({
        id: r._id,
        rank: r.rank,
        grade: r.grade,
        points: r.totalPoints || 0,
        candidate: {
          id: r.candidate?._id || '',
          name: r.candidate?.name || '',
          admissionNo: Number(r.candidate?.admissionNo) || 0,
          team: { 
            code: r.candidate?.team?.name?.substring(0, 3).toUpperCase() || '', 
            name: r.candidate?.team?.name || '', 
            color: r.candidate?.team?.color || '#000000' 
          },
        },
      }))
    )
  }

  // browse published results grouped by programme
  let filteredResults = allResults;
  
  if (type && type !== 'All') {
    filteredResults = filteredResults.filter((r: any) => r.programme?.type === type);
  }
  if (category && category !== 'All') {
    filteredResults = filteredResults.filter((r: any) => r.programme?.category === category);
  }
  if (q) {
    filteredResults = filteredResults.filter((r: any) => r.programme?.name?.toLowerCase().includes(q));
  }

  // Sort
  filteredResults = filteredResults.sort((a: any, b: any) => {
    const aProg = a.programme?._id || '';
    const bProg = b.programme?._id || '';
    if (aProg !== bProg) return aProg.localeCompare(bProg);
    return (a.rank || 9) - (b.rank || 9);
  });

  const grouped = new Map<string, any>();
  
  let resultCount = 0;
  for (const r of filteredResults) {
    if (resultCount >= limit) break;
    const key = r.programme?._id;
    if (!key) continue;

    if (!grouped.has(key)) {
      grouped.set(key, {
        programme: {
          id: r.programme._id,
          code: r.programme.code || r.programme.name?.substring(0,3).toUpperCase(),
          name: r.programme.name,
          type: r.programme.type,
          category: r.programme.category,
          venue: r.programme.venue || null,
          day: r.programme.day || null,
        },
        winners: [],
      })
      resultCount++;
    }
    
    grouped.get(key)!.winners.push({
      name: r.candidate?.name || '',
      team: r.candidate?.team?.name || '',
      teamColor: r.candidate?.team?.color || '#000000',
      rank: r.rank,
      grade: r.grade,
      points: r.totalPoints || 0,
      admissionNo: Number(r.candidate?.admissionNo) || 0,
    })
  }

  return NextResponse.json([...grouped.values()])
}
