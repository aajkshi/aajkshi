import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function CasesPage({ searchParams }: { searchParams: { bodyPart?: string; skinCondition?: string; store?: string } }) {
  const cases = await prisma.case.findMany({ where: { status: 'published', bodyPart: searchParams.bodyPart || undefined, skinCondition: searchParams.skinCondition || undefined, store: searchParams.store || undefined }, orderBy: [{ sort: 'asc' }, { treatmentDate: 'desc' }] });
  return <main className="container section"><h1>案例庫</h1><div className="grid cards-3">{cases.map(c => <div key={c.id} className="card"><h3>{c.title}</h3><p>{c.bodyPart} / {c.skinCondition}</p><p>{new Date(c.treatmentDate).toLocaleDateString('zh-TW')}</p><Link href={`/cases/${c.slug}`}>查看案例</Link></div>)}</div></main>;
}
