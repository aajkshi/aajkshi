import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function ShopPage() {
  const products = await prisma.product.findMany({ where: { status: 'published' }, include: { images: { take: 1 }, category: true } });
  return <main className="container section"><h1>線上商城</h1><div className="grid cards-3">{products.map(p => <div className="card" key={p.id}>{p.images[0] ? <img src={p.images[0].url} alt={p.name} style={{width:'100%',borderRadius:10}} />:null}<h3>{p.name}</h3><p>{p.category.name}</p><p>NT$ {p.price}</p><Link href={`/shop/${p.slug}`}>查看商品</Link></div>)}</div></main>;
}
