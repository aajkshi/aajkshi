import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [orders, products, cases] = await Promise.all([
    prisma.order.count(), prisma.product.count(), prisma.case.count()
  ]);
  return NextResponse.json({ orders, products, cases });
}
