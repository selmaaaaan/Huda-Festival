import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Read Excel workbook
  const workbookPath = path.join(__dirname, '..', 'data', 'SHIA ARTS FEST 2026.xlsx');
  console.log('📖 Reading Excel:', workbookPath);
  const workbook = XLSX.readFile(workbookPath);

  // ============ 1. Create Teams ============
  console.log('\n📋 Creating teams...');
  const teamNames = ['TEAM A', 'TEAM B', 'TEAM C', 'TEAM D'];
  const teams: Record<string, number> = {};

  for (const name of teamNames) {
    const team = await prisma.team.upsert({
      where: { name },
      update: {},
      create: { name, code: name.replace('TEAM ', '') },
    });
    teams[name] = team.id;
    console.log(`  ✅ ${name} (id: ${team.id})`);
  }

  // ============ 2. Create Users ============
  console.log('\n👤 Creating users...');

  // Admin
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminChangeMe123!';
  const adminHash = await bcrypt.hash(adminPassword, 12);
  
  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash: adminHash,
      displayName: 'Administrator',
      role: 'ADMIN',
      teamId: null,
      mustChangePassword: true,
      permissions: JSON.stringify({}), // Admin has all permissions by default
    },
  });
  console.log(`  ✅ Admin: ${adminUsername}`);

  // Team Leaders
  const teamLeaderConfig = [
    { env: 'TEAM_A', team: 'TEAM A', display: 'Team A Leader' },
    { env: 'TEAM_B', team: 'TEAM B', display: 'Team B Leader' },
    { env: 'TEAM_C', team: 'TEAM C', display: 'Team C Leader' },
    { env: 'TEAM_D', team: 'TEAM D', display: 'Team D Leader' },
  ];

  const defaultPerms = JSON.stringify({
    VIEW_STUDENTS: true,
    VIEW_REGISTRATIONS: true,
    EDIT_REGISTRATIONS: true,
    VIEW_PROGRAMS: true,
    VIEW_COMPLIANCE: true,
    EDIT_STUDENTS: false,
    CHANGE_TEAMS: false,
    MANAGE_PROGRAMS: false,
    MANAGE_USERS: false,
    IMPORT_DATA: false,
    EXPORT_ALL_DATA: false,
    EXPORT_TEAM_DATA: true,
    VIEW_AUDIT_LOG: false,
  });

  for (const cfg of teamLeaderConfig) {
    const username = process.env[`${cfg.env}_USERNAME`] || `team_${cfg.env.split('_')[1].toLowerCase()}`;
    const password = process.env[`${cfg.env}_PASSWORD`] || `ChangeMe${cfg.env.split('_')[1]}123!`;
    const hash = await bcrypt.hash(password, 12);

    await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        passwordHash: hash,
        displayName: cfg.display,
        role: 'TEAM_LEADER',
        teamId: teams[cfg.team],
        mustChangePassword: true,
        permissions: defaultPerms,
      },
    });
    console.log(`  ✅ ${cfg.display}: ${username}`);
  }

  // ============ 3. Import Programs from PROGRAM_DIRECTORY ============
  console.log('\n📚 Importing programs...');
  const pdSheet = workbook.Sheets['PROGRAM_DIRECTORY'];
  const pdData = XLSX.utils.sheet_to_json<Record<string, unknown>>(pdSheet);
  
  let programCount = 0;
  for (const row of pdData) {
    const code = String(row['Code'] || '').trim();
    if (!code) continue;

    await prisma.program.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name: String(row['Name'] || ''),
        category: String(row['Category'] || ''),
        type: String(row['Type'] || ''),
        format: String(row['Format'] || 'Individual'),
        quota: String(row['Quota'] ?? '2'),
        groupSize: Number(row['Group Size']) || 1,
        maxParticipants: Number(row['Max Participants']) || 1,
        eligibleCategory: String(row['Eligible Category'] || ''),
        status: String(row['Status'] || 'Active'),
      },
    });
    programCount++;
  }
  console.log(`  ✅ ${programCount} programs imported`);

  // ============ 4. Import Students from TEAM sheet ============
  console.log('\n🎓 Importing students...');
  const teamSheet = workbook.Sheets['TEAM'];
  const teamData = XLSX.utils.sheet_to_json<Record<string, unknown>>(teamSheet);

  let studentCount = 0;
  let coordinatorCount = 0;
  
  for (const row of teamData) {
    const adNo = Number(row['AD NO']);
    const name = String(row['NAME'] || '').trim();
    const teamName = String(row['TEAM'] || '').trim();
    const cls = Number(row['CLASS']) || 0;
    const category = String(row['CATEGARY'] || '').trim();

    if (!adNo || !name) continue;

    const teamId = teams[teamName] || null;
    if (!teamId && teamName !== 'COORDINATOR') {
      console.warn(`  ⚠️ Unknown team "${teamName}" for student ${adNo} ${name}`);
    }
    
    if (teamName === 'COORDINATOR') {
      coordinatorCount++;
    }

    await prisma.student.upsert({
      where: { adNo },
      update: {},
      create: {
        adNo,
        name,
        class: cls,
        category,
        teamId,
        status: category === 'COORDINATOR' ? 'Coordinator' : 'Active',
      },
    });
    studentCount++;
  }
  console.log(`  ✅ ${studentCount} students imported (${coordinatorCount} coordinators)`);

  // ============ 5. Summary ============
  const totalTeams = await prisma.team.count();
  const totalUsers = await prisma.user.count();
  const totalStudents = await prisma.student.count();
  const totalPrograms = await prisma.program.count();
  const totalRegs = await prisma.registration.count();

  console.log('\n🎉 Seed complete!');
  console.log(`  Teams: ${totalTeams}`);
  console.log(`  Users: ${totalUsers}`);
  console.log(`  Students: ${totalStudents}`);
  console.log(`  Programs: ${totalPrograms}`);
  console.log(`  Registrations: ${totalRegs}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
