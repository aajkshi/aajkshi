/* Context-aware FAQs. Existing source content is moved, not duplicated. */
(function () {
  'use strict';
  function initFaq() {
    const byId = id => document.getElementById(id);
    const selfPanel = byId('panel-self');
    const mailPanel = byId('panel-mail');
    const support = document.querySelector('#workspace > .support');
    if (!selfPanel || !mailPanel || !support || byId('upgrade-faq')) return;
    const lineUrl = 'https://lin.ee/w0Iq3c0';
    const section = document.createElement('section');
    section.id = 'upgrade-faq';
    section.className = 'nlx-faq';
    section.setAttribute('aria-labelledby', 'faq-heading');
    section.innerHTML = '<div class="nlx-faq-heading"><h2 id="faq-heading" tabindex="-1">常見問題</h2><p>點選問題查看答案。<br>內容依您選擇的升級方式與機型顯示。</p><span id="faq-context" class="nlx-faq-context"></span></div><div class="nlx-faq-list"></div>';
    const list = section.querySelector('.nlx-faq-list');
    const items = [];
    const customerLink = '<a href="' + lineUrl + '" target="_blank" rel="noopener">聯繫 LINE 客服 ↗</a>';

    function decorate(detail, context, modelOnly) {
      detail.classList.add('nlx-faq-item');
      const summary = detail.querySelector('summary');
      const icon = document.createElement('span');
      icon.className = 'nlx-faq-icon';
      icon.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      // Keep existing IDs on this label so the page's model logic still works.
      if (summary.id) { label.id = summary.id; summary.removeAttribute('id'); }
      while (summary.firstChild) label.appendChild(summary.firstChild);
      summary.append(label, icon);
      detail.open = false;
      list.appendChild(detail);
      items.push({ detail, context, modelOnly: !!modelOnly });
      detail.addEventListener('toggle', function () {
        if (!detail.open || detail.hidden) return;
        // Only one answer open at a time, without relying on browser support for name.
        items.forEach(item => { if (item.detail !== detail) item.detail.open = false; });
      });
      return detail;
    }
    function add(id, question, answer, context) {
      const detail = document.createElement('details');
      detail.id = id;
      const summary = document.createElement('summary');
      summary.textContent = question;
      const body = document.createElement('div');
      body.className = 'nlx-faq-answer';
      body.innerHTML = answer;
      detail.append(summary, body);
      return decorate(detail, context);
    }
    add('faq-data', '升級 Android 16 會清除資料嗎？',
      '<p>會。首次升級 Android 16 會將主機重置，原有 APP、登入帳號、下載檔案及個人設定將被清除。</p>', 'all');

    add('faq-password', '升級後切換繁體中文，需要密碼嗎？',
      '<p>需要。首次升級 Android 16 會重置主機，重新切換繁體中文時請使用<strong>保固卡上的中文密碼</strong>。</p><p>若保固卡遺失或中文密碼無法辨識，請聯繫 NAVLYNX 官方 LINE 客服，提供機型與購買資訊協助核對。也可以參考 <a href="https://www.navlynx.com.tw/FAQ.asp" target="_blank" rel="noopener">官網常見問題中的繁體中文密碼說明 ↗</a>。</p><p>' + customerLink + '</p>', 'all');
    add('faq-model-check', '如何確認 ApplePie 機型與目前系統版本？',
      '<p>不同機型使用的升級檔案不可混用。請在主機的「設定」頁查看 Android 系統版本與以 APM 開頭的韌體機型代碼；部分機型需進入「更多設定 → ApplePie Settings」查詢版本。</p><p>若無法辨識，請拍下版本資訊與主機標籤，先由客服協助核對，不要只憑機身外觀選擇升級檔案。</p><p>' + customerLink + '</p>', 'all');
    add('faq-warranty', '已過保也可以自行升級嗎？',
      '<p>可以。符合本次升級機型的產品，不分保固內或保固外，皆可依官網教學自行下載並升級。<strong>自行升級不需完成社群任務，也不用寄送主機。</strong></p>', 'self');
    add('faq-sdcard', '插入記憶卡後，沒有出現韌體更新提示怎麼辦？',
      '<p>請依序檢查：</p><ol><li>檢查檔名是否與本機型的官方檔名完全一致。若下載時被加上「-001」等額外編號，請移除多餘編號，但不要修改機型代碼。</li><li>記憶卡應使用 FAT32 或 exFAT 格式，韌體 ZIP 檔案直接放在記憶卡根目錄，<strong>不要解壓縮</strong>。</li><li>在主機的「設定 → 更多設定 → 儲存空間」確認能否讀取記憶卡，必要時換卡測試。</li><li>若仍無法更新，請重新從 NAVLYNX 官方連結下載，並聯繫客服提供機型、檔名及目前畫面。</li></ol><p><a href="https://www.navlynx.com.tw/FAQ.asp" target="_blank" rel="noopener">參考官網「為什麼無法更新韌體？」說明 ↗</a></p>', 'self');
    const phases = add('faq-phases', '需要先安裝指定升級韌體嗎？', '', 'self');
    add('faq-remote', '有使用飛鼠，應該先更新哪一個？',
      '<p><strong>請先升級飛鼠韌體，再升級 Android 16。</strong>未更新韌體的飛鼠，升級 Android 16 後將無法正常使用。沒有使用飛鼠者可略過。</p><p><button type="button" class="nlx-faq-link" data-open-remote>查看飛鼠下載與教學 ↑</button></p>', 'self');
    const connection = byId('connection-help');
    if (connection) decorate(connection, 'self', true);
    add('faq-timeout', '更新超過 30 分鐘仍未完成怎麼辦？',
      '<p><strong>請先保持 ApplePie 主機供電，並透過官方 LINE 聯繫客服。</strong></p><p>請提供主機型號、正在更新的韌體版本，並拍攝目前車機畫面與主機燈號的照片或影片，方便客服確認狀況，再引導您進行後續操作。</p><p>' + customerLink + '</p>', 'self');
    add('faq-mail-start', '寄回升級，要先填表還是先加 LINE？',
      '<p><strong>先加入官方 LINE，告知「我要升級 Android 16」。</strong>由客服回覆並提供線上申請表，完成填表與審核後，再依通知寄送主機。尚未取得客服確認前，請勿自行寄出。</p><p>' + customerLink + '</p>', 'mail');
    add('faq-mail-accessories', '寄回升級需要附線材或飛鼠嗎？',
      '<p><strong>線材不用附；有 NAVLYNX 飛鼠，請與 ApplePie 主機一併寄回。</strong>總公司會一併處理飛鼠韌體及配對。寄出前請移除 SIM 卡、Micro SD 記憶卡及其他非必要配件。</p>', 'mail');
    add('faq-mail-time', '主機送達後，多久能完成升級？',
      '<p>收到主機後，我們會依收件順序處理，通常於 <strong>3 至 7 個工作天</strong>內完成 Android 16 升級及基本功能測試。</p><p>上述時間不含物流、補件及異常檢測。</p>', 'mail');
    const mailDetails = [...mailPanel.querySelectorAll(':scope > details.accordion')];
    mailDetails.forEach(detail => decorate(detail, 'mail'));
    list.appendChild(byId('faq-mail-time'));

    support.before(section);

    // A scroll button avoids changing the hash that controls mode/model selection.
    const nav = document.querySelector('.top nav');
    if (nav) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nlx-faq-jump';
      button.textContent = '常見問題';
      button.addEventListener('click', () => jump(byId('faq-heading')));
      nav.insertBefore(button, nav.lastElementChild);
    }
    function jump(target) {
      if (!target) return;
      target.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      if (target.matches('h2, summary')) target.focus({ preventScroll: true });
    }
    section.querySelector('[data-open-remote]').addEventListener('click', () => {
      const remote = byId('remote-guide');
      if (remote) { remote.open = true; jump(remote.querySelector('summary')); }
    });
    const passwordButton = document.querySelector('[data-open-password-faq]');
    if (passwordButton) passwordButton.addEventListener('click', () => {
      const answer = byId('faq-password');
      if (answer) { answer.open = true; jump(answer.querySelector('summary')); }
    });
    let previousContext = '';
    function refreshFaq() {
      const mode = mailPanel.hidden ? 'self' : 'mail';
      const selected = mode === 'self' && !byId('model-guide').hidden;
      const name = selected ? byId('model-title').textContent.trim() : '';
      const contextKey = mode + ':' + name;
      items.forEach(item => {
        item.detail.hidden = !(item.context === 'all' || item.context === mode) || (item.modelOnly && !selected);
        if (item.detail.hidden || previousContext !== contextKey) item.detail.open = false;
      });
      byId('faq-context').textContent = mode === 'mail' ? '寄送回總公司處理' : name || '自行升級';
      const answer = phases.querySelector('.nlx-faq-answer');
      if (selected) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = byId('upgrade-message').textContent;
        p.appendChild(strong);
        answer.replaceChildren(p);
        if (!byId('second-stage').hidden) {
          const note = document.createElement('p');
          note.textContent = name + ' 的指定升級韌體日期為 ' + byId('model-date').textContent + '。請依上方下載區的順序完成兩次更新，勿停留在指定升級韌體。';
          answer.appendChild(note);
        }
      } else {
        answer.innerHTML = '<p>依機型而定。<strong>Touch 可直接升級；ONE、mini Ultra II 與 Melling／Melling-G 須先安裝指定升級韌體，再更新最新韌體。</strong></p><p>選擇您的機型後，上方會顯示正確的版本日期與操作方式。</p>';
      }
      previousContext = contextKey;
    }
    window.addEventListener('hashchange', refreshFaq);
    refreshFaq();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFaq, { once: true });
  else initFaq();
})();
