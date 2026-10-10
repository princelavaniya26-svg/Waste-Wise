/* 1. utils.js: shared helpers. Creates the global WW namespace every other file attaches to. */
window.WW = window.WW || {};

WW.utils = (() => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // Escape user text before putting it into innerHTML (prevents script injection)
  const esc = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const statusClass = s => 's-' + String(s).replace(/\s+/g, '-');
  const badge = s => `<span class="badge ${statusClass(s)}">${esc(s)}</span>`;

  const formatDate = iso => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Only allow image data-URLs we created ourselves (guards against tampered storage)
  const safeImg = url =>
    typeof url === 'string' && /^data:image\/(jpeg|png|webp|gif);base64,/.test(url) ? url : '';

  let timer;
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(() => t.classList.remove('on'), 2400);
  }

  return { $, $$, esc, statusClass, badge, formatDate, safeImg, toast };
})();