import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) return { title: '商品不存在' };
  return { title: p.name, description: p.description, openGraph: { title: p.name, description: p.description } };
}

export default async function ProductDetail({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug }, include: { images: true } });
  if (!p || p.status !== 'published') notFound();
  return <main className="container section"><h1>{p.name}</h1><div className="card grid" style={{gap:8}}>{p.images[0] && <img src={p.images[0].url} alt={p.name} style={{width:'100%',maxWidth:400,borderRadius:10}} />}<p>{p.description}</p><p>售價 NT$ {p.price}</p><p>庫存 {p.stock}</p><p>運送方式：宅配 / 超取（可擴充）</p><p>注意事項：請置於陰涼處。</p><AddToCartButton product={{ id: p.id, name: p.name, price: p.price }} /></div></main>;
}
