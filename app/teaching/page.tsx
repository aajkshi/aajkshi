import { siteContent } from '@/lib/site-content';

export default function TeachingPage() {
  return (
    <main className="container section">
      <section className="card" style={{ marginBottom: 18 }}>
        <p className="badge">創業培訓</p>
        <h1>{siteContent.teaching.heading}</h1>
        <p>{siteContent.teaching.intro}</p>
        <a className="btn btn-primary" href="https://lin.ee" target="_blank">諮詢課程</a>
      </section>

      <section className="grid cards-2">
        <article className="card">
          <h2>課程重點</h2>
          <ul>
            {siteContent.teaching.modules.map((module) => <li key={module}>{module}</li>)}
          </ul>
        </article>
        <article className="card">
          <h2>適合對象</h2>
          <p>欲轉職美業者、皮膚管理工作者、想升級問題肌處理能力的既有從業者。</p>
          <h3>訓後支援</h3>
          <p>提供回學制度、群組問答、教學素材與產品導入建議。</p>
        </article>
      </section>
    </main>
  );
}
