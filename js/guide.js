/* 8. guide.js: recycling guide with search + category chips */
WW.guide = (() => {
  const { $, $$, esc } = WW.utils;

  const TIPS = [
    ['Plastic', 'Bottles and containers', 'Rinse, remove caps, and crush. Check for a recycling number 1 or 2; those are widely accepted.'],
    ['Plastic', 'Plastic bags and wrappers', 'Not accepted in most curbside bins. Reuse them, or take them to a store drop-off point.'],
    ['Paper', 'Cardboard and newspaper', 'Flatten boxes and keep them dry. Wet or greasy paper belongs in compost.'],
    ['Paper', 'Pizza boxes', 'Cut off the clean top for recycling. The greasy bottom goes to compost or general waste.'],
    ['Glass & metal', 'Glass bottles and jars', 'Empty and rinse. Do not mix with ceramics, mirrors or window glass.'],
    ['Glass & metal', 'Cans and foil', 'Rinse cans and crush lightly. Clean foil can be balled up and recycled.'],
    ['Organic', 'Food scraps and leaves', 'Compost fruit and vegetable waste, tea leaves and garden trimmings. Avoid meat and dairy in small bins.'],
    ['Hazardous', 'Batteries and e-waste', 'Never bin them. Use a collection point; batteries can start fires in trucks.'],
    ['Hazardous', 'Medicines and chemicals', 'Return unused medicines to a pharmacy. Keep paint and solvents sealed and use a hazardous waste drop-off.'],
  ];
  const CATEGORIES = ['All', ...new Set(TIPS.map(t => t[0]))];
  let active = 'All';

  function render() {
    // chips are built once; only their pressed state changes (keeps keyboard focus)
    $$('#gc button').forEach(b => b.setAttribute('aria-pressed', b.dataset.c === active));

    const q = $('#gs').value.trim().toLowerCase();
    const hits = TIPS.filter(([cat, title, text]) =>
      (active === 'All' || cat === active) && `${cat} ${title} ${text}`.toLowerCase().includes(q));

    $('#gl').innerHTML = hits.map(([cat, title, text]) =>
      `<div class="card"><span class="tag">${esc(cat)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`).join('')
      || '<p class="sub">Nothing matches. Try a broader word such as "plastic" or "paper".</p>';
  }

  function init() {
    $('#gc').innerHTML = CATEGORIES.map(c => `<button type="button" data-c="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('');
    $('#gc').addEventListener('click', e => {
      const b = e.target.closest('button[data-c]');
      if (b) { active = b.dataset.c; render(); }
    });
    $('#gs').addEventListener('input', render);
    render();
  }

  return { init, render };
})();