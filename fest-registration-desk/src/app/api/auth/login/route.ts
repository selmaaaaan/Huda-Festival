import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, verifyPassword } from '@/lib/auth';
import { createAuditLog } from '@/lib/middleware';

// Rate limiting: simple in-memory store
const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Rate limiting
    const now = Date.now();
    const attempts = loginAttempts[username];
    if (attempts && attempts.count >= 5 && now - attempts.lastAttempt < 15 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      include: { team: true },
    });

    if (!user || !user.isActive) {
      // Track failed attempt
      loginAttempts[username] = {
        count: (attempts?.count || 0) + 1,
        lastAttempt: now,
      };
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      loginAttempts[username] = {
        count: (attempts?.count || 0) + 1,
        lastAttempt: now,
      };
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Reset rate limiting on success
    delete loginAttempts[username];

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    session.displayName = user.displayName;
    session.role = user.role as 'ADMIN' | 'TEAM_LEADER';
    session.teamId = user.teamId;
    session.teamName = user.team?.name || null;
    session.permissions = JSON.parse(user.permissions || '{}');
    session.isLoggedIn = true;
    await session.save();

    // Audit log
    await createAuditLog(user.id, 'LOGIN', 'User', String(user.id), {
      username: user.username,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        teamId: user.teamId,
        teamName: user.team?.name,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
