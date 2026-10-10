/* 5. track.js: look up a complaint by ID and show its live status */
WW.track = (() => {
  const { $, esc, badge, formatDate, safeImg } = WW.utils;
  let searched = false;
  let query = '';

  // Accepts "ww-8492", "WW 8492", "ww8492"
  function normalize(raw) {
    let q = raw.replace(/\s+/g, '').toUpperCase();
    if (/^WW\d+$/.test(q)) q = 'WW-' + q.slice(2);
    return q;
  }

  function render() {
    const out = $('#tres');
    if (!searched) { out.innerHTML = ''; return; }
    if (!query) { out.innerHTML = '<p class="sub">Enter a complaint ID to see its status.</p>'; return; }

    const c = WW.data.getById(query);
    if (!c) {
      out.innerHTML = `<div class="card" style="border-color:var(--err)"><b>No complaint found for "${esc(query)}".</b>
        <p class="sub" style="margin:6px 0 0">IDs look like WW-8492. Check for typos, or submit a new report.</p></div>`;
      return;
    }

    const step = WW.data.STATUSES.indexOf(c.status);
    const img = safeImg(c.photo_url);
    out.innerHTML = `<div class="card">
      <div class="row" style="justify-content:space-between;align-items:center"><h3>${esc(c.id)}</h3>${badge(c.status)}</div>
      <div class="steps" aria-hidden="true">${WW.data.STATUSES.map((s, i) => `<i class="${i <= step ? 'd' : ''}"></i>`).join('')}</div>
      <dl>
        <dt>Category</dt><dd>${esc(c.category)}</dd>
        <dt>Location</dt><dd>${esc(c.location_text)}</dd>
        <dt>Date</dt><dd>${formatDate(c.created_at)}</dd>
        <dt>Description</dt><dd>${esc(c.description)}</dd>
        ${img ? `<dt>Photo</dt><dd><img src="${img}" alt="Photo submitted with ${esc(c.id)}" style="max-width:100%;max-height:220px;border-radius:8px"></dd>` : ''}
      </dl></div>`;
  }

  // Programmatic lookup (used by the "Track this complaint" button)
  function show(id) {
    $('#tid').value = id;
    searched = true;
    query = normalize(id);
    render();
  }

  function init() {
    $('#tf').addEventListener('submit', e => {
      e.preventDefault();
      searched = true;
      query = normalize($('#tid').value);
      render();
    });
  }

  // Called whenever data changes so an open result updates in real time
  const refresh = render;

  return { init, show, refresh };
})();