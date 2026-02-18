import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await prisma.service.findUnique({ where: { slug: params.slug } });
  if (!service) return { title: '服務不存在' };
  return { title: service.seoTitle || service.name, description: service.seoDescription || service.targetAudience, openGraph: { title: service.seoTitle || service.name, description: service.seoDescription || service.targetAudience } };
}

export default async function ServiceDetail({ params }: { params: { slug: string } }) {
  const service = await prisma.service.findUnique({ where: { slug: params.slug } });
  if (!service || service.status !== 'published') notFound();
  return <main className="container section"><h1>{service.name}</h1><div className="card grid" style={{gap:8}}><p><b>適合對象：</b>{service.targetAudience}</p><p><b>流程：</b>{service.process}</p><p><b>時間：</b>{service.durationMinutes} 分鐘</p><p><b>價格：</b>NT$ {service.price}</p><p><b>注意事項：</b>{service.precautions}</p><p><b>FAQ：</b>{service.faq}</p><a className="btn btn-primary" href="https://lin.ee" target="_blank">立即預約</a></div></main>;
}
