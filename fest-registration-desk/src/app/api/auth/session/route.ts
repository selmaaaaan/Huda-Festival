import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ isLoggedIn: false }, { status: 401 });
  }
  return NextResponse.json({
    isLoggedIn: true,
    user: {
      id: session.userId,
      username: session.username,
      displayName: session.displayName,
      role: session.role,
      teamId: session.teamId,
      teamName: session.teamName,
      permissions: session.permissions,
    },
  });
}
