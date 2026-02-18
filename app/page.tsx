import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import StoreCards from '@/components/StoreCards';
import { siteContent } from '@/lib/site-content';

export default async function HomePage() {
  const services = await prisma.service.findMany({ where: { status: 'published' }, take: 6, orderBy: { price: 'asc' } });
  const cases = await prisma.case.findMany({ where: { status: 'published' }, take: 4, orderBy: { treatmentDate: 'desc' } });
  const faqs = await prisma.faq.findMany({ take: 6, orderBy: [{ category: 'asc' }, { sort: 'asc' }] });

  return (
    <main>
      <section className="hero">
        <div className="container hero-wrap">
          <div>
            <p className="badge">JE 心怡美顏館｜林季儀老師</p>
            <h1>{siteContent.hero.title}</h1>
            <p className="hero-sub">{siteContent.hero.subtitle}</p>
            <p className="hero-desc">{siteContent.hero.description}</p>
            <div className="cta-row">
              <a className="btn btn-primary" href="https://lin.ee" target="_blank">立即預約</a>
              <Link className="btn btn-secondary" href="/shop">立即購物</Link>
              <Link className="btn" href="/teaching">教學課程</Link>
            </div>
          </div>
          <div className="hero-panel card">
            <h3>品牌重點</h3>
            <ul>
              {siteContent.highlights.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="stats-grid">
          {siteContent.stats.map((s) => (
            <div key={s.label} className="card stat-card">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>服務亮點</h2>
          <p>透明價格，單次計費，問題肌一對一客製處理。</p>
        </div>
        <div className="grid cards-3">
          {services.map((s) => (
            <div className="card" key={s.id}>
              <h3>{s.name}</h3>
              <p className="muted">{s.category}</p>
              <p>{s.targetAudience}</p>
              <p><b>NT$ {s.price}</b> / 約 {s.durationMinutes} 分鐘</p>
              <Link href={`/services/${s.slug}`}>查看詳情 →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Before / After 案例</h2>
          <p>真實案例可依部位、膚況、門市篩選。</p>
        </div>
        <div className="grid cards-2">
          {cases.map((c) => (
            <div className="card" key={c.id}>
              <h3>{c.title}</h3>
              <p>{c.bodyPart}・{c.skinCondition}・{c.store}</p>
              <p>{c.summary}</p>
              <Link href={`/cases/${c.slug}`}>案例詳情 →</Link>
            </div>
          ))}
        </div>
      </section>

      <StoreCards />

      <section className="section container">
        <div className="section-head">
          <h2>常見問題 FAQ</h2>
          <p>付款、預約、術後保養一次看懂。</p>
        </div>
        <div className="grid cards-2">
          {faqs.map((f) => (
            <div className="card" key={f.id}>
              <p className="muted">{f.category}</p>
              <h3>{f.question}</h3>
              <p>{f.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
