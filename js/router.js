/* 3. router.js: single-page view controller (hash based, so Back/Forward and refresh work) */
WW.router = (() => {
  const { $, $$ } = WW.utils;
  const VIEWS = ['home', 'report', 'track', 'hot', 'admin', 'guide'];
  const subs = [];
  let current = null;

  const fromHash = () => {
    const h = location.hash.replace('#', '');
    return VIEWS.includes(h) ? h : 'home';
  };

  function show(view) {
    current = view;
    $$('.view').forEach(sec => sec.classList.toggle('on', sec.id === 'v-' + view));
    $$('nav [data-go]').forEach(b =>
      b.dataset.go === view ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
    window.scrollTo(0, 0);
    subs.forEach(fn => fn(view));
  }

  function go(view) {
    if (!VIEWS.includes(view)) view = 'home';
    if (location.hash === '#' + view) show(view);   // same view: just refresh
    else location.hash = view;                       // triggers 'hashchange' -> show()
  }

  const onChange = fn => subs.push(fn);
  const getCurrent = () => current;

  function init() {
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-go]');
      if (el) go(el.dataset.go);
    });
    window.addEventListener('hashchange', () => show(fromHash()));
    show(fromHash());
  }

  return { init, go, onChange, getCurrent };
})();