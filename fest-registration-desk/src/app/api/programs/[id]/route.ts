import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const programId = parseInt(id);
  const body = await request.json();
  const { topicMode } = body;

  if (topicMode === undefined) {
    return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
  }

  const validModes = ['NONE', 'FIXED_LIST', 'FREE_TEXT'];
  if (topicMode && !validModes.includes(topicMode)) {
    return NextResponse.json({ error: 'Invalid topicMode' }, { status: 400 });
  }

  const updatedProgram = await prisma.program.update({
    where: { id: programId },
    data: { topicMode },
  });

  return NextResponse.json({ program: updatedProgram });
}
