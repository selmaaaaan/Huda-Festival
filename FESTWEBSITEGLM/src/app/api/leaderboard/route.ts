import { NextRequest, NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const topN = Math.min(Number(searchParams.get('topN')) || 10, 50)

  // Fetch real data from backend
  const data = await backendFetch('/leaderboards');

  // backend shape: { teamLeaderboard, categoryTopStudents, overallTopStudents }
  // we need to map to: { teamLeaderboard, topIndividuals, topProgrammes }

  // 1. Team Leaderboard
  const mappedTeams = (data.teamLeaderboard || []).map((t: any, i: number) => ({
    rank: i + 1,
    id: t._id,
    code: t.name.substring(0, 3).toUpperCase(),
    name: t.name,
    color: t.color || '#000000',
    motto: t.motto || '',
    points: t.totalPoints || 0,
    members: 0,
    golds: 0,
  }));

  // 2. Top Individuals
  const mappedIndividuals = (data.overallTopStudents || []).map((c: any, i: number) => ({
    rank: i + 1,
    id: c._id,
    name: c.name,
    admissionNo: c.admissionNo || 0,
    category: c.category || '',
    class: '',
    points: c.totalPoints || 0,
    team: { 
      code: c.team?.name?.substring(0, 3).toUpperCase() || '', 
      name: c.team?.name || '', 
      color: c.team?.color || '#000000' 
    },
  })).slice(0, topN);

  // 3. Top Programmes
  let mappedProgrammes: any[] = [];
  try {
    const [progs, allResults] = await Promise.all([
      backendFetch('/programmes'),
      backendFetch('/results/published')
    ]);
    
    // find programmes with published results
    const pubProgs = progs.filter((p: any) => p.isResultPublished).slice(0, 3);
    
    mappedProgrammes = pubProgs.map((p: any) => {
      const progResults = allResults.filter((r: any) => r.programme?._id === p._id).sort((a: any, b: any) => (a.rank || 9) - (b.rank || 9));
      return {
        id: p._id,
        code: p.code || p.name.substring(0, 3).toUpperCase(),
        name: p.name,
        category: p.category,
        type: p.type,
        results: progResults.map((r: any) => ({
          rank: r.rank,
          candidate: {
            name: r.candidate?.name || '',
            team: {
              code: r.candidate?.team?.name?.substring(0, 3).toUpperCase() || '',
              color: r.candidate?.team?.color || '#000000',
            }
          }
        }))
      }
    });
  } catch (e) {
    console.warn("Failed to fetch top programmes for leaderboard", e);
  }

  return NextResponse.json({
    teamLeaderboard: mappedTeams,
    topIndividuals: mappedIndividuals,
    topProgrammes: mappedProgrammes,
  })
}
