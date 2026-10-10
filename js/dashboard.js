/* 6. dashboard.js: summary metrics + ranked hotspot list */
WW.dashboard = (() => {
  const { $, esc, badge } = WW.utils;
  const HOTSPOT_MIN_OPEN = 2;   // 2+ unresolved reports at one place = hotspot

  // "Main  Canteen," and "main canteen" count as the same place
  const normalizeLoc = s => s.toLowerCase().replace(/[.,;:!]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Returns locations ranked by open reports, then by total reports
  function groups() {
    const map = new Map();
    for (const c of WW.data.all().reverse()) {   // oldest first, so the original spelling is the display name
      const key = normalizeLoc(c.location_text);
      if (!map.has(key)) map.set(key, { name: c.location_text, total: 0, open: 0, inProgress: 0 });
      const g = map.get(key);
      g.total++;
      if (c.status !== 'Resolved') g.open++;
      if (c.status === 'In Progress') g.inProgress++;
    }
    return [...map.values()]
      .map(g => ({ ...g, status: g.open === 0 ? 'Resolved' : g.inProgress === g.open ? 'In Progress' : 'Submitted' }))
      .sort((a, b) => b.open - a.open || b.total - a.total);
  }

  function render() {
    const s = WW.data.stats();
    $('#metrics').innerHTML = [['Total reports', s.total], ['Open reports', s.open], ['Resolved reports', s.resolved]]
      .map(([label, n]) => <div class="card"><strong>${n}</strong><span>${label}</span></div>).join('');

    const list = groups();
    if (!list.length) { $('#hs').innerHTML = '<li class="sub">No reports yet.</li>'; return; }

    const max = Math.max(1, ...list.map(g => g.open));
    $('#hs').innerHTML = list.map((g, i) => {
      const hot = g.open >= HOTSPOT_MIN_OPEN;
      const width = g.open ? Math.round(g.open / max * 100) : 100;
      return `<li>
        <span class="rk">${i + 1}</span>
        <div><b>${esc(g.name)}</b> ${hot ? '<span class="badge s-In-Progress">Hotspot</span>' : ''}
          <div class="sub">${g.total} report${g.total > 1 ? 's' : ''} total, ${g.open} open</div></div>
        ${badge(g.status)}
        <div class="meter" role="img" aria-label="${g.open} open reports"><i class="${g.open ? '' : 'z'}" style="width:${width}%"></i></div>
      </li>`;
    }).join('');
  }

  return { groups, render, HOTSPOT_MIN_OPEN };
})();