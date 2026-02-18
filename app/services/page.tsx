import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ where: { status: 'published' }, orderBy: { id: 'asc' } });
  return <main className="container section"><h1>服務項目</h1><div className="grid cards-3">{services.map(s => <div key={s.id} className="card"><h3>{s.name}</h3><p>{s.targetAudience}</p><p>NT$ {s.price}</p><Link href={`/services/${s.slug}`}>詳情</Link></div>)}</div></main>;
}
