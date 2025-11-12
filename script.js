console.log('seeing boot');
/* script.js - Seeing Eyes donation page (clean build)
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
  certificateTemplate: 'honor',
  certificateAmount: 350,
  showCertificateAmount: true,
};

const certificateTemplates = {
  honor: {
    key: 'honor',
    title: 'תעודת הוקרה',
    subtitle: 'תודה על תרומתך',
    subline: 'בזכותך עוד אדם זוכה לביטחון ועצמאות.',
    description: 'תעודה הוקרה אישית להדפסה בתודה על תרומתכם תשלח אליכם במייל.'
  },
  memorial: {
    key: 'memorial',
    title: 'תרומה לזכר',
    subtitle: 'תודה על תרומתכם לזכר יקירכם',
    subline: 'במתנתכם אתם מנציחים באור ומעניקים עצמאות לאנשים עם עיוורון.',
    description: 'תעודה מעוצבת שמעניקה רגע של זיכרון טוב ומשקפת את התרומה שניתנה לזכר יקיר לבכם.'
  }
};

// ------------------------------
/** Modal helpers (callback request) */
// ------------------------------
function toggleModal(shouldShow) {
  const modal = $('callModal');
  if (!modal) return;
  if (shouldShow) {
    modal.classList.add('flex');
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}
window._openM = () => toggleModal(true);
window._closeM = () => toggleModal(false);

// ------------------------------
/** Certificate tabs + preview */
// ------------------------------
function updateCertificatePreview() {
  const tmpl = certificateTemplates[state.certificateTemplate] || certificateTemplates.honor;
  const titleEl = $('certTitle');
  const subtitleEl = $('certSubtitle');
  const descEl = $('certTemplateDescription');
  const sublineEl = $('certSubline');
  const preview = $('certificatePreview');
  if (titleEl) titleEl.textContent = tmpl.title;
  if (subtitleEl) subtitleEl.textContent = tmpl.subtitle;
  if (descEl) descEl.textContent = tmpl.description;
  if (sublineEl) sublineEl.textContent = tmpl.subline || '';
  if (preview) preview.setAttribute('data-template', tmpl.key);
  updateCertificateAmountDisplay();
}

function setCertificateTemplate(key) {
  if (!certificateTemplates[key]) return;
  state.certificateTemplate = key;
  document.querySelectorAll('.cert-tab-pill[data-cert-template]').forEach((btn) => {
    const isActive = btn.getAttribute('data-cert-template') === key;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  updateCertificatePreview();
}

function initCertificateTabs() {
  document.querySelectorAll('.cert-tab-pill[data-cert-template]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const template = btn.getAttribute('data-cert-template');
      setCertificateTemplate(template);
    });
  });
  // ensure UI reflects default
  setCertificateTemplate(state.certificateTemplate);
}

function updateCertificateAmountDisplay() {
  const display = $('certAmountPreview');
  const value = Math.max(Number(state.certificateAmount) || 0, 350);
  if (!display) return;
  if (!state.showCertificateAmount) {
    display.textContent = '';
    return;
  }
  const localized = value.toLocaleString('he-IL');
  display.textContent = `תרומה על סך ${localized} ש״ח`;
}

function initCertificateAmount() {
  const input = $('certAmountInput');
  if (!input) return;
  input.value = state.certificateAmount;
  const handle = () => {
    let val = Number(input.value);
    if (!Number.isFinite(val) || val < 350) {
      state.certificateAmount = 350;
    } else {
      state.certificateAmount = val;
    }
    input.value = state.certificateAmount;
    updateCertificateAmountDisplay();
  };
  input.addEventListener('input', handle);
  input.addEventListener('change', handle);
  handle();
}

function initCertificateAmountToggle() {
  const checkbox = $('certShowAmount');
  if (!checkbox) return;
  checkbox.checked = state.showCertificateAmount;
  checkbox.addEventListener('change', () => {
    state.showCertificateAmount = checkbox.checked;
    updateCertificateAmountDisplay();
  });
}

// ------------------------------
/** Impact calculation - BASE ONLY */
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
  recalc();
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
/** CTAs - fully decoupled */
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
/** Modal + dedication preview init */
// ------------------------------
function initModalControls() {
  const trigger = $('callMeBtn');
  const closeBtn = $('callClose');
  if (trigger) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      window._openM();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window._closeM();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window._closeM();
  });
}

function initDedicationPreview() {
  const nameInput = $('dedName');
  const donorInput = $('dedDonor');
  const msgInput = $('dedMsg');
  const certName = $('certName');
  const certDonor = $('certDonor');
  if (!nameInput && !donorInput && !msgInput) return;

  const namePlaceholder = 'יעל כהן';

  const sync = () => {
    const name = nameInput ? nameInput.value.trim() : '';
    const donor = donorInput ? donorInput.value.trim() : '';
    if (certName) {
      certName.textContent = name || namePlaceholder;
    }
    if (certDonor) {
      certDonor.textContent = donor || '-';
    }
    const certMsg = $('certMsg');
    if (certMsg && msgInput) {
      certMsg.textContent = msgInput.value.trim() || '';
    }
  };

  [nameInput, donorInput, msgInput].forEach((el) => {
    if (el) el.addEventListener('input', sync);
  });
  const attachBtn = $('attachDed');
  if (attachBtn) {
    attachBtn.addEventListener('click', sync);
  }
  sync();
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
  initCertificateTabs();
  initCertificateAmount();
  initCertificateAmountToggle();
  initModalControls();
  initDedicationPreview();
});
