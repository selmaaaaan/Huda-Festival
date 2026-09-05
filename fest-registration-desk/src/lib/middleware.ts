import { NextResponse } from 'next/server';
import { getSession, SessionData } from './auth';
import prisma from './db';

/**
 * Require the user to be authenticated. Returns the session or a 401 response.
 */
export async function requireAuth(): Promise<{ session: SessionData } | NextResponse> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return { session };
}

/**
 * Require the user to have admin role. Returns the session or a 403 response.
 */
export async function requireAdmin(): Promise<{ session: SessionData } | NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  
  if (authResult.session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }
  return authResult;
}

/**
 * Check if a user has a specific permission.
 */
export function hasPermission(session: SessionData, permission: string): boolean {
  if (session.role === 'ADMIN') return true;
  return session.permissions[permission] === true;
}

/**
 * Require a specific permission. Returns session or 403 response.
 */
export async function requirePermission(permission: string): Promise<{ session: SessionData } | NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  
  if (!hasPermission(authResult.session, permission)) {
    return NextResponse.json(
      { error: `Forbidden: Missing permission '${permission}'` },
      { status: 403 }
    );
  }
  return authResult;
}

/**
 * CRITICAL: Build a team filter for database queries.
 * For team leaders, returns their team ID (server-derived, never from request params).
 * For admins, returns the requested team ID or undefined (all teams).
 */
export function getTeamFilter(session: SessionData, requestedTeamId?: number): { teamId?: number } {
  if (session.role === 'ADMIN') {
    // Admin can filter by any team or see all
    return requestedTeamId ? { teamId: requestedTeamId } : {};
  }
  
  // TEAM_LEADER: ALWAYS use session's team ID, ignore any request parameter
  return { teamId: session.teamId! };
}

/**
 * Verify that a student belongs to the user's team. Returns true or 403 response.
 */
export async function verifyStudentTeamAccess(
  session: SessionData,
  studentId: number
): Promise<boolean> {
  if (session.role === 'ADMIN') return true;
  
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { teamId: true },
  });
  
  if (!student) return false;
  return student.teamId === session.teamId;
}

/**
 * Create an audit log entry.
 */
export async function createAuditLog(
  userId: number | null,
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown>,
  ipAddress?: string
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      details: JSON.stringify(details),
      ipAddress: ipAddress || null,
    },
  });
}
