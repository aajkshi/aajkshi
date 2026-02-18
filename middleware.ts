import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeSession } from './lib/auth';

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname === '/admin/login') return NextResponse.next();
  const token = req.cookies.get('admin_session')?.value;
  const session = decodeSession(token);
  if (!session) return NextResponse.redirect(new URL('/admin/login', req.url));
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
