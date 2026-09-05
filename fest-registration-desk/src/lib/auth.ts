import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Session data shape
export interface SessionData {
  userId: number;
  username: string;
  displayName: string;
  role: 'ADMIN' | 'TEAM_LEADER';
  teamId: number | null;
  teamName: string | null;
  permissions: Record<string, boolean>;
  isLoggedIn: boolean;
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'fest-shia-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Default permissions for team leaders
export const DEFAULT_TEAM_LEADER_PERMISSIONS: Record<string, boolean> = {
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
};

// Admin has everything
export const ADMIN_PERMISSIONS: Record<string, boolean> = {
  VIEW_STUDENTS: true,
  VIEW_REGISTRATIONS: true,
  EDIT_REGISTRATIONS: true,
  VIEW_PROGRAMS: true,
  VIEW_COMPLIANCE: true,
  EDIT_STUDENTS: true,
  CHANGE_TEAMS: true,
  MANAGE_PROGRAMS: true,
  MANAGE_USERS: true,
  IMPORT_DATA: true,
  EXPORT_ALL_DATA: true,
  EXPORT_TEAM_DATA: true,
  VIEW_AUDIT_LOG: true,
};
