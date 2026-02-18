const DATA = {
  services: [
    { id:'s1', category:'無痛清粉刺', name:'JE無痛清粉刺＋藻針', audience:'黑頭/閉鎖粉刺/毛孔堵塞', process:'卸洗→軟化→無痛針清→鎮定', duration:120, price:2000, precautions:'24小時避免酸類，48小時加強保濕。', faq:'可加購外泌體、泥膜。' },
    { id:'s2', category:'問題肌處理', name:'MTS皮膚管理', audience:'痘疤/毛孔粗大/膚理不平', process:'評估→清潔→MTS→修護', duration:90, price:2000, precautions:'術後防曬與保濕。', faq:'建議2-4週一次。' },
    { id:'s3', category:'晶亮喚采療程', name:'晶亮喚采療程', audience:'暗沉/上鏡需求', process:'代謝→導入→修護膜', duration:45, price:2500, precautions:'當天避免曝曬。', faq:'可作為拍攝前保養。' },
    { id:'s4', category:'特別療程', name:'棘皮/肚臍清潔/艾草溫罐', audience:'局部問題清潔與放鬆', process:'客製評估→局部施作→衛教', duration:30, price:800, precautions:'依部位避免摩擦。', faq:'可搭配臉部療程。' },
    { id:'s5', category:'熱蠟除毛', name:'熱蠟除毛（含VIO）', audience:'在意毛髮與私密清潔', process:'清潔→隔離→熱蠟→鎮定', duration:60, price:2000, precautions:'72小時避免高溫與摩擦。', faq:'孕媽咪可先諮詢評估。' }
  ],
  products: [
    { id:'p1', category:'正貨', name:'JE 胺基酸溫和潔顏霜', price:880, stock:60, desc:'敏弱肌友善，術後可用。' },
    { id:'p2', category:'正貨', name:'JE 玻尿酸保濕精華液', price:1680, stock:32, desc:'高效補水，提升肌膚穩定。' },
    { id:'p3', category:'沙貨', name:'JE 舒緩修護凍膜（沙龍版）', price:2200, stock:20, desc:'大容量沙貨，術後退紅急救。' },
    { id:'p4', category:'院線品', name:'JE 外泌體修護安瓶', price:3600, stock:15, desc:'高階修護配方，問題肌專用。' }
  ],
  cases: [
    { id:'c1', title:'鼻頭黑頭粉刺改善', bodyPart:'鼻頭', skin:'黑頭', store:'高雄', date:'2025-01-10', summary:'單次清除大量角栓，毛孔視覺乾淨。', focus:'軟化角栓＋分區施作。', care:'48小時內加強保濕、防曬。', anon:true },
    { id:'c2', title:'人中敏感區痘痘處理', bodyPart:'人中', skin:'丘疹', store:'台東', date:'2024-09-22', summary:'敏感區減痛處理，降低二次刺激。', focus:'減壓手法＋抗發炎修護。', care:'避免摳抓、刺激保養。', anon:true },
    { id:'c3', title:'耳朵粉刺清潔', bodyPart:'耳朵', skin:'毛孔堵塞', store:'高雄', date:'2024-12-03', summary:'耳廓死角清潔，視覺改善明顯。', focus:'細節角度與溫和清潔。', care:'保持乾燥，避免搔抓。', anon:true }
  ],
  stores: [
    { name:'高雄心怡美顏館', address:'高雄市三民區春陽街48-1號22樓', hours:'09:00-12:00 / 14:00-18:00（週二、四休）', parking:'花苑汽車旅館對面付費停車場。', access:'一樓管理室登記換磁扣上樓。', phone:'07-395-8887' },
    { name:'台東心怡美顏館', address:'台東市衡陽路151巷42弄8號', hours:'09:00-12:00 / 14:00-18:00（週二、四休）', parking:'門口機車，汽車停巷口。', access:'Google map 搜尋台東心怡美顏館。', phone:'089-330366' }
  ],
  faqs: [
    { q:'清粉刺會痛嗎？', a:'以無痛手法施作，大多客戶可接受。' },
    { q:'如何預約？', a:'建議以 LINE OA 預約，回覆最快。' },
    { q:'可刷卡嗎？', a:'MVP 階段先提供匯款/轉帳。' },
    { q:'運費規則？', a:'滿 NT$3000 免運，未滿 NT$100。' }
  ]
};

const S = {
  products: load('je_products', DATA.products),
  services: load('je_services', DATA.services),
  cases: load('je_cases', DATA.cases),
  orders: load('je_orders', []),
  cart: load('je_cart', [])
};

function load(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch{ return fallback; } }
function save(key,val){ localStorage.setItem(key, JSON.stringify(val)); }
function money(n){ return `NT$ ${Number(n).toLocaleString('zh-TW')}`; }
function qs(s){ return document.querySelector(s); }
function qsa(s){ return Array.from(document.querySelectorAll(s)); }

function boot(){
  renderHome(); renderServices(); renderCases(); renderShop(); renderStores(); renderFaq(); renderCartMini();

  qsa('[data-tab]').forEach(btn=> btn.addEventListener('click', ()=>switchTab(btn.dataset.tab)));
  qs('#btnLine').addEventListener('click', ()=> window.open('https://lin.ee', '_blank'));
  qs('#checkoutForm').addEventListener('submit', onCheckout);
  qs('#gotoCheckout').addEventListener('click', ()=>switchTab('checkout'));
  qs('#filterService').addEventListener('change', renderServices);
  qs('#filterCaseBody').addEventListener('change', renderCases);
  qs('#filterCaseSkin').addEventListener('change', renderCases);
  qs('#filterCaseStore').addEventListener('change', renderCases);
  qs('#filterShop').addEventListener('change', renderShop);

  const url = new URL(location.href);
  if (url.searchParams.get('page') === 'admin') location.href = 'admin.html';
}

function switchTab(id){
  qsa('section[data-page]').forEach(p=>p.classList.add('hidden'));
  qs(`#page-${id}`).classList.remove('hidden');
  window.scrollTo({top:0, behavior:'smooth'});
}

function renderHome(){
  qs('#homeServiceCount').textContent = S.services.length;
  qs('#homeCaseCount').textContent = S.cases.length;
  qs('#homeProductCount').textContent = S.products.length;
}

function renderServices(){
  const c = qs('#servicesList'); c.innerHTML='';
  const f = qs('#filterService').value;
  const list = f==='all'?S.services:S.services.filter(x=>x.category===f);
  list.forEach(s=>{
    c.insertAdjacentHTML('beforeend', `<article class="card"><div class="tag">${s.category}</div><h3>${s.name}</h3><p class="muted">適合：${s.audience}</p><p>流程：${s.process}</p><p><b>${money(s.price)}</b> / ${s.duration} 分鐘</p><p class="muted">注意事項：${s.precautions}</p><p class="muted">FAQ：${s.faq}</p><div class="cta"><button class="btn primary" onclick="window.open('https://lin.ee','_blank')">立即預約</button></div></article>`);
  });
}

function renderCases(){
  const c = qs('#casesList'); c.innerHTML='';
  const b = qs('#filterCaseBody').value;
  const sk = qs('#filterCaseSkin').value;
  const st = qs('#filterCaseStore').value;
  const list = S.cases.filter(x=>(b==='all'||x.bodyPart===b)&&(sk==='all'||x.skin===sk)&&(st==='all'||x.store===st));
  list.forEach(x=>{
    c.insertAdjacentHTML('beforeend', `<article class="card"><div class="toolbar"><span class="tag">${x.bodyPart}</span><span class="tag">${x.skin}</span><span class="tag">${x.store}</span></div><h3>${x.title}</h3><p class="muted">日期：${x.date}</p><p>${x.summary}</p><p><b>處理重點：</b>${x.focus}</p><p><b>術後衛教：</b>${x.care}</p><p class="muted">匿名：${x.anon?'是':'否'}</p></article>`);
  });
}

function renderShop(){
  const c = qs('#shopList'); c.innerHTML='';
  const f = qs('#filterShop').value;
  const list = f==='all'?S.products:S.products.filter(x=>x.category===f);
  list.forEach(p=>{
    c.insertAdjacentHTML('beforeend', `<article class="card"><div class="tag">${p.category}</div><h3>${p.name}</h3><p>${p.desc}</p><p>庫存：${p.stock}</p><p><b>${money(p.price)}</b></p><button class="btn dark" onclick="addToCart('${p.id}')">加入購物車</button></article>`);
  });
}

function addToCart(id){
  const p=S.products.find(x=>x.id===id); if(!p) return;
  const e=S.cart.find(x=>x.id===id);
  if(e) e.qty += 1; else S.cart.push({...p, qty:1});
  save('je_cart',S.cart); renderCartMini(); alert('已加入購物車');
}

function renderCartMini(){
  const c=qs('#cartList'); c.innerHTML='';
  if(S.cart.length===0){ c.innerHTML='<p class="muted">購物車目前為空。</p>'; qs('#cartSum').textContent=money(0); return; }
  S.cart.forEach(it=>{
    c.insertAdjacentHTML('beforeend', `<div class="card"><div class="kv"><strong>${it.name}</strong><span>${money(it.price*it.qty)}</span></div><div class="toolbar"><button class="btn" onclick="qty('${it.id}',-1)">-</button><input value="${it.qty}" readonly style="width:70px"><button class="btn" onclick="qty('${it.id}',1)">+</button><button class="btn" onclick="delItem('${it.id}')">刪除</button></div></div>`)
  });
  const sub=S.cart.reduce((a,b)=>a+b.price*b.qty,0), ship=sub>=3000||sub===0?0:100; qs('#cartSum').textContent=money(sub+ship);
}
function qty(id,d){ const it=S.cart.find(x=>x.id===id); if(!it)return; it.qty=Math.max(1,it.qty+d); save('je_cart',S.cart); renderCartMini(); }
function delItem(id){ S.cart=S.cart.filter(x=>x.id!==id); save('je_cart',S.cart); renderCartMini(); }

function onCheckout(e){
  e.preventDefault();
  if(S.cart.length===0){ alert('購物車為空'); return; }
  const fd=new FormData(e.target);
  const sub=S.cart.reduce((a,b)=>a+b.price*b.qty,0), ship=sub>=3000?0:100, total=sub+ship;
  const order={
    id:`JE${Date.now().toString().slice(-8)}`,
    status:'pending_payment',
    paymentMethod:'bank_transfer',
    shippingFee:ship,
    total,
    createdAt:new Date().toISOString(),
    customer:{name:fd.get('name'),phone:fd.get('phone'),email:fd.get('email'),address:fd.get('address'),note:fd.get('note')},
    items:S.cart.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price}))
  };
  S.orders.unshift(order); save('je_orders',S.orders); S.cart=[]; save('je_cart',S.cart); renderCartMini();
  qs('#orderSuccess').innerHTML = `<div class='notice'><b>訂單成立：</b>${order.id}<br>狀態：待付款<br>總額：${money(total)}（含運費 ${money(ship)}）<br>請於 24 小時內匯款並回報後五碼。</div>`;
  switchTab('order-success');
}

function renderStores(){
  qs('#stores').innerHTML = DATA.stores.map(s=>`<article class='card'><h3>${s.name}</h3><p><b>地址：</b>${s.address}</p><p><b>營業：</b>${s.hours}</p><p><b>電話：</b>${s.phone}</p><p><b>停車：</b>${s.parking}</p><p><b>入樓：</b>${s.access}</p></article>`).join('');
}
function renderFaq(){ qs('#faq').innerHTML = DATA.faqs.map(f=>`<article class='card'><h3>${f.q}</h3><p>${f.a}</p></article>`).join(''); }

window.addToCart = addToCart; window.qty=qty; window.delItem=delItem;
window.addEventListener('DOMContentLoaded', boot);
