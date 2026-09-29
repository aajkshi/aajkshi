/* Demonstration data only. No accounts, authentication or production APIs. */
(() => {
  'use strict';
  const key='navlynx.android16.notice.demo.v1';
  const clone=v=>JSON.parse(JSON.stringify(v));
  const seed={enabled:true,severity:'warning',title:'車款相容性提醒｜部分車款請暫緩升級',intro:'目前部分車款與 Android 16 仍有相容性狀況。為了讓您維持穩定的使用體驗，以下品牌車款請先暫緩升級：',brands:['MG','Peugeot','Citroen'],closing:'待完成相容性確認並開放支援後，我們會立即於官網發布公告。感謝您的理解與耐心等候。'};
  function valid(n){return n&&typeof n.enabled==='boolean'&&['warning','info'].includes(n.severity)&&['title','intro','closing'].every(k=>typeof n[k]==='string'&&n[k].trim()&&n[k].length<=({title:90,intro:800,closing:600}[k])&&!/[<>\x00-\x1f\x7f]/.test(n[k]))&&Array.isArray(n.brands)&&n.brands.length<=30&&n.brands.every(b=>typeof b==='string'&&b.trim()&&b.length<=60&&!/[<>\x00-\x1f\x7f]/.test(b))}
  function initial(){const at=new Date().toISOString();return {published:clone(seed),draft:clone(seed),revision:1,draftRevision:1,publishedAt:at,versions:[{revision:1,notice:clone(seed),at,actor:'展示初始資料'}],audit:[]}}
  function load(){try{const s=JSON.parse(localStorage.getItem(key));if(s&&valid(s.draft)&&valid(s.published)&&Number.isSafeInteger(s.revision)&&Number.isSafeInteger(s.draftRevision)&&Array.isArray(s.versions)&&Array.isArray(s.audit))return s}catch(e){}return initial()}
  function save(s){if(!valid(s.draft)||!valid(s.published))throw Error('請檢查公告欄位，僅限純文字。');try{localStorage.setItem(key,JSON.stringify(s))}catch(e){throw Error('瀏覽器不允許本機儲存；請使用一般瀏覽視窗。')}}
  function reset(){try{localStorage.removeItem(key)}catch(e){throw Error('無法重設本機展示資料。')}}
  window.NLX_DEMO={key,clone,valid,load,save,reset};
})();
