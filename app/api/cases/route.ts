import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json(await prisma.case.findMany({ include: { images: true }, orderBy: [{ sort: 'asc' }, { id: 'desc' }] }));
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json(await prisma.case.create({ data: { ...body, status: 'published', treatmentDate: new Date(body.treatmentDate), images: { create: [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', phase: 'before' }, { url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80', phase: 'after' }] } } }));
}
