import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission, verifyStudentTeamAccess, createAuditLog } from '@/lib/middleware';
import { validateRegistration } from '@/lib/bylaw-engine';

/**
 * POST /api/registrations
 * Creates a new registration or deletes an existing one (toggle behavior).
 */
export async function POST(request: NextRequest) {
  // Require EDIT_REGISTRATIONS permission
  const authResult = await requirePermission('EDIT_REGISTRATIONS');
  if (authResult instanceof NextResponse) return authResult;
  const { session } = authResult;

  const body = await request.json();
  const { studentId, programId, action, topic } = body; // action: 'REGISTER' or 'UNREGISTER'

  if (!studentId || !programId || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Verify user can access this student
  const hasAccess = await verifyStudentTeamAccess(session, studentId);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: You do not have access to this student' }, { status: 403 });
  }

  // 2. Fetch student and program to get context for audit log
  const [student, program] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.program.findUnique({ where: { id: programId } }),
  ]);

  if (!student || !program) {
    return NextResponse.json({ error: 'Student or Program not found' }, { status: 404 });
  }

  const existingReg = await prisma.registration.findUnique({
    where: { studentId_programId: { studentId, programId } },
  });

  if (action === 'REGISTER') {
    if (existingReg) {
      return NextResponse.json({ message: 'Already registered' }, { status: 200 });
    }

    // 3. Bylaw and Quota Validation
    const validationError = await validateRegistration(studentId, programId, student.teamId!, topic);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // 4. Create registration in a transaction to prevent race conditions
    try {
      const reg = await prisma.$transaction(async (tx) => {
        // Re-check quota inside transaction
        const vError = await validateRegistration(studentId, programId, student.teamId!, topic);
        if (vError) throw new Error(vError);

        return await tx.registration.create({
          data: {
            studentId,
            programId,
            topic: topic || null,
            createdBy: session.userId,
          },
        });
      });

      // Audit log
      await createAuditLog(session.userId, 'REGISTER', 'Registration', String(reg.id), {
        studentAdNo: student.adNo,
        programCode: program.code,
        topic: topic || null,
      });

      return NextResponse.json({ success: true, registration: reg });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Failed to register' }, { status: 400 });
    }
  } 
  
  else if (action === 'UNREGISTER') {
    if (!existingReg) {
      return NextResponse.json({ message: 'Not registered' }, { status: 200 });
    }

    await prisma.registration.delete({
      where: { id: existingReg.id },
    });

    // Audit log
    await createAuditLog(session.userId, 'UNREGISTER', 'Registration', String(existingReg.id), {
      studentAdNo: student.adNo,
      programCode: program.code,
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
