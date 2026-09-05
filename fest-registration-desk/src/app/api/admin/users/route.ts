import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';
import * as bcrypt from 'bcryptjs';

/**
 * GET /api/admin/users
 * Get all users and their teams
 */
export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      teamId: true,
      isActive: true,
      lastLoginAt: true,
      permissions: true,
      team: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}

/**
 * POST /api/admin/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { username, password, displayName, role, teamId } = body;

  if (!username || !password || !displayName || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);
  
  // Default permissions
  const defaultPerms = JSON.stringify({
    VIEW_STUDENTS: true,
    VIEW_REGISTRATIONS: true,
    EDIT_REGISTRATIONS: true,
    VIEW_PROGRAMS: true,
    VIEW_COMPLIANCE: true,
    EXPORT_TEAM_DATA: true,
  });

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: hash,
      displayName,
      role,
      teamId: teamId ? parseInt(teamId) : null,
      mustChangePassword: true,
      permissions: defaultPerms,
    },
    select: { id: true, username: true, displayName: true, role: true, teamId: true },
  });

  return NextResponse.json({ success: true, user });
}
