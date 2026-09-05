import prisma from './db';

export interface BylawStatus {
  nonStageCount: number;
  stageCount: number;
  sportsCount: number;
  individualCount: number;
  groupCount: number;
  totalCount: number;
  status: string;
}

/**
 * Calculate bylaw status for a student based on their registrations.
 */
export async function calculateBylawStatus(studentId: number): Promise<BylawStatus> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { status: true },
  });

  if (!student || student.status !== 'Active') {
    return {
      nonStageCount: 0,
      stageCount: 0,
      sportsCount: 0,
      individualCount: 0,
      groupCount: 0,
      totalCount: 0,
      status: 'Inactive Student',
    };
  }

  const registrations = await prisma.registration.findMany({
    where: { studentId },
    include: { program: { select: { type: true, format: true } } },
  });

  const nonStageCount = registrations.filter(r => r.program.type === 'Non-Stage').length;
  const stageCount = registrations.filter(r => r.program.type === 'Stage').length;
  const sportsCount = registrations.filter(r => r.program.type === 'Sports').length;
  const individualCount = registrations.filter(r => r.program.format === 'Individual').length;
  const groupCount = registrations.filter(r => r.program.format === 'Group').length;
  const totalCount = registrations.length;

  let status: string;
  if (totalCount === 0) {
    status = 'Min 1 Required (Stage & Non-Stage)';
  } else if (stageCount === 0 || nonStageCount === 0) {
    status = 'Min 1 Required (Stage & Non-Stage)';
  } else {
    status = 'Compliant';
  }

  return {
    nonStageCount,
    stageCount,
    sportsCount,
    individualCount,
    groupCount,
    totalCount,
    status,
  };
}

/**
 * Parse a quota string into numeric values.
 * "2" → { totalSlots: 2, groupSize: 1 }
 * "1*7" → { totalSlots: 7, groupSize: 7 }
 * "-" → { totalSlots: Infinity, groupSize: 1 }
 */
export function parseQuota(quota: string): { totalSlots: number; groupSize: number } {
  if (quota === '-' || quota === '' || quota === null || quota === undefined) {
    return { totalSlots: Infinity, groupSize: 1 };
  }
  
  const groupMatch = quota.match(/^(\d+)\*(\d+)$/);
  if (groupMatch) {
    const groups = parseInt(groupMatch[1], 10);
    const size = parseInt(groupMatch[2], 10);
    return { totalSlots: groups * size, groupSize: size };
  }
  
  const num = parseInt(quota, 10);
  if (!isNaN(num)) {
    return { totalSlots: num, groupSize: 1 };
  }
  
  return { totalSlots: Infinity, groupSize: 1 };
}

/**
 * Check if a student is eligible for a program based on category.
 */
export function isEligible(studentCategory: string, eligibleCategory: string): boolean {
  if (!eligibleCategory) return true;
  
  // Handle compound eligibility like "ʿĀLIYAH + THĀNAWIYYAH"
  const eligible = eligibleCategory.split('+').map(c => c.trim());
  return eligible.includes(studentCategory);
}

/**
 * Validate whether a registration can be added.
 * Returns null if valid, or an error message string if not.
 */
export async function validateRegistration(
  studentId: number,
  programId: number,
  teamId: number
): Promise<string | null> {
  // Fetch student + program
  const [student, program] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.program.findUnique({ where: { id: programId } }),
  ]);

  if (!student) return 'Student not found';
  if (!program) return 'Program not found';
  if (student.status !== 'Active') return 'Student is inactive';
  if (program.status !== 'Active') return 'Program is inactive';
  if (student.teamId !== teamId) return 'Student does not belong to your team';

  // Category eligibility
  if (!isEligible(student.category, program.eligibleCategory)) {
    return `Student category "${student.category}" is not eligible for this program (requires "${program.eligibleCategory}")`;
  }

  // Check if already registered
  const existing = await prisma.registration.findUnique({
    where: { studentId_programId: { studentId, programId } },
  });
  if (existing) return 'Student is already registered for this program';

  // Team quota check: count existing registrations for this program by students in this team
  const { totalSlots } = parseQuota(program.quota);
  if (totalSlots !== Infinity) {
    const currentCount = await prisma.registration.count({
      where: {
        programId,
        student: { teamId },
      },
    });
    if (currentCount >= totalSlots) {
      return `Team quota exceeded for program "${program.code}" (${currentCount}/${totalSlots})`;
    }
  }

  return null; // Valid
}
