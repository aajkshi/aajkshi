/* Public notice renderer and UX download guard. Plain text only; no account data. */
(() => {
  'use strict';
  const cfg=window.NLX_NOTICE_CONFIG;
  if(!cfg) return;
  const line='https://lin.ee/w0Iq3c0';
  let current=cfg.seed, healthy=cfg.mode==='static', pending='', accepted=null, busy=false, opener=null;
  const banner=document.getElementById('compat-notice');
  const $=id=>document.getElementById(id);
  function valid(n){return n&&typeof n.enabled==='boolean'&&['warning','info'].includes(n.severity)&&typeof n.title==='string'&&typeof n.intro==='string'&&typeof n.closing==='string'&&Array.isArray(n.brands)&&n.brands.length<=30&&n.brands.every(x=>typeof x==='string'&&x.length<=60)&&Number.isSafeInteger(n.revision)}
  function brands(node,values){node.replaceChildren(...values.map(s=>{const li=document.createElement('li');li.textContent=s;return li}));node.hidden=values.length===0}
  function dateLabel(n){if(!n.publishedAt)return '';const d=new Date(n.publishedAt);return Number.isNaN(d.getTime())?'':'公告更新：'+new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',dateStyle:'medium',timeStyle:'short'}).format(d)}
  function render(n){
    if(!banner||!valid(n))return;
    banner.hidden=!n.enabled;banner.dataset.severity=n.severity;
    $('compat-title').textContent=n.title;$('compat-intro').textContent=n.intro;$('compat-closing').textContent=n.closing;
    brands($('compat-brands'),n.brands);const d=dateLabel(n);$('compat-date').textContent=d;$('compat-date').hidden=!d;
  }
  async function refresh(){
    if(cfg.mode==='static'){healthy=valid(current);return current}
    try{
      const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),6000);
      let response;try{response=await fetch(cfg.apiUrl,{cache:'no-store',credentials:'omit',signal:controller.signal})}finally{clearTimeout(timer)}
      if(!response.ok)throw Error('notice unavailable');
      const n=await response.json();if(!valid(n))throw Error('invalid notice');
      if(n.revision!==current.revision)accepted=null;
      current=n;healthy=true;render(n);return n;
    }catch(error){
      healthy=false;
      // Do not fall open when the admin service or network is unavailable.
      banner.hidden=false;banner.dataset.severity='warning';
      $('compat-title').textContent='相容性公告暫時無法確認';
      $('compat-intro').textContent='目前無法取得最新相容性資訊，韌體下載入口暫停導向。請稍後再試，或先聯繫官方 LINE 客服。';
      $('compat-closing').textContent=cfg.seed.closing;brands($('compat-brands'),cfg.seed.brands);$('compat-date').hidden=true;
      return current;
    }
  }
  const modal=document.createElement('dialog');modal.className='compat-dialog';modal.setAttribute('aria-labelledby','compat-modal-title');
  modal.innerHTML='<header><div><small class="compat-current">下載前確認</small><h2 id="compat-modal-title">請先確認您的車款</h2></div><button type="button" aria-label="關閉提醒" id="compat-close">×</button></header><div class="compat-dialog-body"><p id="compat-modal-intro"></p><ul class="compat-brands" id="compat-modal-brands"></ul><p id="compat-modal-closing"></p><label class="compat-check" id="compat-confirm-label"><input type="checkbox" id="compat-confirm"><span id="compat-confirm-text"></span></label><p class="compat-dialog-error" id="compat-error" role="status" hidden></p><div class="compat-dialog-actions"><button type="button" class="btn" id="compat-continue" disabled>確認後前往下載</button><a class="btn light" href="'+line+'" target="_blank" rel="noopener noreferrer">我的車款在名單內／不確定，聯繫客服 ↗</a></div><p class="compat-footnote">名單內車款請先暫緩升級。其他車款仍請依對應機型的教學操作。</p></div>';
  document.body.append(modal);
  function guarded(n){return n.enabled&&n.severity==='warning'&&n.brands.length>0}
  function populate(message=''){
    $('compat-modal-intro').textContent=healthy?current.intro:'目前無法確認最新公告，請稍後再試，或聯繫官方 LINE。';
    brands($('compat-modal-brands'),current.brands);$('compat-modal-closing').textContent=current.closing;
    $('compat-confirm-text').textContent='我確認車輛不屬於上述品牌，且已閱讀相容性提醒。';
    $('compat-confirm').checked=false;$('compat-confirm-label').hidden=!healthy;$('compat-continue').disabled=true;$('compat-continue').hidden=!healthy;
    $('compat-error').textContent=message;$('compat-error').hidden=!message;
  }
  function show(message=''){populate(message);if(!modal.open)modal.showModal()}
  function navigate(url,popup){if(popup){popup.opener=null;popup.location.replace(url)}else location.assign(url)}
  function isFirmware(link){
    try{const u=new URL(link.href,location.href);
      return u.protocol==='https:'&&((u.hostname==='drive.google.com'&&u.pathname.startsWith('/drive/folders/'))||(u.hostname==='www.navlynx.com.tw'&&/^\/download(?:_in_[^/]*)?\.asp$/.test(u.pathname)));
    }catch{return false}
  }
  document.addEventListener('click',async event=>{
    const link=event.target.closest?.('a[href]');if(!link||!isFirmware(link))return;
    event.preventDefault();event.stopImmediatePropagation();if(busy)return;busy=true;opener=link;pending=link.href;
    await refresh();busy=false;
    if(!healthy){show();return}
    if(!guarded(current)||accepted===current.revision){location.assign(pending);return}
    show();
  },true);
  $('compat-close').onclick=()=>modal.close();
  modal.addEventListener('close',()=>{pending='';opener?.focus({preventScroll:true})});
  $('compat-confirm').onchange=()=>{$('compat-continue').disabled=!$('compat-confirm').checked};
  $('compat-continue').onclick=async()=>{
    if(!$('compat-confirm').checked||busy||!pending)return;
    busy=true;$('compat-continue').disabled=true;const version=current.revision,destination=pending;
    const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;
    await refresh();busy=false;
    if(!healthy||current.revision!==version){popup?.close();show(healthy?'公告剛剛有更新，請再次閱讀並確認。':'暫時無法確認公告，請稍後再試。');return}
    accepted=current.revision;modal.close();navigate(destination,popup);
  };
  render(current);refresh();
  if(cfg.mode==='api'){
    setInterval(()=>{if(!document.hidden&&!modal.open)refresh()},60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
  }
})();
