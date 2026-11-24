
(function(){
'use strict';
// Same model files and destinations as v5. Never infer interchangeability from equal filenames.
const models={
one:{name:'ApplePie ONE',file:'APM1288BM.zip',transitionDate:'2026-04-28',drive:'https://drive.google.com/drive/folders/11abZ4MpHONdx1gK_z1eEfdAWEHTy2_mi?usp=drive_link',latestFile:'APM1288_A16.zip',latestDate:'2026-11-06',latestChange:'優化無線 CarPlay 藍牙',latestPage:'https://www.navlynx.com.tw/download_in_a12.asp'},
touch:{name:'ApplePie Touch',file:'APM1288TOUCH.zip',transitionDate:'2026-05-27',drive:'https://drive.google.com/drive/folders/1T5LIQH-WMlWCCyztKkGnt5S6KiH51MHk?usp=drive_link',latestFile:'APM1288TOUCH_A16.zip',latestDate:'2026-11-04',latestChange:'更新內建軟體版本',latestPage:'https://www.navlynx.com.tw/download_in_a11.asp'},
ultra:{name:'ApplePie mini Ultra II',file:'APM1688S.zip',transitionDate:'2026-05-07',drive:'https://drive.google.com/drive/folders/10ftWBlYjTytoOWk_ZxGz11CMXJql8pRk?usp=drive_link',latestFile:'APM1688S_A16.zip',latestDate:'2026-08-17',latestChange:'更新內建軟體版本',latestPage:'https://www.navlynx.com.tw/download_in_a8.asp'},
melling:{name:'ApplePie Melling／Melling-G',file:'APM1288BM.zip',transitionDate:'2026-04-28',drive:'https://drive.google.com/drive/folders/1kBohVCC0wrtqiwx3Nq8we56KSWQpG9KI?usp=drive_link',latestFile:'APM1288_A16.zip',latestDate:'2026-11-06',latestChange:'優化無線 CarPlay 藍牙',latestPage:'https://www.navlynx.com.tw/download_in_a9.asp'}
};
const $=id=>document.getElementById(id), tabs=[...document.querySelectorAll('[data-mode]')];
// Preserve the original two-stage guidance for all four supported models.
const transitionNoPictureHTML=$('no-picture-note').innerHTML;
function applyUpgradeMode(){
 $('download-cards').classList.remove('single-stage');
 $('second-stage').hidden=false;
 $('second-update-step').hidden=false;
 $('upgrade-message').textContent='先安裝指定升級韌體，再更新最新韌體。兩個階段都必須完成。';
 $('upgrade-label').innerHTML='<b>1</b> 第一階段';
 $('upgrade-heading').textContent='安裝指定升級韌體';
 $('version-label').textContent='指定升級韌體日期：';
 $('transition-download').textContent='下載指定升級韌體 ↗';
 $('step-download-title').textContent='下載並複製指定升級韌體';
 $('guide-version-label').textContent='指定升級韌體';
 $('step-complete-title').textContent='等待指定升級韌體完成';
 $('step-complete-text').textContent='更新時間約 10 至 15 分鐘，完成後主機會自動重新啟動。這時只完成第一階段，請繼續下一步。';
 $('no-picture-note').innerHTML=transitionNoPictureHTML;
}
let lastModel='', initial=true;
function render(){
 const hash=location.hash.slice(1), key=hash.startsWith('self-')?hash.slice(5):'', model=models[key], mode=hash==='mail'?'mail':'self';
 tabs.forEach(t=>{const active=t.dataset.mode===mode;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});
 $('panel-self').hidden=mode!=='self';$('panel-mail').hidden=mode!=='mail';$('chooser').hidden=!!model;$('model-guide').hidden=!model;
 const showBmwHelp=!!model&&(key==='one'||key==='melling');
 $('connection-help-title').textContent=showBmwHelp?'更新後無畫面，或 BMW 連線不順？':'更新後無畫面？';
 $('bmw-help').hidden=!showBmwHelp;$('bmw-help-link').hidden=!showBmwHelp;
 if(model){
  applyUpgradeMode();
  const versionDate=model.transitionDate;
  $('second-stage-file').textContent=model.latestFile;
  const stageLink=$('second-stage-download');stageLink.href=model.latestPage;
  const isTouch=key==='touch';
  $('second-stage-meta').hidden=false;
  stageLink.textContent=isTouch?'前往最新韌體下載 ↗':'查看此機型最新韌體 ↗';
  stageLink.setAttribute('aria-label','開啟 '+model.name+' 專用官網韌體頁');
  $('model-title').textContent=model.name;$('model-file').textContent=model.file;$('guide-file').textContent=model.file;$('guide-product').textContent=model.name;
  ['model-date','guide-date'].forEach(id=>{$(id).textContent=versionDate;$(id).dateTime=versionDate});
  $('transition-download').href=model.drive;$('transition-download').setAttribute('aria-label','下載 '+model.name+' '+versionDate+' 的指定升級韌體');
  if(lastModel!==key){$('full-guide').open=false;document.querySelectorAll('#model-guide details').forEach(d=>d.open=false)}
  $('status').textContent='目前顯示 '+model.name+' 的升級檔案與教學。';
 }else{$('transition-download').removeAttribute('href');$('status').textContent=mode==='mail'?'目前顯示寄回升級方案。':'請選擇您的 ApplePie 機型。'}
 if(hash==='remote'){$('remote-guide').open=true}
 if(!initial){
  const faqJump=hash==='upgrade-faq';
  const target=faqJump?$('upgrade-faq'):hash==='remote'?$('remote-guide'):model?$('guide-focus'):$('workspace');
  target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  if(faqJump)$('faq-heading')?.focus({preventScroll:true});
  else if(model)$('guide-focus').focus({preventScroll:true});
  else if(mode==='self'&&lastModel){document.querySelector('[data-model="'+lastModel+'"]')?.focus({preventScroll:true})}
 }
 lastModel=key;initial=false;
}
function route(hash){if(location.hash==='#'+hash){render()}else{location.hash=hash}}
tabs.forEach(tab=>{tab.addEventListener('click',()=>route(tab.dataset.mode));tab.addEventListener('keydown',event=>{let index=tabs.indexOf(tab);if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();tabs[1-index].focus();route(tabs[1-index].dataset.mode)}else if(event.key==='Home'||event.key==='End'){event.preventDefault();const t=tabs[event.key==='Home'?0:1];t.focus();route(t.dataset.mode)}})});
document.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>route('self-'+b.dataset.model)));
// Missing external photos become text, never generated substitute products.
document.querySelectorAll('.model img').forEach(img=>{const fail=()=>{img.hidden=true;if(!img.parentElement.querySelector('.photo-unavailable')){const text=document.createElement('span');text.className='photo-unavailable';text.textContent='產品照片暫時無法載入';img.parentElement.appendChild(text)}};img.addEventListener('error',fail);if(img.complete&&!img.naturalWidth)fail()});
window.addEventListener('hashchange',render);render();
})();
