import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyLineNewOrder } from '@/lib/line';

function genOrderNo() { return `JE${Date.now().toString().slice(-8)}`; }

export async function POST(req: Request) {
  const { form, items, paymentMethod, shippingFee = 0 } = await req.json();
  if (!form?.name || !form?.phone || !Array.isArray(items) || items.length === 0) return NextResponse.json({ error: '資料不足' }, { status: 400 });

  const subtotal = items.reduce((acc: number, it: any) => acc + it.price * it.qty, 0);
  const total = subtotal + Number(shippingFee || 0);
  const customer = await prisma.customer.create({ data: { name: form.name, phone: form.phone, email: form.email || null, address: form.address || '', note: form.note || '' } });
  const orderNo = genOrderNo();
  const order = await prisma.order.create({
    data: {
      orderNo,
      customerId: customer.id,
      paymentMethod,
      total,
      shippingFee: Number(shippingFee || 0),
      status: 'pending_payment',
      items: { create: items.map((it: any) => ({ productId: it.id, quantity: it.qty, unitPrice: it.price })) }
    },
    include: { items: true }
  });

  await notifyLineNewOrder([
    `🧾 新訂單 ${order.orderNo}`,
    `客戶：${form.name} / ${form.phone}`,
    `付款：${paymentMethod}`,
    ...items.map((i: any) => `- ${i.name} x${i.qty} = ${i.price * i.qty}`),
    `小計：NT$ ${subtotal}`,
    `運費：NT$ ${Number(shippingFee || 0)}`,
    `總額：NT$ ${total}`,
    form.note ? `備註：${form.note}` : ''
  ].filter(Boolean).join('\n'));

  return NextResponse.json({ ok: true, orderNo });
}
