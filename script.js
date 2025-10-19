/* script.js — Seeing Eyes donation page
   - Renders amount presets
   - Updates impact counters
   - Handles "call me" modal with validation
*/
document.addEventListener('DOMContentLoaded', () => {
  // ---- tiny helpers
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => '₪' + (Number(n) || 0).toLocaleString('he-IL');

  // ---- state
  const state = {
    freq: 'monthly',
    amountPresets: [50, 100, 180, 360, 1000, 'סכום אחר'],
    amount: 180,
    custom: 0,
    selections: []
  };

  // ---- build amount pills
  function buildPresets() {
    const wrap = $('amountPresets');
    if (!wrap) return;

    wrap.innerHTML = ''; // clear if re-run
    state.amountPresets.forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pill' + (a === state.amount ? ' sel' : '');
      b.textContent = typeof a === 'number' ? '₪' + a.toLocaleString('he-IL') : a;

      b.onclick = () => {
        state.amount = a;
        wrap.querySelectorAll('.pill').forEach((p) => p.classList.remove('sel'));
        b.classList.add('sel');
        const customWrap = $('customWrap');
        if (customWrap) customWrap.classList.toggle('hidden', a !== 'סכום אחר');
        recalc();
      };

      wrap.appendChild(b);
    });
  }

  // ---- freq toggle
  function initFreqToggle() {
    const toggle = $('freqToggle');
    if (!toggle) return;
    toggle.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        toggle.querySelectorAll('button').forEach((b) => b.classList.remove('bg-indigo-700', 'text-white'));
        btn.classList.add('bg-indigo-700', 'text-white');
        state.freq = btn.dataset.freq || 'monthly';
      });
    });
  }

  // ---- custom amount
  function initCustom() {
    const input = $('customAmount');
    if (input) {
      input.addEventListener('input', (e) => {
        state.custom = e.target.value;
        recalc();
      });
    }
  }

  // ---- supports add buttons
  function initSupportButtons() {
    document.querySelectorAll('[data-add]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selections.push({
          title: btn.getAttribute('title'),
          price: Number(btn.getAttribute('data-price'))
        });
        renderSelections();
        recalc();
      });
    });
  }

  function renderSelections() {
    const list = $('list');
    const empty = $('emptyList');
    if (!list || !empty) return;

    list.innerHTML = '';
    empty.classList.toggle('hidden', !!state.selections.length);

    state.selections.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between';
      li.innerHTML = `
        <span>${it.title}</span>
        <span>${fmt(it.price)}
          <button data-rm="${i}" class="bg-white border rounded-xl px-2 py-1 text-xs">הסרה</button>
        </span>`;
      list.appendChild(li);
    });

    list.querySelectorAll('[data-rm]').forEach((b) =>
      b.addEventListener('click', () => {
        const i = Number(b.getAttribute('data-rm'));
        state.selections.splice(i, 1);
        renderSelections();
        recalc();
      })
    );
  }

  // ---- impact + total
  function recalc() {
    const base = state.amount === 'סכום אחר' ? Number(state.custom || 0) : Number(state.amount || 0);
    const extras = state.selections.reduce((s, it) => s + Number(it.price || 0), 0);
    const total = base + extras;

    // impact: simple heuristics
    const meals = Math.floor(total / 25) * 10;
    const weeks = Math.floor(total / 360);
    const vet = Math.floor(total / 250);

    const sumEl = $('sumTotal');
    if (sumEl) sumEl.textContent = fmt(total);

    const ibMeals = $('ibMeals');
    const ibTraining = $('ibTraining');
    const ibVet = $('ibVet');
    if (ibMeals) ibMeals.textContent = (meals > 0 ? meals.toLocaleString('he-IL') : '0') + '+';
    if (ibTraining) ibTraining.textContent = weeks;
    if (ibVet) ibVet.textContent = vet;
  }

  // ---- CTAs (demo)
  function initCTAs() {
    const topBtn = $('donateNowTop');
    const bottomBtn = $('donateNowBottom');
    const moreWays = $('moreWays');
    if (topBtn && bottomBtn) topBtn.addEventListener('click', () => bottomBtn.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    if (bottomBtn) bottomBtn.addEventListener('click', () => alert('דמו: כאן ישתלב טופס סליקה מאובטח.'));
    if (moreWays) moreWays.addEventListener('click', () => alert('דמו: העברה בנקאית, ביט/פייבוקס, צ׳ק.'));
  }

  // ---- dedication preview
  function initDedication() {
    const certDate = $('certDate');
    if (certDate) {
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = d.getFullYear();
      certDate.textContent = `${dd}.${mm}.${yy}`;
    }
    const dn = $('dedName');
    const ddn = $('dedDonor');
    const dt = $('dedType');
    const cn = $('certName');
    const cd = $('certDonor');

    function upd() {
      const name = dn ? dn.value.trim() : '';
      const donor = ddn ? ddn.value.trim() : '';
      const type = dt ? dt.value : 'לזכר/לע"נ';
      if (cn) cn.textContent = 'ל' + type + ': ' + (name || '—');
      if (cd) cd.textContent = donor || '—';
    }
    if (dn) dn.addEventListener('input', upd);
    if (ddn) ddn.addEventListener('input', upd);
    if (dt) dt.addEventListener('change', upd);

    const att = document.getElementById('attachDed');
    if (att) att.addEventListener('click', () => alert('ההקדשה תצורף לתרומה (דמו).'));
  }

  // ---- modal (call me)
  function initModal() {
    const callModal = $('callModal');
    const callBtn = $('callMeBtn');
    const closeBtn = $('callClose');
    const cbName = $('cbName');
    const cbPhone = $('cbPhone');
    const cbPolicy = $('cbPolicy');
    const cbSubmit = $('cbSubmit');

    function openM() { if (callModal) callModal.classList.remove('hidden'); }
    function closeM() { if (callModal) callModal.classList.add('hidden'); }

    if (callBtn) callBtn.addEventListener('click', openM);
    if (closeBtn) closeBtn.addEventListener('click', closeM);

    if (callModal) {
      callModal.addEventListener('click', (e) => { if (e.target === callModal) closeM(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeM(); });
    }

    function validPhone(p) { return /^0\d{8,10}$/.test(String(p).replace(/\D/g, '')); }

    if (cbSubmit) {
      cbSubmit.addEventListener('click', () => {
        const name = (cbName && cbName.value.trim()) || '';
        const phone = (cbPhone && cbPhone.value.trim()) || '';
        if (!name) { alert('נא למלא שם מלא'); cbName && cbName.focus(); return; }
        if (!validPhone(phone)) { alert('נא למלא מספר טלפון תקין'); cbPhone && cbPhone.focus(); return; }
        if (!cbPolicy || !cbPolicy.checked) { alert('נא לאשר את מדיניות הפרטיות'); return; }
        alert('תודה! נחזור אליך להשלמת התרומה.');
        closeM();
        if (cbName) cbName.value = '';
        if (cbPhone) cbPhone.value = '';
        if (cbPolicy) cbPolicy.checked = false;
      });
    }
  }

  // ---- boot
  buildPresets();
  initFreqToggle();
  initCustom();
  initSupportButtons();
  initCTAs();
  initDedication();
  initModal();
  recalc(); // initial render
});
