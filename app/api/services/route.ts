import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json(await prisma.service.findMany({ orderBy: { id: 'desc' } }));
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json(await prisma.service.create({ data: { ...body, status: 'published' } }));
}
