// Donation page logic
const state={freq:'monthly',amountPresets:[50,100,180,360,1000,'סכום אחר'],amount:180,custom:0,selections:[]};
const $=id=>document.getElementById(id);
const fmt=n=>'₪'+(Number(n)||0).toLocaleString('he-IL');

// Build amount presets
(function buildPresets(){
  const wrap=$('amountPresets'); if(!wrap) return;
  state.amountPresets.forEach(a=>{
    const b=document.createElement('button');
    b.className='pill'+(a===state.amount?' sel':'');
    b.textContent=typeof a==='number'?'₪'+a.toLocaleString('he-IL'):a;
    b.onclick=()=>{
      state.amount=a;
      [...wrap.querySelectorAll('.pill')].forEach(p=>p.classList.remove('sel'));
      b.classList.add('sel');
      const cw=document.getElementById('customWrap');
      if(cw) cw.classList.toggle('hidden', a!=='סכום אחר');
      recalc();
    };
    wrap.appendChild(b);
  });
})();

// Freq toggle
document.querySelectorAll('#freqToggle button').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('#freqToggle button').forEach(b=>b.classList.remove('bg-indigo-700','text-white'));
    btn.classList.add('bg-indigo-700','text-white');
    state.freq=btn.dataset.freq;
  };
});

// Custom amount
const custom=document.getElementById('customAmount');
if(custom){ custom.oninput=e=>{ state.custom=e.target.value; recalc(); }; }

// Add support items
document.querySelectorAll('[data-add]').forEach(btn=>{
  btn.onclick=()=>{
    state.selections.push({title:btn.getAttribute('title'),price:Number(btn.getAttribute('data-price'))});
    renderSelections(); recalc();
  };
});

function renderSelections(){
  const list=$('list'), empty=$('emptyList'); if(!list||!empty) return;
  list.innerHTML='';
  empty.classList.toggle('hidden', !!state.selections.length);
  state.selections.forEach((it,i)=>{
    const li=document.createElement('li');
    li.className='flex items-center justify-between';
    li.innerHTML=`<span>${it.title}</span>
      <span>${fmt(it.price)} 
        <button data-rm="${i}" class="bg-white border rounded-xl px-2 py-1 text-xs">הסרה</button>
      </span>`;
    list.appendChild(li);
  });
  list.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{
    const i=Number(b.getAttribute('data-rm')); state.selections.splice(i,1); renderSelections(); recalc();
  });
}

function recalc(){
  const base=(state.amount==='סכום אחר'?Number(state.custom||0):Number(state.amount||0));
  const extras=state.selections.reduce((s,it)=>s+Number(it.price||0),0);
  const total=base+extras;
  // impact (heuristics)
  const meals=Math.floor(total/25)*10;
  const weeks=Math.floor(total/360);
  const vet=Math.floor(total/250);

  const sumEl=$('sumTotal'); if(sumEl) sumEl.textContent=fmt(total);
  const ibMeals=$('ibMeals'), ibTraining=$('ibTraining'), ibVet=$('ibVet');
  if(ibMeals) ibMeals.textContent=(meals>0?meals.toLocaleString('he-IL'):'0')+'+';
  if(ibTraining) ibTraining.textContent=weeks;
  if(ibVet) ibVet.textContent=vet;
}
recalc();

// CTAs
const topBtn=$('donateNowTop'), bottomBtn=$('donateNowBottom'), moreWays=$('moreWays');
if(topBtn&&bottomBtn){ topBtn.onclick=()=>bottomBtn.scrollIntoView({behavior:'smooth',block:'center'}); }
if(bottomBtn){ bottomBtn.onclick=()=>alert('דמו: כאן ישתלב טופס סליקה מאובטח.'); }
if(moreWays){ moreWays.onclick=()=>alert('דמו: העברה בנקאית, ביט/פייבוקס, צ׳ק.'); }

// Dedication preview
function setDate(){
  const d=new Date(),dd=String(d.getDate()).padStart(2,'0'),mm=String(d.getMonth()+1).padStart(2,'0'),yy=d.getFullYear();
  const el=$('certDate'); if(el) el.textContent=`${dd}.${mm}.${yy}`;
}
setDate();
const dn=$('dedName'), ddn=$('dedDonor'), dt=$('dedType');
function upd(){
  const name=dn?dn.value.trim():'', donor=ddn?ddn.value.trim():'', type=dt?dt.value:'לזכר/לע"נ';
  const cn=$('certName'), cd=$('certDonor');
  if(cn) cn.textContent='ל'+type+': '+(name||'—');
  if(cd) cd.textContent=donor||'—';
}
if(dn) dn.oninput=upd; if(ddn) ddn.oninput=upd; if(dt) dt.onchange=upd;
const att=document.getElementById('attachDed'); if(att) att.onclick=()=>alert('ההקדשה תצורף לתרומה (דמו).');

// Callback modal
const callModal=$('callModal'), callBtn=$('callMeBtn'), closeBtn=$('callClose'), cbName=$('cbName'), cbPhone=$('cbPhone'), cbPolicy=$('cbPolicy'), cbSubmit=$('cbSubmit');
function openM(){ if(callModal) callModal.classList.remove('hidden'); }
function closeM(){ if(callModal) callModal.classList.add('hidden'); }
if(callBtn) callBtn.onclick=openM; if(closeBtn) closeBtn.onclick=closeM;
if(callModal){ callModal.addEventListener('click',e=>{ if(e.target===callModal) closeM(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeM(); });
}
function validPhone(p){ return /^0\d{8,10}$/.test(String(p).replace(/\D/g,'')); }
if(cbSubmit){ cbSubmit.onclick=()=>{
  const name=(cbName&&cbName.value.trim())||'', phone=(cbPhone&&cbPhone.value.trim())||'';
  if(!name){ alert('נא למלא שם מלא'); cbName&&cbName.focus(); return; }
  if(!validPhone(phone)){ alert('נא למלא מספר טלפון תקין'); cbPhone&&cbPhone.focus(); return; }
  if(!cbPolicy||!cbPolicy.checked){ alert('נא לאשר את מדיניות הפרטיות'); return; }
  alert('תודה! נחזור אליך להשלמת התרומה.'); closeM();
  if(cbName) cbName.value=''; if(cbPhone) cbPhone.value=''; if(cbPolicy) cbPolicy.checked=false;
};}
