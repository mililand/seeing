/* script.js — Seeing Eyes donation page (clean build)
   - Top donation box (BASE) is independent from slider selections (EXTRAS)
   - Impact counters use BASE only: meals=₪20, hours=₪300, vet=₪500
   - Bottom summary totals EXTRAS only
   - Circular slider, a11y helpers, and Hebrew date preserved
*/

// ------------------------------
// Tiny helpers
// ------------------------------
const $ = (id) => document.getElementById(id);
const fmt = (n) => '₪' + (Number(n)||0).toLocaleString('he-IL');

// ------------------------------
/** App state */
// ------------------------------
const state = {
  freq: 'monthly',                 // or 'once' (UI only)
  amount: 180,                     // base donation (top box)
  custom: 0,                       // custom when 'סכום אחר'
  selections: [],                  // slider "purchases" (extras)
};

// ------------------------------
/** Impact calculation — BASE ONLY */
// ------------------------------
function impactFrom(base) {
  return {
    meals: Math.floor(base / 20),
    hours: Math.floor(base / 300),
    vet:   Math.floor(base / 500),
  };
}

// ------------------------------
/** Render impact counters + bottom total (EXTRAS ONLY) */
// ------------------------------
function recalc() {
  const base = (state.amount === 'סכום אחר') ? Number(state.custom||0) : Number(state.amount||0);
  const extras = state.selections.reduce((s, it) => s + Number(it.price||0), 0);

  // Impact from BASE only
  const meals = Math.floor(base / 20);
  const hours = Math.floor(base / 300);
  const vet   = Math.floor(base / 500);
  const ibMeals = $('ibMeals'), ibTraining = $('ibTraining'), ibVet = $('ibVet');
  if (ibMeals)    ibMeals.textContent    = (meals > 0 ? meals.toLocaleString('he-IL') : '0') + '+';
  if (ibTraining) ibTraining.textContent = hours;
  if (ibVet)      ibVet.textContent      = vet;

  // Bottom total = EXTRAS only
  const sumEl = $('sumTotal');
  if (sumEl) sumEl.textContent = '₪' + (extras||0).toLocaleString('he-IL');
}
// Public fallback for legacy inline calls
window._recalc = function(){
  var base = (window.__ui.amount === 'סכום אחר' ? Number(window.__ui.custom)||0 : Number(window.__ui.amount)||0);
  var extras = window.__ui.selections.reduce(function(s,it){return s + (Number(it.price)||0)},0);
  var sumEl = $('sumTotal'); if(sumEl) sumEl.textContent = '₪' + (extras||0).toLocaleString('he-IL');
  _impact(base);
};

// ------------------------------
/** Donation amount (top) controls */
// ------------------------------
window._setFreq = function(freq) {
  state.freq = (freq === 'once') ? 'once' : 'monthly';
  // Toggle UI classes
  const wrap = $('freqToggle');
  if (!wrap) return;
  for (const btn of wrap.querySelectorAll('button[data-freq]')) {
    const is = btn.getAttribute('data-freq') === state.freq;
    btn.setAttribute('aria-pressed', is ? 'true' : 'false');
    btn.classList.toggle('bg-indigo-700', is);
    btn.classList.toggle('text-white', is);
    btn.classList.toggle('bg-white', !is);
  }
};

window._pickAmount = function(val, btn) {
  if (val === 'סכום אחר') {
    state.amount = 'סכום אחר';
    const wrap = $('customWrap');
    if (wrap) wrap.classList.remove('hidden');
    const input = $('customAmount');
    if (input) { input.focus(); }
  } else {
    state.amount = Number(val)||0;
    const wrap = $('customWrap');
    if (wrap) wrap.classList.add('hidden');
  }
  // UI select
  const group = $('amountPresets');
  if (group) {
    group.querySelectorAll('.pill').forEach(p => p.classList.remove('sel'));
    if (btn) btn.classList.add('sel');
  }
  recalc();
};

// Custom input
document.addEventListener('input', (e) => {
  const target = e.target;
  if (target && target.id === 'customAmount') {
    state.custom = Number(target.value||0);
    if (state.amount === 'סכום אחר') recalc();
  }
});

// ------------------------------
/** Slider selections (EXTRAS) */
// ------------------------------
window._addItem = function(title, price) {
  const p = Number(price)||0;
  state.selections.push({ title: String(title||'פריט'), price: p, id: Date.now() + Math.random().toString(36).slice(2) });
  renderList();
  recalc();
};

function removeItem(id) {
  state.selections = state.selections.filter(i => i.id !== id);
  renderList();
  recalc();
}

function renderList() {
  const ul = $('list');
  const empty = $('emptyList');
  if (!ul) return;
  ul.innerHTML = '';
  if (!state.selections.length) {
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  for (const it of state.selections) {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between gap-3 border rounded-xl p-3';
    li.innerHTML = `
      <span class="text-slate-700">${it.title}</span>
      <span class="ms-2 font-bold">${fmt(it.price)}</span>
      <button class="text-sm underline" type="button" aria-label="הסרה" data-remove="${it.id}">הסרה</button>
    `;
    ul.appendChild(li);
  }
}

// Handle remove clicks
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t && t.matches('button[data-remove]')) {
    const id = t.getAttribute('data-remove');
    removeItem(id);
  }
});

// ------------------------------
/** CTAs — fully decoupled */
// ------------------------------
function initCTAs() {
  const topBtn = $('donateNowTop');
  const bottomBtn = $('donateNowBottom');
  const moreWays = $('moreWays');

  if (topBtn) topBtn.addEventListener('click', () => {
    const base = (state.amount === 'סכום אחר') ? Number(state.custom||0) : Number(state.amount||0);
    if (!base) { alert('נא לבחור סכום לתרומה (מעל 0)'); return; }
    alert('דמו: תרומה על הסכום הנבחר בתיבה העליונה: ' + fmt(base));
  });

  if (bottomBtn) bottomBtn.addEventListener('click', () => {
    const extras = state.selections.reduce((s, it) => s + Number(it.price||0), 0);
    if (!extras) { alert('נא לבחור פריט אחד לפחות מהרשימה'); return; }
    alert('דמו: תרומה עבור הפריטים שנבחרו בסליידר: ' + fmt(extras));
  });

  if (moreWays) moreWays.addEventListener('click', () => {
    alert('דמו: העברה בנקאית, ביט/פייבוקס, צ׳ק.');
  });
}

// ------------------------------
/** Circular slider */
// ------------------------------
function initSlider() {
  const track = document.getElementById('cardsTrack');
  if (!track) return;
  const prev = document.getElementById('slidePrev');
  const next = document.getElementById('slideNext');

  function gapPx() {
    const st = getComputedStyle(track);
    const raw = (st.gap || st.columnGap || '0').replace('px','').trim();
    return parseInt(raw || '0', 10);
  }
  function cardWidth() {
    const c = track.querySelector('.card');
    if (!c) return 340;
    const rect = c.getBoundingClientRect();
    return Math.round(rect.width + gapPx());
  }

  function slide(dir) {
    const w = cardWidth();
    if (dir === 'next') {
      track.scrollBy({ left: w, behavior: 'smooth' });
      setTimeout(() => {
        if (track.firstElementChild) track.appendChild(track.firstElementChild);
        track.scrollLeft -= w;
      }, 260);
    } else {
      if (track.lastElementChild) {
        track.insertBefore(track.lastElementChild, track.firstElementChild);
        track.scrollLeft += w;
      }
      track.scrollBy({ left: -w, behavior: 'smooth' });
    }
  }

  if (prev) prev.addEventListener('click', () => slide('prev'));
  if (next) next.addEventListener('click', () => slide('next'));
  window._slide = slide;
}

// ------------------------------
/** Hebrew date for certificate (kept) */
// ------------------------------
async function setHebrewDate() {
  try {
    const d = new Date();
    const gy = d.getFullYear();
    const gm = d.getMonth() + 1;
    const gd = d.getDate();
    const g = `${String(gd).padStart(2,'0')}.${String(gm).padStart(2,'0')}.${gy}`;
    const gEl = $('certDate');
    if (gEl) gEl.textContent = g;
    const url = `https://www.hebcal.com/converter?cfg=json&gy=${gy}&gm=${gm}&gd=${gd}&g2h=1&strict=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Hebcal fetch failed');
    const j = await res.json();
    const heb = j.hebrew || '';
    const hEl = $('certDateHebrew');
    if (hEl) hEl.textContent = heb;
  } catch (e) {
    const hEl = $('certDateHebrew');
    if (hEl) hEl.textContent = '';
    console.warn('Hebrew date lookup failed', e);
  }
}

// ------------------------------
/** A11y improvements (kept) */
// ------------------------------
function initA11y() {
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
}

// ------------------------------
/** Boot */
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Default UI state
  window._setFreq(state.freq);
  // Ensure top default is 180 (selected pill already has .sel in HTML)
  recalc();
  renderList();
  initCTAs();
  initSlider();
  initA11y();
  setHebrewDate();
});
