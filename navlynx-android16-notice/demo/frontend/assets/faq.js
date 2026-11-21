/* FAQ lives in HTML for reliability. JS only adds behavior; answers remain visible without JS. */
(function () {
  'use strict';

  function initFaq() {
    const byId = id => document.getElementById(id);
    const section = byId('upgrade-faq');
    if (!section) return;

    const items = [...section.querySelectorAll('details.nlx-faq-item')];
    items.forEach(detail => {
      detail.addEventListener('toggle', function () {
        if (!detail.open) return;
        items.forEach(other => {
          if (other !== detail && other.open) other.open = false;
        });
      });
    });

    function jump(target) {
      if (!target) return;
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
      }
      if (typeof target.focus === 'function') target.focus({ preventScroll: true });
    }

    const nav = document.querySelector('.top nav');
    if (nav && !nav.querySelector('.nlx-faq-jump')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nlx-faq-jump';
      button.textContent = '常見問題';
      button.addEventListener('click', () => jump(byId('faq-heading')));
      nav.insertBefore(button, nav.lastElementChild);
    }

    const passwordButton = document.querySelector('[data-open-password-faq]');
    if (passwordButton) passwordButton.addEventListener('click', () => {
      const detail = byId('faq-password');
      if (detail) {
        detail.open = true;
        jump(detail.querySelector('summary'));
      }
    });

    const remoteButton = section.querySelector('[data-open-remote]');
    if (remoteButton) remoteButton.addEventListener('click', () => {
      const remote = byId('remote-guide');
      if (remote) { remote.open = true; jump(remote.querySelector('summary')); }
    });

    const defaultPhaseHtml = byId('faq-phases-answer') ? byId('faq-phases-answer').innerHTML : '';
    let previousContext = '';
    function refreshFaq() {
      const mail = byId('panel-mail') && !byId('panel-mail').hidden;
      const selected = !mail && byId('model-guide') && !byId('model-guide').hidden;
      const name = selected ? byId('model-title').textContent.trim() : '';
      const contextKey = (mail ? 'mail' : 'self') + ':' + name;
      if (previousContext !== contextKey) items.forEach(item => { item.open = false; });
      previousContext = contextKey;
      const context = byId('faq-context');
      if (context) context.textContent = mail ? '寄送回總公司處理' : (name || '自行升級');

      const phase = byId('faq-phases-answer');
      if (!phase) return;
      if (!selected) {
        phase.innerHTML = defaultPhaseHtml;
        return;
      }
      const stageMessage = byId('upgrade-message');
      if (!stageMessage) return;
      const strong = document.createElement('strong');
      strong.textContent = stageMessage.textContent;
      phase.replaceChildren(strong);
      const second = byId('second-stage');
      if (second && !second.hidden) {
        const note = document.createElement('span');
        const date = byId('model-date') ? byId('model-date').textContent : '';
        note.textContent = ' 指定升級韌體日期：' + date + '。請依上方步驟完成兩次更新。';
        phase.appendChild(note);
      }
    }

    window.addEventListener('hashchange', refreshFaq);
    refreshFaq();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq, { once: true });
  } else {
    initFaq();
  }
})();
