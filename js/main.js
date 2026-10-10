/* 9. main.js: global initialization. Must load LAST. */
(() => {
  const { $, esc } = WW.utils;

  function renderHomeStats() {
    const s = WW.data.stats();
    const hotspots = WW.dashboard.groups().filter(g => g.open >= WW.dashboard.HOTSPOT_MIN_OPEN).length;
    $('#home-stats').innerHTML =
      `<div><strong>${s.total}</strong>reports filed</div>` +
      `<div><strong>${s.open}</strong>still open</div>` +
      `<div><strong>${hotspots}</strong>active hotspots</div>`;
  }

  // One function refreshes every view, so a submission or status change shows up everywhere at once
  function renderAll() {
    renderHomeStats();
    WW.dashboard.render();
    WW.admin.render();
    WW.track.refresh();
  }

  function start() {
    WW.data.init();                 // 1. load storage (or sample data)
    WW.report.init();               // 2. wire up each feature
    WW.track.init();
    WW.admin.init();
    WW.guide.init();
    WW.data.subscribe(renderAll);   // 3. any data change re-renders all views
    WW.router.onChange(view => {
      if (view !== 'report') WW.report.hideSuccess();
      renderAll();
    });
    WW.router.init();               // 4. show the first view (also triggers renderAll)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();