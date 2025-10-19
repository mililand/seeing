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
    const meals = Math.floor(total / 20);
    const weeks = Math.floor(total / 3000);
    const vet = Math.floor(total / 1600);

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


// === Extracted from index.html on 2025-10-19 15:36 ===
// minimal bootstrap to guarantee clickability even if later JS fails
(function(){
  function $(id){return document.getElementById(id)}
  function fmt(n){ n = Number(n)||0; return '₪' + n.toLocaleString('he-IL') }
  // Fallback state (used if main script fails)
  window.__ui = window.__ui || { freq:'monthly', amount:180, custom:0, selections:[] };

  window._setFreq = function(mode){
    try{
      var buttons = document.querySelectorAll('#freqToggle button');
      buttons.forEach(function(b){
        b.classList.remove('bg-indigo-700','text-white');
        if(!b.classList.contains('bg-white')) b.classList.add('bg-white');
        b.setAttribute('aria-pressed','false');
      });
      var sel = document.querySelector('#freqToggle button[data-freq="'+mode+'"]');
      if(sel){
        sel.classList.remove('bg-white');
        sel.classList.add('bg-indigo-700','text-white');
        sel.setAttribute('aria-pressed','true');
      }
      window.__ui.freq = mode;
    }catch(e){ console.error(e); }
  };

  window._pickAmount = function(val, el){
    try{
      var wrap = $('amountPresets');
      if(wrap){
        wrap.querySelectorAll('.pill').forEach(function(p){ p.classList.remove('sel'); });
        el && el.classList.add('sel');
      }
      var customWrap = $('customWrap');
      if(val === 'other'){
        if(customWrap) customWrap.classList.remove('hidden');
        window.__ui.amount = window.__ui.custom || 0;
      }else{
        if(customWrap) customWrap.classList.add('hidden');
        window.__ui.amount = Number(val)||0;
      }
      _recalc();
    }catch(e){ console.error(e); }
  };

  window._bindCustom = function(){
    var input = $('customAmount');
    if(!input) return;
    input.addEventListener('input', function(e){
      window.__ui.custom = Number(e.target.value)||0;
      var sel = document.querySelector('#amountPresets .pill.sel');
      if(sel && sel.textContent.trim()==='סכום אחר'){ window.__ui.amount = window.__ui.custom; _recalc(); }
    });
  };

  window._addItem = function(title, price){
    try{
      window.__ui.selections.push({title:title, price:Number(price)||0});
      _renderList();
      _recalc();
    }catch(e){ console.error(e); }
  };

  window._rmItem = function(idx){
    try{
      window.__ui.selections.splice(idx,1);
      _renderList();
      _recalc();
    }catch(e){ console.error(e); }
  };

  function _renderList(){
    var list = $('list'); var empty = $('emptyList');
    if(!list || !empty) return;
    list.innerHTML = '';
    if(!window.__ui.selections.length){ empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    window.__ui.selections.forEach(function(it, i){
      var li = document.createElement('li');
      li.className = 'flex items-center justify-between';
      li.innerHTML = '<span>'+it.title+'</span><span>'+fmt(it.price)+' <button class="bg-white border rounded-xl px-2 py-1 text-xs" onclick="window._rmItem('+i+')">הסרה</button></span>';
      list.appendChild(li);
    });
  }

  function _impact(total){
    var meals = Math.floor(total / 20);
    var weeks = Math.floor(total / 3000);
    var vet = Math.floor(total / 1600);
    var ibMeals = $('ibMeals'); var ibTraining = $('ibTraining'); var ibVet = $('ibVet');
    if(ibMeals) ibMeals.textContent = (meals>0 ? meals.toLocaleString('he-IL') : '0') + '+';
    if(ibTraining) ibTraining.textContent = weeks;
    if(ibVet) ibVet.textContent = vet;
  }

  window._recalc = function(){
    var sum = (Number(window.__ui.amount)||0) + window.__ui.selections.reduce(function(s,it){return s + (Number(it.price)||0)},0);
    var sumEl = $('sumTotal'); if(sumEl) sumEl.textContent = fmt(sum);
    _impact(sum);
  };

  window._openM = function(){
    try{ var m=$('callModal'); if(!m) return; m.classList.remove('hidden'); m.classList.add('flex'); }catch(e){ console.error(e); }
  };
  window._closeM = function(){
    try{ var m=$('callModal'); if(!m) return; m.classList.add('hidden'); m.classList.remove('flex'); }catch(e){ console.error(e); }
  };

  // initial binds (fallback)
  _bindCustom();
  try{
    var pills = document.querySelectorAll('#amountPresets .pill');
    pills.forEach(function(b){ if(b.textContent.trim()==='₪180'){ b.classList.add('sel'); } });
  }catch(e){}
  _recalc();
})();
console.log('[seeing-local] script loaded v2');

document.addEventListener('DOMContentLoaded', () => {
  // ---- tiny helpers
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => '₪' + (Number(n) || 0).toLocaleString('he-IL');

  // ---- state
  const state = {
    freq: 'monthly',
    amountPresets: [100, 180, 360, 555, 1000, 'סכום אחר'],
    amount: 180,
    custom: 0,
    selections: []
  };

  
  // ---- build/bind amount pills
  function buildPresets() {
    const wrap = $('amountPresets');
    if (!wrap) return;
    // If pills already exist (server-rendered), just bind:
    let pills = Array.from(wrap.querySelectorAll('button.pill'));
    if (pills.length) {
      // Ensure labels map to values:
      const map = {'₪100':100,'₪180':180,'₪360':360,'₪555':555,'₪1000':1000,'סכום אחר':'סכום אחר'};
      // Default selection: 180
      let defaultSet = false;
      pills.forEach((b) => {
        const txt = b.textContent.trim();
        const val = map.hasOwnProperty(txt) ? map[txt] : txt;
        b.addEventListener('click', () => {
          state.amount = val;
          pills.forEach((p) => p.classList.remove('sel'));
          b.classList.add('sel');
          const customWrap = $('customWrap');
          if (customWrap) customWrap.classList.toggle('hidden', val !== 'סכום אחר');
          recalc();
        });
        if (!defaultSet && val === 180) {
          b.classList.add('sel');
          defaultSet = true;
          state.amount = 180;
        }
      });
      return;
    }
    // Else: build from state
    wrap.innerHTML = '';
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

  // ---- freq toggle (robust)
  function initFreqToggle() {
    const toggle = $('freqToggle');
    if (!toggle) return;
    const buttons = toggle.querySelectorAll('button');
    function setActive(btn) {
      buttons.forEach((b) => {
        b.classList.remove('bg-indigo-700','text-white');
        if (!b.classList.contains('bg-white')) b.classList.add('bg-white');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.remove('bg-white');
      btn.classList.add('bg-indigo-700','text-white');
      btn.setAttribute('aria-pressed', 'true');
      state.freq = btn.dataset.freq || 'monthly';
    }
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => setActive(btn));
      btn.setAttribute('role','button');
      btn.setAttribute('aria-pressed', btn.classList.contains('bg-indigo-700') ? 'true' : 'false');
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
    const meals = Math.floor(total / 20);
    const weeks = Math.floor(total / 3000);
    const vet = Math.floor(total / 1600);

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
      if (cn) cn.textContent = 'שם המוקדש/ת: ' + (name || '—');
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

    function openM() { if (callModal) { callModal.classList.remove('hidden'); callModal.classList.add('flex'); } }
    function closeM() { if (callModal) { callModal.classList.add('hidden'); callModal.classList.remove('flex'); } }

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

  // ---- Lottie loader (lazy + reduced motion)
  function initLottie() {
    const items = Array.from(document.querySelectorAll('[data-lottie-path]'));
    if (!items.length) return;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      console.warn('Reduced motion enabled; skipping Lottie autoplay.');
      return;
    }
    if (!window.lottie) {
      console.warn('lottie-web not found; using SVG fallbacks.');
      return;
    }
    function loadOnce(el) {
      if (el.__lottieLoaded) return;
      const path = el.getAttribute('data-lottie-path');
      if (!path) return;
      try {
        window.lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, path });
        el.__lottieLoaded = true;
      } catch (e) { console.error('Lottie failed for', path, e); }
    }
    window.loadLottieOnce = loadOnce;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { loadOnce(entry.target); io.unobserve(entry.target); }
        });
      }, { root: null, rootMargin: '120px', threshold: 0.1 });
      items.forEach((el) => io.observe(el));
    } else {
      items.forEach(loadOnce);
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
  initLottie();
  initSlider();
});

  // ---- slider controls
  function initSlider() {
    const track = document.getElementById('cardsTrack');
    if (!track) return;
    const step = 340; // px approx. one card
    const prev = document.getElementById('slidePrev');
    const next = document.getElementById('slideNext');
    if (prev) prev.addEventListener('click', () => track.scrollBy({left: -step, behavior: 'smooth'}));
    if (next) next.addEventListener('click', () => track.scrollBy({left: step, behavior: 'smooth'}));
  }
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.meters').forEach(m => {
    m.querySelectorAll('.meter').forEach(mt => {
      const t = (mt.getAttribute('title') || '').trim();
      if (t !== 'בלאי') mt.remove();
    });
  });
});
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const d = new Date();
    const gy = d.getFullYear();
    const gm = d.getMonth() + 1;
    const gd = d.getDate();
    const g = `${String(gd).padStart(2,'0')}.${String(gm).padStart(2,'0')}.${gy}`;
    const gEl = document.getElementById('certDate');
    if (gEl) gEl.textContent = g;
    const url = `https://www.hebcal.com/converter?cfg=json&gy=${gy}&gm=${gm}&gd=${gd}&g2h=1&strict=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Hebcal fetch failed');
    const j = await res.json();
    const heb = j.hebrew || '';
    const hEl = document.getElementById('certDateHebrew');
    if (hEl) hEl.textContent = heb;
  } catch (e) {
    console.warn('Hebrew date lookup failed', e);
    const hEl = document.getElementById('certDateHebrew');
    if (hEl) hEl.textContent = '';
  }
});


// === Accessibility additions (2025-10-19 15:38) ===
(function(){ 
  try {
    var slider = document.getElementById('donation-slider');
    var prevBtn = document.getElementById('slidePrev');
    var nextBtn = document.getElementById('slideNext');
    if (slider && prevBtn && nextBtn) {
      slider.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') { nextBtn.click(); e.preventDefault(); }
        if (e.key === 'ArrowLeft')  { prevBtn.click(); e.preventDefault(); }
      });
    }
    var priceBtns = document.querySelectorAll('button[data-price]');
    priceBtns.forEach(function(btn){
      var p = btn.getAttribute('data-price');
      if (p && !btn.hasAttribute('aria-label')) {
        var amt = Number(p).toLocaleString('he-IL');
        btn.setAttribute('aria-label', 'הוספה לסל – ₪' + amt);
      }
      if (!btn.hasAttribute('type')) {
        btn.setAttribute('type','button');
      }
    });
  } catch(e){ console && console.warn && console.warn('a11y init', e); }
})();
