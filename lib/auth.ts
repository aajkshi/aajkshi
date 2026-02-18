import { cookies } from 'next/headers';
import { createHmac } from 'crypto';
import { prisma } from './prisma';

const COOKIE = 'admin_session';

function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'dev-secret';
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function encodeSession(payload: { userId: number; role: string }) {
  const raw = `${payload.userId}:${payload.role}`;
  return `${raw}.${sign(raw)}`;
}

export function decodeSession(token?: string | null) {
  if (!token) return null;
  const [raw, sig] = token.split('.');
  if (!raw || !sig || sign(raw) !== sig) return null;
  const [userId, role] = raw.split(':');
  return { userId: Number(userId), role };
}

export async function getCurrentUser() {
  const token = cookies().get(COOKIE)?.value;
  const sess = decodeSession(token);
  if (!sess) return null;
  return prisma.user.findUnique({ where: { id: sess.userId }, include: { role: true } });
}

export function requireRole(roleNames: string[]) {
  return getCurrentUser().then((user) => !!user && roleNames.includes(user.role.name));
}

export const sessionCookieName = COOKIE;
