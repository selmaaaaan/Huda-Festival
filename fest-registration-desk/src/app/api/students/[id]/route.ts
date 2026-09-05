import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth, requireAdmin, verifyStudentTeamAccess, createAuditLog } from '@/lib/middleware';

/**
 * GET /api/students/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { session } = authResult;
  const { id } = await params;
  const studentId = parseInt(id);

  // Team access check
  const hasAccess = await verifyStudentTeamAccess(session, studentId);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      team: true,
      registrations: {
        include: { program: true },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  return NextResponse.json({ student });
}

/**
 * PUT /api/students/[id] — Admin only: update student details (team, category, status)
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;
  const { session } = authResult;
  const { id } = await params;
  const studentId = parseInt(id);

  const body = await request.json();
  const { teamId, category, status } = body;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { team: true },
  });

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  const auditDetails: Record<string, unknown> = { studentAdNo: student.adNo };

  if (teamId !== undefined && teamId !== student.teamId) {
    const oldTeam = student.team?.name || 'None';
    const newTeam = await prisma.team.findUnique({ where: { id: teamId } });
    auditDetails.oldTeam = oldTeam;
    auditDetails.newTeam = newTeam?.name || 'None';
    updateData.teamId = teamId;
  }

  if (category !== undefined && category !== student.category) {
    auditDetails.oldCategory = student.category;
    auditDetails.newCategory = category;
    updateData.category = category;
  }

  if (status !== undefined && status !== student.status) {
    auditDetails.oldStatus = student.status;
    auditDetails.newStatus = status;
    updateData.status = status;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
  }

  const updated = await prisma.student.update({
    where: { id: studentId },
    data: updateData,
    include: { team: true },
  });

  // Audit log
  if (auditDetails.oldTeam) {
    await createAuditLog(session.userId, 'CHANGE_TEAM', 'Student', String(studentId), auditDetails);
  } else {
    await createAuditLog(session.userId, 'UPDATE_STUDENT', 'Student', String(studentId), auditDetails);
  }

  return NextResponse.json({ student: updated });
}
