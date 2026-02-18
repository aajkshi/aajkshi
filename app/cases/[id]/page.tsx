import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const c = await prisma.case.findUnique({ where: { slug: params.id } });
  if (!c) return { title: '案例不存在' };
  return { title: c.seoTitle || c.title, description: c.seoDescription || c.summary, openGraph: { title: c.seoTitle || c.title, description: c.seoDescription || c.summary } };
}

export default async function CaseDetail({ params }: { params: { id: string } }) {
  const c = await prisma.case.findUnique({ where: { slug: params.id }, include: { images: true } });
  if (!c || c.status !== 'published') notFound();
  return <main className="container section"><h1>{c.title}</h1><div className="card"><p>{c.summary}</p><p><b>處理重點：</b>{c.treatmentFocus}</p><p><b>術後衛教：</b>{c.aftercare}</p><p>匿名顯示：{c.isAnonymous ? '是' : '否'}</p><div className="grid cards-3">{c.images.map(img => <img key={img.id} src={img.url} alt={img.phase} style={{width:'100%',borderRadius:10}} />)}</div></div></main>;
}
