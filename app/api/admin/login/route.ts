import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { encodeSession, sessionCookieName } from '@/lib/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: 'Invalid' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName, encodeSession({ userId: user.id, role: user.role.name }), { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
