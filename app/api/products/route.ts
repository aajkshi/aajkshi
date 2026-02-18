import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json(await prisma.product.findMany({ include: { category: true, images: true }, orderBy: { id: 'desc' } }));
}

export async function POST(req: Request) {
  const body = await req.json();
  const product = await prisma.product.create({ data: { ...body, status: 'published', images: { create: [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80' }] }, inventory: { create: { change: body.stock || 0, reason: 'create' } } } });
  return NextResponse.json(product);
}
