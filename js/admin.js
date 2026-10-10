/* 7. admin.js: reviewer console (mock auth, status changes, filter) */
WW.admin = (() => {
  const { $, esc, toast, formatDate, safeImg } = WW.utils;
  const DEMO_CODE = 'reviewer';   // demo only. Real apps need server-side authentication
  const SESSION_KEY = 'ww-reviewer';
  let authed = false;
  try { authed = sessionStorage.getItem(SESSION_KEY) === '1'; } catch { /* ignore */ }

  function setAuth(value) {
    authed = value;
    try { value ? sessionStorage.setItem(SESSION_KEY, '1') : sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    render();
  }

  function render() {
    $('#gate').hidden = authed;
    $('#panel').hidden = !authed;
    if (!authed) return;

    const keepFocus = document.activeElement?.dataset?.id;   // keep keyboard focus after re-render
    const filter = $('#flt').value;
    const rows = WW.data.all().filter(c => !filter || c.status === filter);

    $('#ab').innerHTML = rows.map(c => {
      const img = safeImg(c.photo_url);
      return `<tr>
        <td><b>${esc(c.id)}</b></td>
        <td>${esc(c.category)}<div class="sub">${esc(c.description)}</div>
          ${img ? `<img src="${img}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:6px;margin-top:6px">` : ''}</td>
        <td>${esc(c.location_text)}</td>
        <td>${formatDate(c.created_at)}</td>
        <td><select data-id="${esc(c.id)}" aria-label="Status for ${esc(c.id)}">
          ${WW.data.STATUSES.map(s => `<option${s === c.status ? ' selected' : ''}>${s}</option>`).join('')}
        </select></td></tr>`;
    }).join('') || '<tr><td colspan="5" class="sub">No complaints with this status.</td></tr>';

    if (keepFocus) $(`#ab select[data-id="${keepFocus}"]`)?.focus();
  }

  function init() {
    $('#af').addEventListener('submit', e => {
      e.preventDefault();
      if ($('#code').value.trim().toLowerCase() === DEMO_CODE) {
        $('#code').value = '';
        $('#e-code').textContent = '';
        setAuth(true);
      } else {
        $('#e-code').textContent = 'Incorrect code. Use the demo code shown above.';
      }
    });
    $('#out').addEventListener('click', () => setAuth(false));
    $('#flt').addEventListener('change', render);

    // Changing a status saves to storage; data.js then notifies every view to refresh
    $('#ab').addEventListener('change', e => {
      const sel = e.target.closest('select[data-id]');
      if (sel && WW.data.setStatus(sel.dataset.id, sel.value)) toast(`${sel.dataset.id} is now ${sel.value}`);
    });
  }

  return { init, render };
})();