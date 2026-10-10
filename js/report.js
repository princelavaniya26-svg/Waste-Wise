/* 4. report.js: complaint submission (validation, optional photo, ID, success state) */
WW.report = (() => {
  const { $, toast } = WW.utils;
  const MAX_PHOTO_PX = 800;   // photos are shrunk so they fit in localStorage

  const FIELDS = {
    cat:  { el: () => $('#cat'),  msg: 'Choose a category.' },
    loc:  { el: () => $('#loc'),  msg: 'Enter where the problem is.' },
    desc: { el: () => $('#desc'), msg: 'Describe the problem in a sentence or two.' },
  };

  // Returns true when all required fields are filled; marks the invalid ones
  function validate() {
    let firstBad = null;
    for (const [key, f] of Object.entries(FIELDS)) {
      const el = f.el();
      const bad = !el.value.trim();
      el.setAttribute('aria-invalid', bad);
      $('#e-' + key).textContent = bad ? f.msg : '';
      if (bad && !firstBad) firstBad = el;
    }
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  // Resize an image file to a small JPEG data-URL. Resolves '' if anything fails.
  const readPhoto = file => new Promise(resolve => {
    if (!file || !file.type.startsWith('image/')) return resolve('');
    const reader = new FileReader();
    reader.onerror = () => resolve('');
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve('');
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_PX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const file = $('#photo').files[0];
      const photo_url = await readPhoto(file);
      const rec = WW.data.add({
        category: $('#cat').value,
        location_text: $('#loc').value.trim().replace(/\s+/g, ' '),
        description: $('#desc').value.trim(),
        photo_url,
      });
      e.target.reset();
      $('#newid').textContent = rec.id;
      const ok = $('#ok');
      ok.hidden = false;
      ok.focus();
      if (file && !rec.photo_url) toast('Report saved, but the photo could not be stored.');
    } finally {
      btn.disabled = false;
    }
  }

  const hideSuccess = () => { $('#ok').hidden = true; };

  function init() {
    $('#f').addEventListener('submit', onSubmit);
    // clear error styling as the user types
    Object.entries(FIELDS).forEach(([key, f]) => f.el().addEventListener('input', () => {
      f.el().setAttribute('aria-invalid', false);
      $('#e-' + key).textContent = '';
    }));
    $('#trk').addEventListener('click', () => {
      WW.track.show($('#newid').textContent);
      WW.router.go('track');
    });
  }

  return { init, hideSuccess };
})();