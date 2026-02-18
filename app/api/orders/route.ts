import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json(await prisma.order.findMany({ include: { customer: true, items: true }, orderBy: { id: 'desc' } }));
}
