import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const studentsRaw = await prisma.student.findMany({
      where: { status: 'Active' },
      include: {
        team: true
      }
    });

    const registrationsRaw = await prisma.registration.findMany({
      include: {
        student: true,
        program: true
      }
    });

    const students = studentsRaw.map(s => ({
      adNo: s.adNo,
      category: s.category,
      teamCode: s.team?.code || 'UNKNOWN'
    }));

    const registrations = registrationsRaw.map(r => ({
      adNo: r.student.adNo,
      programCode: r.program.code,
      topic: r.topic || null
    }));

    return NextResponse.json({
      students,
      registrations
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
