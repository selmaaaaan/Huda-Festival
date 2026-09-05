import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth, getTeamFilter } from '@/lib/middleware';
import { calculateBylawStatus } from '@/lib/bylaw-engine';

/**
 * GET /api/students
 * Returns students filtered by the user's team (server-enforced).
 * Query params: category, search
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { session } = authResult;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const requestedTeamId = searchParams.get('teamId');

  // CRITICAL: Server-side team filtering
  const teamFilter = getTeamFilter(
    session,
    requestedTeamId ? parseInt(requestedTeamId) : undefined
  );

  // Build query
  const where: Record<string, unknown> = {
    ...teamFilter,
    status: { not: 'Coordinator' },
  };

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { adNo: isNaN(parseInt(search)) ? undefined : parseInt(search) },
    ];
    // Remove undefined values from OR
    where.OR = (where.OR as Array<Record<string, unknown>>).filter(
      (cond: Record<string, unknown>) => Object.values(cond).every(v => v !== undefined)
    );
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      team: { select: { id: true, name: true } },
      registrations: {
        include: {
          program: { select: { id: true, code: true, type: true, format: true } },
        },
      },
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  // Calculate bylaw status for each student in memory (avoid N+1)
  const studentsWithStatus = students.map(student => {
    const regs = student.registrations;
    const nonStageCount = regs.filter(r => r.program.type === 'Non-Stage').length;
    const stageCount = regs.filter(r => r.program.type === 'Stage').length;
    const sportsCount = regs.filter(r => r.program.type === 'Sports').length;
    const individualCount = regs.filter(r => r.program.format === 'Individual').length;
    const groupCount = regs.filter(r => r.program.format === 'Group').length;
    const totalCount = regs.length;

    let bylawStatus: string;
    if (student.status !== 'Active') {
      bylawStatus = 'Inactive Student';
    } else if (totalCount === 0 || stageCount === 0 || nonStageCount === 0) {
      bylawStatus = 'Min 1 Required (Stage & Non-Stage)';
    } else {
      bylawStatus = 'Compliant';
    }

    return {
      id: student.id,
      adNo: student.adNo,
      name: student.name,
      class: student.class,
      category: student.category,
      team: student.team,
      status: student.status,
      registrations: regs.map(r => ({
        id: r.id,
        programId: r.programId,
        programCode: r.program.code,
      })),
      counts: {
        nonStageCount,
        stageCount,
        sportsCount,
        individualCount,
        groupCount,
        totalCount,
      },
      bylawStatus,
    };
  });

  return NextResponse.json({ students: studentsWithStatus });
}
