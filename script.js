// Self-contained v10 JS (RTL safe)
// State
const state = {
  amount: 180,
  custom: 0,
  selections: [] // {title, price}
};

// Helpers
const $ = (id) => document.getElementById(id);
const fmt = (n) => '₪' + Number(n||0).toLocaleString('he-IL');

function selectPill(btn){
  document.querySelectorAll('#amountPresets .pill').forEach(b=>b.classList.remove('sel'));
  if (btn) btn.classList.add('sel');
}

// Pick amount
function _pickAmount(val, btn){
  selectPill(btn);
  state.amount = val;
  const customWrap = $('customWrap');
  if (val === 'סכום אחר'){
    if (customWrap) customWrap.classList.remove('hidden');
    setTimeout(()=> $('customAmount')?.focus(), 0);
  } else {
    if (customWrap) customWrap.classList.add('hidden');
  }
  recalc();
}

// Impact + summary recalculation
function recalc(){
  const base = (state.amount === 'סכום אחר') ? Number(state.custom||0) : Number(state.amount||0);
  const extras = state.selections.reduce((s,i)=> s + Number(i.price||0), 0);

  // Impact from base only
  const meals = Math.floor(base/20);
  const hours = Math.floor(base/300);
  const vet   = Math.floor(base/500);

  const ibMeals = $('ibMeals'), ibTraining = $('ibTraining'), ibVet = $('ibVet');
  if (ibMeals)    ibMeals.textContent    = (meals>0? meals.toLocaleString('he-IL') : '0') + '+';
  if (ibTraining) ibTraining.textContent = hours;
  if (ibVet)      ibVet.textContent      = vet;

  // Bottom total = extras only
  const sumEl = $('sumTotal');
  if (sumEl) sumEl.textContent = fmt(extras);
}

// Add item to bottom list
function _addItem(title, price){
  state.selections.push({title, price});
  const list = $('list');
  const empty = $('emptyList');
  if (list && empty){
    empty.style.display = 'none';
    const li = document.createElement('li');
    const t = document.createElement('div');
    const p = document.createElement('div');
    t.textContent = title;
    p.textContent = fmt(price);
    li.appendChild(t); li.appendChild(p);
    list.appendChild(li);
  }
  recalc();
}

// Custom input handler
document.addEventListener('input', function(e){
  if (e.target && e.target.id === 'customAmount'){
    const n = Number(e.target.value||0);
    state.custom = isNaN(n) ? 0 : n;
    recalc();
  }
});

// Init slider (circular)
function initSlider(){
  const track = $('cardsTrack');
  const prev = $('slidePrev'), next = $('slideNext');
  if (!track || !prev || !next) return;

  function cardWidth(){
    const c = track.querySelector('.card');
    if (!c) return 320 + 20;
    const styles = getComputedStyle(track);
    const gap = parseInt(styles.columnGap || styles.gap || '20', 10) || 20;
    return Math.round(c.getBoundingClientRect().width + gap);
  }

  function slide(dir){
    const w = cardWidth();
    if (dir === 'next'){
      track.scrollBy({left: w, behavior: 'smooth'});
      setTimeout(()=>{
        if (track.firstElementChild) track.appendChild(track.firstElementChild);
        track.scrollLeft -= w;
      }, 260);
    } else {
      if (track.lastElementChild) {
        track.insertBefore(track.lastElementChild, track.firstElementChild);
        track.scrollLeft += w;
      }
      track.scrollBy({left: -w, behavior: 'smooth'});
    }
  }

  prev.addEventListener('click', ()=> slide('prev'));
  next.addEventListener('click', ()=> slide('next'));
  // Keyboard support
  $('donation-slider').addEventListener('keydown', (e)=>{
    if (e.key === 'ArrowLeft') slide('prev');
    if (e.key === 'ArrowRight') slide('next');
  });
}

// Boot
document.addEventListener('DOMContentLoaded', ()=>{
  // Default selected is ₪180
  recalc();
  initSlider();
  // Wire donate buttons (no-op demo)
  const topBtn = $('donateNowTop'), botBtn = $('donateNowBottom');
  [topBtn, botBtn].forEach(b=> b && b.addEventListener('click', ()=>{
    alert('תודה! זהו ממשק הדגמה. כאן נחבר לתשלום מאובטח.');
  }));
});

// Expose (optional)
window._pickAmount = _pickAmount;
window._addItem = _addItem;
