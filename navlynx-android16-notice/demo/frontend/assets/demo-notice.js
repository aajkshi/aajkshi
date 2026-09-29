/* Read only the current browser's simulated publication. */
(() => {
  'use strict';
  const store=window.NLX_DEMO, config=window.NLX_NOTICE_CONFIG;
  if(!store||!config)return;
  const s=store.load();
  config.mode='static';
  config.seed={...s.published,revision:s.revision,publishedAt:s.publishedAt};
  window.addEventListener('storage',e=>{if(e.key===store.key)location.reload()});
})();
