const TRADES=[['N',{P:5}],['D',{N:2}],['D',{P:10}],['D',{N:1,P:5}],['Q',{D:2,N:1}],['Q',{D:1,N:3}],['Q',{N:5}],['Q',{D:2,P:5}],['Q',{P:25}],['H',{Q:2}],['H',{D:5}],['H',{Q:1,D:2,N:1}],['H',{N:10}],['S',{H:2}],['S',{Q:4}],['S',{D:10}]];
const bag=b=>Object.entries(b).map(([k,n])=>`${n}${icon(k,18)}`).join('+');
function tradeBtns(filter){
 const c=S.combo;let out='';
 TRADES.forEach(([f,to],i)=>{
  const ok=S.enabled[f]&&Object.keys(to).every(k=>S.enabled[k]);if(!ok)return;
  const d=Object.values(to).reduce((a,b)=>a+b,0)-1;
  if(filter!=='merge'&&c[f]>0)out+=`<button class="mv" data-act="trade" data-arg="${i},s">${icon(f,18)} → ${bag(to)} <small>(coins +${d})</small></button>`;
  if(filter!=='split'&&Object.entries(to).every(([k,n])=>c[k]>=n))out+=`<button class="mv" data-act="trade" data-arg="${i},m">${bag(to)} → ${icon(f,18)} <small>(coins −${d})</small></button>`;
 });
 return out||'<span class="muted">No trades available — add some coins.</span>';
}
function pTrade(){
 const dn=S.count-cnt(S.combo);
 return `<h3>Trade game</h3><p class="muted">Trades never change the value. Splitting adds coins, merging removes coins. ${dn?`You need <b>${dn>0?'+'+dn:dn}</b> coins.`:'Coin count is right.'} Value gap: <b>${fmt(S.amount-val(S.combo))}</b></p>
 <b>Split (more coins)</b><div>${tradeBtns('split')}</div><b>Merge (fewer coins)</b><div>${tradeBtns('merge')}</div>`;
}
function applyTrade(i,dir){
 const [f,to]=TRADES[i],c={...S.combo};
 if(dir==='s'){c[f]--;for(const k in to)c[k]+=to[k]}else{for(const k in to)c[k]-=to[k];c[f]++}
 setCombo(c,'trade '+(dir==='s'?`${BK[f].l}→${Object.entries(to).map(([k,n])=>n+BK[k].l).join('+')}`:'merge→'+BK[f].l));
}
function pTwo(){
 const ks=en(),k0=ks[0],v0=BK[k0].v,mm=minMax(S.amount),c=S.combo;
 return `<h3>Two-step</h3>
 <b>A. Fix the count first</b>
 <p class="muted">Start with ${S.count} ${BK[k0].pl} (right count, too little value), then upgrade coins. Need <b>${fmt(S.amount-S.count*v0)}</b> in upgrades from steps of ${ks.slice(1).map(k=>`${icon(k,16)}+${BK[k].v-v0}¢`).join(', ')}.</p>
 <button class="btn" data-act="fillbase">Fill with ${S.count} ${BK[k0].pl}</button>
 <div>${ks.slice(1).map(k=>`<button class="mv" data-act="swap" data-arg="${k}" ${c[k0]>0?'':'disabled'}>${icon(k0,18)}→${icon(k,18)} <small>+${BK[k].v-v0}¢</small></button><button class="mv" data-act="unswap" data-arg="${k}" ${c[k]>0?'':'disabled'}>${icon(k,18)}→${icon(k0,18)} <small>−${BK[k].v-v0}¢</small></button>`).join('<br>')}</div>
 <p class="muted">Value gap now: <b>${fmt(S.amount-val(c))}</b></p>
 <hr><b>B. Fix the value first</b>
 <p class="muted">Start with the fewest coins for ${fmt(S.amount)}${mm.combo?` (${mm.min} coins)`:''}, then split coins until you have ${S.count}.</p>
 <button class="btn" data-act="greedy" ${mm.combo?'':'disabled'}>Fewest coins</button>
 <div>${tradeBtns('split')}</div><p class="muted">Coins needed: <b>${S.count-cnt(c)}</b></p>`;
}
function pPeel(){
 const ks=en().reverse(),memo=new Map();let a=S.amount,n=S.count,h=`<h3>Peel-off</h3><p class="muted">Choose how many of the biggest coin, then the next… each choice leaves a smaller problem. Numbers show how many ways remain.</p>`;
 const chosen=[];
 for(let i=0;i<ks.length;i++){
  const k=ks[i],v=BK[k].v;
  h+=`<div class="card"><b>${icon(k,20)} ${BK[k].pl}</b> <span class="muted">· ${fmt(a)} left, ${n} coins left</span><div>`;
  if(i===ks.length-1){
   const ok=a===n*v;h+=`<span class="${ok?'pos':'neg'}">${ok?`Last coins: exactly ${n} ✓`:`Dead end: ${n} ${BK[k].pl} = ${fmt(n*v)}, not ${fmt(a)}`}</span>`;
   if(ok)chosen[i]=n;break;
  }
  for(let c=0;c<=Math.min(n,Math.floor(a/v));c++){
   const w=cw(i+1,a-c*v,n-c,ks,memo),sel=S.peel[i]===c;
   h+=`<button class="mv ${w?'':'dead'} ${sel?'sel':''}" data-act="peel" data-arg="${i},${c}">${c} <small>${w?w+(w===1?' way':' ways'):'×'}</small></button>`;
  }
  h+='</div></div>';
  if(S.peel[i]==null){break}
  chosen[i]=S.peel[i];a-=S.peel[i]*v;n-=S.peel[i];
 }
 h+=`<button class="btn" data-act="peelapply">Place on table</button> <button class="btn alt" data-act="peelclear">Start over</button>`;
 S._peelChosen=chosen;S._peelKs=ks;
 return h;
}
function pBounds(){
 const ks=en(),vs=ks.map(k=>BK[k].v),mm=minMax(S.amount),N=S.count,A=S.amount;
 const g=vs.reduce(gcd,0),avg=A/N,lo=Math.min(...vs),hi=Math.max(...vs);
 const okList=[];for(let n=1;n<=NM;n++)if(ways(n,A)>0)okList.push(n);
 const w=ways(N,A);
 let verdict;
 if(A%g)verdict=`Impossible: every coin value is a multiple of ${g}¢, but ${A} is not.`;
 else if(!isFinite(mm.min))verdict='Impossible with these coins.';
 else if(N<mm.min)verdict=`Too few coins: even the biggest coins need at least ${mm.min}.`;
 else if(N>mm.max)verdict=`Too many coins: even the smallest coins use at most ${mm.max}.`;
 else if(avg<lo||avg>hi)verdict=`Impossible: the average coin would be worth ${avg.toFixed(2)}¢, outside ${lo}¢–${hi}¢.`;
 else verdict=w?`Possible! ${w} way${w===1?'':'s'}.`:'In range, but there is a gap — no combination hits exactly this count.';
 const mx=isFinite(mm.max)?mm.max:N,top=Math.max(mx,N)+1,W=520,X=n=>20+n/top*(W-40);
 let svg=`<svg viewBox="0 0 ${W} 70" width="100%"><line x1="20" y1="35" x2="${W-20}" y2="35" stroke="#999"/>`;
 if(isFinite(mm.min))svg+=`<rect x="${X(mm.min)}" y="28" width="${X(mm.max)-X(mm.min)}" height="14" fill="#cfe3ff"/>`;
 okList.filter(n=>n<=top).forEach(n=>svg+=`<circle cx="${X(n)}" cy="35" r="3" fill="#2e9d46"/>`);
 svg+=`<path d="M${X(N)} 30 l-6 -12 h12z" fill="#e03"/><text x="${X(N)}" y="62" text-anchor="middle" font-size="12">${N}</text>`;
 if(isFinite(mm.min))svg+=`<text x="${X(mm.min)}" y="62" text-anchor="middle" font-size="11">min ${mm.min}</text><text x="${X(mm.max)}" y="14" text-anchor="middle" font-size="11">max ${mm.max}</text>`;
 svg+='</svg>';
 return `<h3>Bounds</h3><div class="row"><b class="${w?'pos':'neg'}">${verdict}</b></div>${svg}
 <div class="muted">Blue = counts between fewest and most coins for ${fmt(A)}. Green dots = counts that really work. Red ▼ = your target.</div>
 <ul><li>Fewest coins: ${isFinite(mm.min)?mm.min:'—'} · Most coins: ${isFinite(mm.max)?mm.max:'—'}</li>
 <li>Average coin: ${fmt(A)} ÷ ${N} = ${avg.toFixed(2)}¢ (must be between ${lo}¢ and ${hi}¢)</li>
 <li>All coin values are multiples of ${g}¢</li></ul>`;
}
function pairSolve(a,b){
 const va=BK[a].v,vb=BK[b].v,y=(S.amount-S.count*va)/(vb-va),x=S.count-y;
 return{x,y,ok:Number.isInteger(y)&&y>=0&&x>=0};
}
function pPairs(){
 const ks=en();let rows='';
 for(let i=0;i<ks.length;i++)for(let j=i+1;j<ks.length;j++){
  const a=ks[i],b=ks[j],r=pairSolve(a,b);
  rows+=`<tr class="${r.ok?'click':''}"${r.ok?` data-act="pairload" data-arg="${a},${b}"`:''}><td>${icon(a,18)} + ${icon(b,18)}</td><td>${r.ok?`<b class="pos">${r.x} ${BK[a].pl}, ${r.y} ${BK[b].pl}</b>`:`<span class="neg">${Number.isInteger(r.y)?'negative amount':'not a whole number ('+(+r.y.toFixed(2))+' '+BK[b].pl+')'}</span>`}</td><td>${r.ok?`<button class="mv" data-act="paironly" data-arg="${a},${b}">Use only these</button>`:''}</td></tr>`;
 }
 return `<h3>Two types at a time</h3><p class="muted">With only two coin types, two equations have just one answer: b = (A − N·a) ÷ (b − a).</p>
 <table>${rows||'<tr><td class="muted">Enable at least two coin types.</td></tr>'}</table>`;
}
function pBalance(){
 const ks=en(),A=S.amount,N=S.count,avg=A/N,c=S.combo,n=cnt(c);
 const d=k=>BK[k].v-avg,pull=k=>d(k)*c[k];
 const under=-ks.reduce((s,k)=>s+Math.min(0,pull(k)),0),over=ks.reduce((s,k)=>s+Math.max(0,pull(k)),0),mx=Math.max(1,under,over);
 const bal=Math.abs(under-over)<1e-9&&n>0;
 const bar=(v,col,right)=>`<div style="height:22px;background:#eee;border-radius:6px;display:flex;justify-content:${right?'flex-start':'flex-end'}"><div style="width:${v/mx*100}%;background:${col};border-radius:6px"></div></div>`;
 let ratios='';
 const lows=ks.filter(k=>BK[k].v<avg),highs=ks.filter(k=>BK[k].v>avg);
 lows.forEach(lo=>highs.forEach(hi=>{
  const u=(A-BK[lo].v*N),o=(BK[hi].v*N-A),g=gcd(u,o),a=o/g,b=u/g;
  ratios+=`<li>${icon(hi,16)} is ${(o/N).toFixed(1)}¢ above, ${icon(lo,16)} is ${(u/N).toFixed(1)}¢ below. So <b>${a}</b> ${icon(lo,16)} × ${(u/N).toFixed(1)}¢ = <b>${b}</b> ${icon(hi,16)} × ${(o/N).toFixed(1)}¢ → ${a} ${BK[lo].pl} balance ${b} ${BK[hi].name.toLowerCase()}${b>1?'s':''}.</li>`}));
 return `<h3>Balance</h3>
 <p class="muted">${N} coins worth ${fmt(A)} means the <b>average coin is ${(avg).toFixed(2)}¢</b>. Coins worth less pull the average down; coins worth more pull it up. A solution is when the pulls cancel out.</p>
 <table><tr><th>Coin</th><th>vs. average</th><th>You have</th><th>Pull</th></tr>
 ${ks.map(k=>`<tr><td>${icon(k,18)} ${BK[k].t}</td><td class="${d(k)<0?'neg':'pos'}">${d(k)>0?'+':''}${d(k).toFixed(2)}¢ each</td><td>${c[k]}</td><td class="${d(k)<0?'neg':'pos'}">${c[k]?(pull(k)>0?'+':'')+pull(k).toFixed(1):'–'}</td></tr>`).join('')}</table>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px"><div class="muted" style="text-align:right">Pull down: ${under.toFixed(1)}</div><div class="muted">Pull up: ${over.toFixed(1)}</div>${bar(under,'#e59a77',false)}${bar(over,'#58b862',true)}</div>
 <p>${bal?`<b class="pos">⚖️ Balanced! Your coins average exactly ${avg.toFixed(2)}¢.</b>${n!==N?` (But you need ${N} coins, you have ${n}.)`:''}`:`Not balanced yet — add ${under>over?'higher-value':'lower-value'} coins.`}</p>
 <b>Why the odd ratios?</b><p class="muted">A coin far from the average has a bigger pull, so fewer of them balance many small ones. Each line compares one coin below average with one above:</p>
 <ul>${ratios||'<li class="muted">Needs coins both below and above the average.</li>'}</ul>`;
}
function pFamily(){
 const c=S.combo;
 if(!solved(c))return `<h3>Families</h3><p class="muted">Load a solution first, then see which small moves lead to other solutions.</p><button class="btn" data-act="one">Show me one</button>`;
 const ks=en(),cur=ckey(c);
 const mv=sols().filter(s=>ckey(s)!==cur).map(s=>{const d=zero();KEYS.forEach(k=>d[k]=s[k]-c[k]);return d}).sort((a,b)=>KEYS.reduce((s,k)=>s+Math.abs(a[k]),0)-KEYS.reduce((s,k)=>s+Math.abs(b[k]),0)).slice(0,10);
 S._moves=mv;
 return `<h3>Families</h3><p class="muted">Other solutions near this one. A move keeps both coin count and value fixed.</p>`+(mv.length?mv.map((d,i)=>{
  let rep=0;for(let r=1;r<20;r++){const t={...c};KEYS.forEach(k=>t[k]+=d[k]*r);if(KEYS.every(k=>t[k]>=0)&&solved(t))rep=r;else break}
  return `<button class="mv" data-act="move" data-arg="${i}">${KEYS.filter(k=>d[k]).map(k=>`<span class="${d[k]>0?'pos':'neg'}">${d[k]>0?'+':''}${d[k]}</span>${icon(k,16)}`).join(' ')}${rep>1?` <small>can repeat ×${rep}</small>`:''}</button>`}).join(''):'<p>This is the only solution!</p>');
}
function pSols(){
 if(hidden())return '<h3>Solutions</h3>'+hiddenMsg;
 const list=sols(),total=ways(S.count,S.amount),f=S.found.size,ks=en();
 const show=S.reveal?list:list.filter(s=>S.found.has(ckey(s)));
 return `<h3>Solutions: found ${f} of ${total}</h3><div class="prog"><i style="width:${total?f/total*100:0}%"></i></div>
 <div class="row"><button class="btn" data-act="one">Show me one</button><button class="btn alt" data-act="reveal">${S.reveal?'Hide unfound':'Reveal all'}</button></div>
 ${total===0?'<p class="neg">No combination works for this problem.</p>':''}
 <table><tr>${ks.map(k=>`<th>${icon(k,18)}</th>`).join('')}<th></th></tr>
 ${show.map(s=>`<tr class="click ${ckey(s)===ckey(S.combo)?'cur':''}" data-act="load" data-arg="${ckey(s)}">${ks.map(k=>`<td>${s[k]}</td>`).join('')}<td>${S.found.has(ckey(s))?'✅':''}</td></tr>`).join('')}</table>
 ${!S.reveal&&!show.length?'<p class="muted">Build combos on the table — every new solution you find is collected here.</p>':''}`;
}
function pHist(){
 return `<h3>History</h3>`+[...S.hist].reverse().map((h,i,a)=>`<div class="mv" style="display:flex" data-act="restore" data-arg="${S.hist.length-1-i}">${h.label} <small>${cnt(h.combo)} coins · ${fmt(val(h.combo))}</small></div>`).join('');
}

