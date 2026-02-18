import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  return NextResponse.json(await prisma.service.update({ where: { id: Number(params.id) }, data: body }));
}
