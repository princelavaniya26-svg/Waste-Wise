/* 2. data.js: state + storage core. Single source of truth for all complaints.
   Every change is saved to localStorage and announced to subscribers,
   so every view can re-render instantly. */
WW.data = (() => {
  const KEY = 'ww-complaints-v2';
  const STATUSES = ['Submitted', 'In Progress', 'Resolved'];
  const listeners = new Set();
  let items = [];

  const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString();

  // Default sample records: id, category, location_text, description, days ago, status
  const seed = () => [
    ['WW-8492', 'Overflowing bin', 'Main Canteen', 'Bins by the rear gate are overflowing every evening after dinner.', 2, 'In Progress'],
    ['WW-7310', 'Garbage pile / illegal dumping', 'Hostel B Back Lane', 'Construction debris and household waste dumped behind the wall.', 5, 'Submitted'],
    ['WW-6025', 'Missed collection', 'Library Entrance', 'Collection skipped twice this week; bags are piling by the steps.', 9, 'Resolved'],
    ['WW-5581', 'Overflowing bin', 'Main Canteen', 'Same bins again, spilling onto the walkway.', 6, 'Submitted'],
    ['WW-4417', 'Garbage pile / illegal dumping', 'Main Canteen', 'Food waste dumped next to the bins, attracting dogs.', 11, 'Resolved'],
    ['WW-3902', 'Missed collection', 'Main Canteen', 'Truck did not arrive on Tuesday.', 14, 'In Progress'],
    ['WW-3376', 'Overflowing bin', 'Hostel B Back Lane', 'Bin lid broken and trash scattered.', 8, 'In Progress'],
    ['WW-2840', 'Garbage pile / illegal dumping', 'Hostel B Back Lane', 'Old mattresses left near the drain.', 3, 'Submitted'],
    ['WW-2219', 'Other', 'Sports Ground Gate', 'Plastic bottles littering the track after the match.', 4, 'Resolved'],
    ['WW-1873', 'Overflowing bin', 'Ridge Market Road', 'Market bin full since morning.', 1, 'Submitted'],
    ['WW-1456', 'Missed collection', 'Ridge Market Road', 'Door-to-door pickup skipped.', 7, 'Submitted'],
    ['WW-1102', 'Other', 'Library Entrance', 'No separate bin for paper waste.', 12, 'Resolved'],
  ].map(([id, category, location_text, description, d, status]) =>
    ({ id, category, location_text, description, status, created_at: daysAgo(d), photo_url: '' }));

  const isValid = c => c && typeof c.id === 'string' && STATUSES.includes(c.status);

  function readStorage() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(parsed) && parsed.length) return parsed.filter(isValid);
    } catch { /* corrupted or blocked storage: fall back to seed */ }
    return null;
  }

  // Returns true if saved. False if storage is full or blocked.
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); return true; }
    catch { return false; }
  }

  const emit = () => listeners.forEach(fn => fn());

  function init() {
    items = readStorage() || seed();
    persist();
    // Keep several open tabs in sync
    window.addEventListener('storage', e => {
      if (e.key === KEY) { items = readStorage() || items; emit(); }
    });
  }

  // ---- getters ----
  const all = () => [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const getById = id => items.find(c => c.id.toUpperCase() === String(id).trim().toUpperCase()) || null;

  function stats() {
    const resolved = items.filter(c => c.status === 'Resolved').length;
    return { total: items.length, open: items.length - resolved, resolved };
  }

  // ---- setters ----
  function newId() {
    let id;
    do { id = 'WW-' + (1000 + Math.floor(Math.random() * 9000)); } while (getById(id));
    return id;
  }

  function add({ category, location_text, description, photo_url = '' }) {
    const rec = {
      id: newId(), category, location_text, description,
      status: 'Submitted', created_at: new Date().toISOString(), photo_url,
    };
    items.unshift(rec);
    // If the photo makes storage overflow, keep the report but drop the photo
    if (!persist() && rec.photo_url) { rec.photo_url = ''; persist(); }
    emit();
    return rec;
  }

  function setStatus(id, status) {
    const c = getById(id);
    if (!c || !STATUSES.includes(status)) return false;
    c.status = status;
    c.updated_at = new Date().toISOString();
    persist();
    emit();
    return true;
  }

  function reset() { items = seed(); persist(); emit(); }

  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  return { STATUSES, init, all, getById, stats, add, setStatus, reset, subscribe };
})();