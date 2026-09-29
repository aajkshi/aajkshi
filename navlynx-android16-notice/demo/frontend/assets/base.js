
(function(){
'use strict';
// Same model files and destinations as v5. Never infer interchangeability from equal filenames.
const models={
one:{name:'ApplePie ONE',file:'APM1288BM.zip',transitionDate:'2026-04-28',drive:'https://drive.google.com/drive/folders/11abZ4MpHONdx1gK_z1eEfdAWEHTy2_mi?usp=drive_link'},
touch:{name:'ApplePie Touch',file:'APM1288TOUCH.zip',upgradeMode:'direct',firmwareDate:'2026-05-27',drive:'https://drive.google.com/drive/folders/1T5LIQH-WMlWCCyztKkGnt5S6KiH51MHk?usp=drive_link'},
ultra:{name:'ApplePie mini Ultra II',file:'APM1688S.zip',transitionDate:'2026-05-07',drive:'https://drive.google.com/drive/folders/10ftWBlYjTytoOWk_ZxGz11CMXJql8pRk?usp=drive_link'},
melling:{name:'ApplePie Melling／Melling-G',file:'APM1288BM.zip',transitionDate:'2026-04-28',drive:'https://drive.google.com/drive/folders/1kBohVCC0wrtqiwx3Nq8we56KSWQpG9KI?usp=drive_link'}
};
const $=id=>document.getElementById(id), tabs=[...document.querySelectorAll('[data-mode]')];
// Preserve the two-stage help for the other models when switching back from Touch.
const transitionNoPictureHTML=$('no-picture-note').innerHTML;
function applyUpgradeMode(model){
 const direct=model.upgradeMode==='direct';
 $('download-cards').classList.toggle('single-stage',direct);
 $('second-stage').hidden=direct;$('second-update-step').hidden=direct;
 $('upgrade-message').textContent=direct
  ?'直接安裝 '+model.firmwareDate+' 韌體即可完成 Android 16 升級，無須過渡版本或第二次更新。'
  :'先安裝過渡版本，再更新最新韌體。兩個階段都必須完成。';
 $('upgrade-label').innerHTML=direct?'<b>✓</b> 一次更新完成':'<b>1</b> 第一階段';
 $('upgrade-heading').textContent=direct?'直接升級 Android 16':'安裝指定過渡版本';
 $('version-label').textContent=direct?'韌體版本日期：':'過渡版本日期：';
 $('transition-download').textContent=direct?'下載 Touch Android 16 韌體 ↗':'下載指定過渡版本 ↗';
 $('step-download-title').textContent=direct?'下載並複製韌體':'下載並複製過渡版本';
 $('guide-version-label').textContent=direct?'Android 16 韌體':'過渡版本';
 $('step-complete-title').textContent=direct?'等待升級完成':'等待過渡版本完成';
 $('step-complete-text').textContent=direct
  ?'更新時間約 10 至 15 分鐘。完成後主機會自動重新啟動，進入 Touch 主畫面即完成 Android 16 升級，不需再次更新。'
  :'更新時間約 10 至 15 分鐘，完成後主機會自動重新啟動。這時只完成第一階段，請繼續下一步。';
 if(direct){
  $('no-picture-note').textContent='若更新後無法顯示畫面，請拍攝目前畫面及主機燈號，聯繫 LINE 客服協助確認。更新進行中請勿任意斷電，也不要反覆刷寫或使用其他機型的檔案。';
 }else{$('no-picture-note').innerHTML=transitionNoPictureHTML}
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
  applyUpgradeMode(model);
  const versionDate=model.firmwareDate||model.transitionDate;
  $('model-title').textContent=model.name;$('model-file').textContent=model.file;$('guide-file').textContent=model.file;$('guide-product').textContent=model.name;
  ['model-date','guide-date'].forEach(id=>{$(id).textContent=versionDate;$(id).dateTime=versionDate});
  $('transition-download').href=model.drive;$('transition-download').setAttribute('aria-label','下載 '+model.name+' '+versionDate+(model.upgradeMode==='direct'?' Android 16 韌體':' 的指定過渡版本'));
  if(lastModel!==key){$('full-guide').open=false;document.querySelectorAll('#model-guide details').forEach(d=>d.open=false)}
  $('status').textContent='目前顯示 '+model.name+' 的升級檔案與教學。';
 }else{$('transition-download').removeAttribute('href');$('status').textContent=mode==='mail'?'目前顯示寄回升級方案。':'請選擇您的 ApplePie 機型。'}
 if(hash==='remote'){$('remote-guide').open=true}
 if(!initial){
  const target=hash==='remote'?$('remote-guide'):model?$('remote-guide'):$('workspace');
  target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  if(model)$('guide-focus').focus({preventScroll:true});
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
