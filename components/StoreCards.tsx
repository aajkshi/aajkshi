import { siteContent } from '@/lib/site-content';

export default function StoreCards() {
  return (
    <section className="section container">
      <div className="section-head">
        <h2>門市資訊</h2>
        <p>高雄 / 台東雙據點，附停車與入樓方式。</p>
      </div>
      <div className="grid cards-2">
        {siteContent.stores.map((store) => (
          <article className="card" key={store.name}>
            <h3>{store.name}</h3>
            <p><b>地址：</b>{store.address}</p>
            <p><b>營業：</b>{store.hours}</p>
            <p><b>電話：</b>{store.phone}</p>
            <p><b>停車：</b>{store.parking}</p>
            <p><b>入樓：</b>{store.access}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
