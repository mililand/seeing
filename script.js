/* script.js — Seeing Eyes donation page
   - Renders amount presets 
   - Updates impact counters
   - Handles "call me" modal with validation
*/
// ---- slider controls
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
