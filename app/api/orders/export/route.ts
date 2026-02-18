import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const orders = await prisma.order.findMany({ include: { customer: true }, orderBy: { createdAt: 'desc' } });
  const header = ['orderNo', 'customerName', 'phone', 'total', 'status', 'shippingNo', 'createdAt'];
  const rows = orders.map((o) => [
    o.orderNo,
    o.customer.name,
    o.customer.phone,
    String(o.total),
    o.status,
    o.shippingNo || '',
    o.createdAt.toISOString()
  ]);
  const csv = [header, ...rows].map((row) => row.map((s) => `"${String(s).replaceAll('"', '""')}"`).join(',')).join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="orders.csv"'
    }
  });
}
