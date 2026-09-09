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
      '<p>會。首次升級 Android 16 會將主機重置，原有 APP、登入帳號、下載檔案及個人設定將被清除。<strong>不論自行升級或寄回處理，都請先備份重要資料。</strong></p>', 'all');
    add('faq-warranty', '已過保也可以自行升級嗎？',
      '<p>可以。符合本次升級機型的產品，不分保固內或保固外，皆可依官網教學自行下載並升級。<strong>自行升級不需完成社群任務，也不用寄送主機。</strong></p>', 'self');
    const phases = add('faq-phases', '需要先安裝過渡版本嗎？', '', 'self');
    add('faq-remote', '有使用飛鼠，應該先更新哪一個？',
      '<p><strong>請先升級飛鼠韌體，再升級 Android 16。</strong>未更新韌體的飛鼠，升級 Android 16 後將無法正常使用。沒有使用飛鼠者可略過。</p><p><button type="button" class="nlx-faq-link" data-open-remote>查看飛鼠下載與教學 ↑</button></p>', 'self');
    const connection = byId('connection-help');
    if (connection) decorate(connection, 'self', true);
    add('faq-timeout', '更新超過 30 分鐘仍未完成怎麼辦？',
      '<p>每次韌體更新約需 10 至 15 分鐘。若超過 30 分鐘仍未完成，<strong>請先保持穩定供電，不要直接拔電源、反覆插卡或重新刷寫。</strong></p><p>請記錄機型、正在更新的版本、已等待時間，並拍下畫面及主機燈號，交由客服確認下一步；不要只憑等待時間判定可以斷電。</p><p>' + customerLink + '</p>', 'self');
    add('faq-mail-start', '寄回升級，要先填表還是先加 LINE？',
      '<p><strong>先加入官方 LINE，告知「我要升級 Android 16」。</strong>由客服回覆並提供線上申請表，完成填表與審核後，再依通知寄送主機。尚未取得客服確認前，請勿自行寄出。</p><p>' + customerLink + '</p>', 'mail');
    add('faq-mail-accessories', '寄回升級需要附線材或飛鼠嗎？',
      '<p><strong>線材不用附；有 NAVLYNX 飛鼠，請與 ApplePie 主機一併寄回。</strong>總公司會一併處理飛鼠韌體及配對。寄出前請移除 SIM 卡、Micro SD 記憶卡及其他非必要配件。</p>', 'mail');
    add('faq-mail-time', '寄回後多久可以完成？',
      '<p>主機送達並完成資料核對後，預計 <strong>3 至 7 個工作天</strong>完成升級與基本功能測試，再由順豐寄回。此時間不含來回物流、等待補件及異常檢測。</p><p>本次服務是系統升級，不包含硬體維修；主機若已有異常，請先告知客服。</p>', 'mail');
    const mailDetails = [...mailPanel.querySelectorAll(':scope > details.accordion')];
    mailDetails.forEach(detail => decorate(detail, 'mail'));
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
          note.textContent = name + ' 的指定過渡版本日期為 ' + byId('model-date').textContent + '。請依上方下載區的順序完成兩次更新，勿停留在過渡版本。';
          answer.appendChild(note);
        }
      } else {
        answer.innerHTML = '<p>依機型而定。<strong>Touch 可直接升級；ONE、mini Ultra II 與 Melling／Melling-G 須先安裝指定過渡版本，再更新最新韌體。</strong></p><p>選擇您的機型後，上方會顯示正確的版本日期與操作方式。</p>';
      }
      previousContext = contextKey;
    }
    window.addEventListener('hashchange', refreshFaq);
    refreshFaq();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFaq, { once: true });
  else initFaq();
})();
