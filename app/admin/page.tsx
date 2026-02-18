import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const [todayOrders, unpaid, toShip, revenue, hotProducts] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: 'pending_payment' } }),
    prisma.order.count({ where: { status: 'paid' } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 })
  ]);
  return <main className="container section"><h1>Dashboard</h1><div className="grid cards-3"><div className="card">今日訂單：{todayOrders}</div><div className="card">未付款：{unpaid}</div><div className="card">待出貨：{toShip}</div><div className="card">營收總和：NT$ {revenue._sum.total||0}</div><div className="card">熱門商品筆數：{hotProducts.length}</div></div><div style={{marginTop:16,display:'flex',gap:10}}><Link href="/admin/orders">訂單管理</Link><Link href="/admin/products">商品管理</Link><Link href="/admin/cases">案例管理</Link><Link href="/admin/services">服務頁管理</Link></div></main>;
}
