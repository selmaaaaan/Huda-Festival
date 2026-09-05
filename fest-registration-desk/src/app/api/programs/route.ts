import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const type = searchParams.get('type');

  const where: Record<string, unknown> = {
    status: 'Active'
  };

  if (category) {
    where.category = category;
  }
  if (type && type !== 'All Programs') {
    where.type = type;
  }

  const programs = await prisma.program.findMany({
    where,
    orderBy: { code: 'asc' },
  });

  return NextResponse.json({ programs });
}
