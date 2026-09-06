import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/middleware';

// GET /api/programs/[id]/topics - List topics for a program
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const programId = parseInt(id);

  const topics = await prisma.topic.findMany({
    where: { programId },
    orderBy: { createdAt: 'asc' },
  });

  // Calculate usage counts
  const topicsWithCounts = await Promise.all(
    topics.map(async (topic) => {
      const count = await prisma.registration.count({
        where: { programId, topic: topic.label },
      });
      return { ...topic, usageCount: count };
    })
  );

  return NextResponse.json({ topics: topicsWithCounts });
}

// POST /api/programs/[id]/topics - Create a topic (Admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const programId = parseInt(id);
  const body = await request.json();
  const { label, maxUses } = body;

  if (!label || label.trim() === '') {
    return NextResponse.json({ error: 'Label is required' }, { status: 400 });
  }

  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 });
  }

  const topic = await prisma.topic.create({
    data: {
      programId,
      label: label.trim(),
      maxUses: maxUses !== undefined ? maxUses : null,
      isActive: true,
    },
  });

  return NextResponse.json({ topic });
}

// PATCH /api/programs/[id]/topics - Toggle isActive or edit maxUses/label (Admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const programId = parseInt(id);
  const body = await request.json();
  const { topicId, label, isActive, maxUses } = body;

  if (!topicId) {
    return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (label !== undefined) updateData.label = label.trim();
  if (isActive !== undefined) updateData.isActive = isActive;
  if (maxUses !== undefined) updateData.maxUses = maxUses;

  const topic = await prisma.topic.updateMany({
    where: { id: topicId, programId },
    data: updateData,
  });

  if (topic.count === 0) {
    return NextResponse.json({ error: 'Topic not found for this program' }, { status: 404 });
  }

  const updatedTopic = await prisma.topic.findUnique({ where: { id: topicId } });
  return NextResponse.json({ topic: updatedTopic });
}
