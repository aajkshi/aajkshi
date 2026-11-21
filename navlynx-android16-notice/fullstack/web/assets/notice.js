/* Public compatibility notice renderer. Displays the current announcement without blocking firmware links. */
(() => {
  'use strict';
  const cfg = window.NLX_NOTICE_CONFIG;
  if (!cfg) return;
  const banner = document.getElementById('compat-notice');
  const wrapper = document.getElementById('upgrade-notice');
  const $ = id => document.getElementById(id);
  let current = cfg.seed;
  function valid(n) {
    return n && typeof n.enabled === 'boolean' &&
      ['warning', 'info'].includes(n.severity) &&
      typeof n.title === 'string' && typeof n.intro === 'string' &&
      typeof n.closing === 'string' && Array.isArray(n.brands) &&
      n.brands.length <= 30 &&
      n.brands.every(x => typeof x === 'string' && x.length <= 60) &&
      Number.isSafeInteger(n.revision);
  }
  function brands(node, values) {
    node.replaceChildren(...values.map(value => {
      const li = document.createElement('li');
      li.textContent = value;
      return li;
    }));
    node.hidden = values.length === 0;
  }
  function render(n) {
    if (!banner || !valid(n)) return;
    banner.hidden = !n.enabled;
    banner.dataset.severity = n.severity;
    if (wrapper) wrapper.dataset.severity = n.severity;
    $('compat-title').textContent = n.title;
    $('compat-intro').textContent = n.intro;
    $('compat-closing').textContent = n.closing;
    brands($('compat-brands'), n.brands);
    const date = n.publishedAt ? new Date(n.publishedAt) : null;
    const label = date && !Number.isNaN(date.getTime())
      ? '公告更新：' + new Intl.DateTimeFormat('zh-TW', {
          timeZone: 'Asia/Taipei', dateStyle: 'medium', timeStyle: 'short'
        }).format(date)
      : '';
    $('compat-date').textContent = label;
    $('compat-date').hidden = !label;
  }
  async function refresh() {
    if (cfg.mode !== 'api') return;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      let response;
      try {
        response = await fetch(cfg.apiUrl, {
          cache: 'no-store', credentials: 'omit', signal: controller.signal
        });
      } finally {
        clearTimeout(timer);
      }
      if (!response.ok) throw new Error('notice unavailable');
      const next = await response.json();
      if (!valid(next)) throw new Error('invalid notice');
      current = next;
      render(current);
    } catch (error) {
      // Keep the last known announcement visible; never block a firmware link.
      if (banner) banner.dataset.stale = 'true';
      if (wrapper) wrapper.dataset.stale = 'true';
    }
  }
  render(current);
  refresh();
  if (cfg.mode === 'api') {
    setInterval(() => { if (!document.hidden) refresh(); }, 60000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refresh();
    });
  }
})();