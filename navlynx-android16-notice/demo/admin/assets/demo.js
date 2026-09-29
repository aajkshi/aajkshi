/* Standalone browser demonstration. It never calls a server API. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),D=window.NLX_DEMO;
 if(!D){document.body.textContent='展示資源未載入，請重新整理。';return}
 let state=D.load(),dirty=false;
 const fields=['enabled','severity','notice-title','intro','brands','closing'];
 function toast(t,error=false){$('status').hidden=false;$('status').textContent=t;$('status').dataset.error=String(error)}
 function collect(){return {enabled:$('enabled').checked,severity:$('severity').value,title:$('notice-title').value.trim(),intro:$('intro').value.trim(),brands:[...new Set($('brands').value.split('\n').map(x=>x.trim()).filter(Boolean))],closing:$('closing').value.trim()}}
 function preview(){const n=collect();$('notice-preview').hidden=!n.enabled;$('preview-off').hidden=n.enabled;$('notice-preview').dataset.severity=n.severity;$('pv-title').textContent=n.title;$('pv-intro').textContent=n.intro;$('pv-closing').textContent=n.closing;$('pv-brands').replaceChildren(...n.brands.map(x=>{const li=document.createElement('li');li.textContent=x;return li}))}
 function load(){const n=state.draft;$('enabled').checked=n.enabled;$('severity').value=n.severity;$('notice-title').value=n.title;$('intro').value=n.intro;$('brands').value=n.brands.join('\n');$('closing').value=n.closing;$('draft-version').textContent='展示草稿 '+state.draftRevision;$('live-status').textContent=state.published.enabled?'本機展示公告顯示中':'本機展示公告隱藏';$('published-info').textContent='展示版本 '+state.revision+' · '+new Date(state.publishedAt).toLocaleString('zh-TW')+'\n'+state.published.title;dirty=false;preview()}
 function record(action){state.audit.unshift({at:new Date().toISOString(),actor:'本機展示',action,detail:'未送出至伺服器'});state.audit=state.audit.slice(0,50)}
 function saveDraft(){if(!$('editor-form').reportValidity())throw Error('請完成必填欄位。');const n=collect();if(!D.valid(n))throw Error('請使用純文字，檢查欄位長度與品牌名單。');state.draft=n;state.draftRevision++;record('儲存展示草稿');D.save(state);load()}
 function run(fn){try{fn()}catch(e){toast(e.message,true)}}
 fields.forEach(id=>$(id).addEventListener('input',()=>{dirty=true;preview()}));
 $('editor-form').addEventListener('submit',e=>{e.preventDefault();run(()=>{saveDraft();toast('已儲存本機展示草稿；前台展示尚未變更。')})});
 $('publish').onclick=()=>run(()=>{if(dirty)saveDraft();$('publish-summary').textContent='只更新您目前瀏覽器的前台展示，不會發布至正式官網。';$('publish-dialog').showModal()});
 $('confirm-publish').onclick=()=>run(()=>{state.published=D.clone(state.draft);state.revision++;state.publishedAt=new Date().toISOString();state.versions.unshift({revision:state.revision,notice:D.clone(state.published),at:state.publishedAt,actor:'本機展示'});state.versions=state.versions.slice(0,30);record('發布至本機展示');D.save(state);load();$('publish-dialog').close();toast('已發布至此瀏覽器的展示頁。點「查看前台」檢查，其他同事不受影響。')});
 $('reload').onclick=()=>run(()=>{if(dirty&&!confirm('放棄尚未儲存的展示編輯？'))return;state=D.load();load();toast('已重新載入本機展示。')});
 $('logout').onclick=()=>run(()=>{if(!confirm('清除目前瀏覽器的展示修改並回復初始公告？'))return;D.reset();state=D.load();load();show('editor');toast('本機展示已重設。')});
 function show(name){['editor','history','security'].forEach(v=>$('view-'+v).hidden=v!==name);document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));if(name==='history')history()}
 function history(){const rows=state.versions.map(v=>{const row=document.createElement('div');row.className='version-row';const text=document.createElement('div'),title=document.createElement('strong'),sub=document.createElement('small'),button=document.createElement('button');title.textContent=v.notice.title;sub.textContent='展示版本 '+v.revision+' · '+new Date(v.at).toLocaleString('zh-TW');text.append(title,sub);button.type='button';button.className='outline';button.textContent='還原到展示草稿';button.onclick=()=>run(()=>{state.draft=D.clone(v.notice);state.draftRevision++;record('還原展示版本 '+v.revision);D.save(state);load();show('editor');toast('已還原到展示草稿，尚未發布。')});row.append(text,button);return row});$('versions').replaceChildren(...rows);$('audit').replaceChildren(...state.audit.map(a=>{const tr=document.createElement('tr');[new Date(a.at).toLocaleString('zh-TW'),a.actor,a.action,a.detail].forEach(t=>{const td=document.createElement('td');td.textContent=t;tr.append(td)});return tr}))}
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));
 $('publish-dialog').querySelector('.sub').textContent='僅保留於此瀏覽器；不會影響正式官網或其他同事的展示資料。';
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
 load();show('editor');
})();
