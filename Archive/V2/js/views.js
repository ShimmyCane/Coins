/* ---------- header ---------- */
function renderBar(){
 $('#bar').innerHTML=`<span>${COINS.map(c=>`<button class="chip ${S.enabled[c.k]?'on':''}" data-act="toggle" data-arg="${c.k}">${icon(c.k,22)}${c.name}</button>`).join(' ')}</span>
 <button class="btn alt" data-act="fewer">◀ Fewer types</button><button class="btn alt" data-act="more">More types ▶</button>
 <label><input type="checkbox" data-in="predict" ${S.predictOn?'checked':''}> Predict first</label>`;
 $('#bar').classList.toggle('show',S.settings);$('#gear').classList.toggle('on',S.settings);
 $('#actions').innerHTML=`<label>Amount <input type="number" min="1" max="${AM}" value="${S.amount}" data-in="amount">¢ <span class="muted">${fmt(S.amount)}</span></label>
 <label>Coins <input type="number" min="1" max="${NM}" value="${S.count}" data-in="count"></label>
 <button class="btn" data-act="surprise">🎲 Surprise me</button>
 <button class="btn alt" data-act="one">Show me one</button>
 <button class="btn alt" data-act="undo">↶ Undo</button>`;
 const c=S.combo,n=cnt(c),v=val(c),dn=S.count-n,dv=S.amount-v;
 const w=solved(c);
 $('#status').innerHTML=`<span class="pill ${n===S.count?'ok':'bad'}">Coins ${n} / ${S.count}${dn>0?` · ${dn} more`:dn<0?` · ${-dn} too many`:' ✓'}</span>
  <span class="pill ${v===S.amount?'ok':'bad'}">Value ${fmt(v)} / ${fmt(S.amount)}${dv>0?` · ${fmt(dv)} to go`:dv<0?` · ${fmt(-dv)} too much`:' ✓'}</span>
  ${w?'<span class="pill win">🎉 Solved!</span>':''}`;
 const p=S.pred;
 $('#predict').innerHTML=!p?'':p.pending?`<div class="card"><b>Predict:</b> how many different ways can ${S.count} coins make ${fmt(S.amount)}? ${[['0','Impossible'],['1','Exactly 1'],['2','2–5'],['6','6–20'],['21','21 or more']].map(([a,b])=>`<button class="mv" data-act="guess" data-arg="${a}">${b}</button>`).join('')}</div>`:
  `<div class="card">${p.msg} <span class="muted">Streak: ${S.streak}</span></div>`;
}
function guess(g){
 const w=ways(S.count,S.amount);g=+g;
 const cls=w===0?0:w===1?1:w<=5?2:w<=20?6:21;
 const ok=cls===g;S.streak=ok?S.streak+1:0;
 S.pred={pending:false,msg:`${ok?'✅ Right!':'❌ Not quite.'} There ${w===1?'is 1 way':'are '+w+' ways'}.`};
 renderAll();
}

function pTable(){
 const c=S.combo;
 return `<h3>Table</h3><table><tr><th>Coin</th><th>Value</th><th>How many</th><th>Coins</th><th>Worth</th></tr>
 ${en().map(k=>`<tr><td>${icon(k,22)} ${BK[k].name}</td><td>${BK[k].t}</td>
 <td><span class="step"><button data-act="dec" data-arg="${k}">−</button><input type="number" min="0" value="${c[k]}" data-in="tbl" data-k="${k}"><button data-act="inc" data-arg="${k}">+</button></span></td>
 <td>${c[k]}</td><td>${fmt(c[k]*BK[k].v)}</td></tr>`).join('')}
 <tr><th colspan="3">Total</th><th>${cnt(c)} / ${S.count}</th><th>${fmt(val(c))} / ${fmt(S.amount)}</th></tr></table>`;
}
function pEq(){
 const c=S.combo,ks=en(),n=cnt(c),v=val(c);
 const sym=ks.map(k=>`${BK[k].v}×<input type="number" min="0" value="${c[k]}" data-in="eq" data-k="${k}" title="${BK[k].pl}"> <small>${BK[k].l}</small>`).join(' + ');
 const sym2=ks.map(k=>`<input type="number" min="0" value="${c[k]}" data-in="eq" data-k="${k}"> <small>${BK[k].l}</small>`).join(' + ');
 const sub1=ks.map(k=>`${BK[k].v}(${c[k]})`).join(' + ');
 const sub2=ks.map(k=>c[k]).join(' + ');
 const b=ks[0],v0=BK[b].v,rest=ks.slice(1),rhs=S.amount-v0*S.count,cur=rest.reduce((s,k)=>s+(BK[k].v-v0)*c[k],0);
 return `<h3>Equations</h3>
 <div class="muted">Value (cents)</div><div class="eq">${sym} = <b>${S.amount}</b></div>
 <div class="muted">${sub1} = <b class="${v===S.amount?'pos':'neg'}">${v}</b> ${v===S.amount?'✓':'≠ '+S.amount}</div>
 <div class="muted" style="margin-top:10px">Count</div><div class="eq">${sym2} = <b>${S.count}</b></div>
 <div class="muted">${sub2} = <b class="${n===S.count?'pos':'neg'}">${n}</b> ${n===S.count?'✓':'≠ '+S.count}</div>
 <div class="muted" style="margin-top:10px">Subtract ${v0} × (count equation) from the value equation:</div>
 <div class="eq">${rest.length?rest.map(k=>`${BK[k].v-v0}${BK[k].l}`).join(' + ')+' = '+S.amount+' − '+v0+'×'+S.count+' = <b>'+rhs+'</b>':'(only one coin type)'}</div>
 <div class="muted">${rest.length?`Right now: ${cur} ${cur===rhs?'✓ matches':'vs '+rhs}`:''}</div>
 ${rhs<0?'<p class="neg">The right side is negative — too many coins for this amount: impossible.</p>':''}`;
}
const WC={P:'#c0692f',N:'#6b7a8f',D:'#2b7de0',Q:'#7c3aed',H:'#0d9488',S:'#d4a017'};
const walkSteps=c=>en().flatMap(k=>Array(c[k]).fill(k));
function pWalk(){
 if(hidden())return '<h3>Coin Walk</h3>'+hiddenMsg;
 const ks=en(),c=S.combo,n=cnt(c),v=val(c),N=S.count,A=S.amount;
 if(!ks.length)return '<h3>Coin Walk</h3><p class="muted">Enable a coin type.</p>';
 const g=S.ghost&&ks.every(k=>S.ghost[k]!==undefined)&&cnt(S.ghost)===N&&val(S.ghost)===A?S.ghost:null;
 const minv=BK[ks[0]].v,maxv=BK[ks[ks.length-1]].v;
 const xmax=Math.max(N,n,1),ymax=Math.max(A,v,1)*1.08;
 const W=560,H=360,ml=56,mr=20,mt=16,mb=46,X=x=>ml+x/xmax*(W-ml-mr),Y=y=>H-mb-y/ymax*(H-mt-mb);
 const xu=Math.min(xmax,ymax/maxv),up=[[0,0],[xu,maxv*xu]];if(xu<xmax)up.push([xmax,ymax]);
 const xl=Math.min(xmax,ymax/minv),lo=xl<xmax?[[xmax,ymax],[xl,ymax]]:[[xmax,minv*xmax]];
 const lens=[...up,...lo].map(p=>X(p[0])+','+Y(p[1])).join(' ');
 const ts=m=>Math.max(1,Math.ceil(m/10));
 let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="background:#faf8f0;border-radius:10px">`;
 for(let x=0;x<=xmax;x+=ts(xmax))s+=`<line x1="${X(x)}" y1="${Y(0)}" x2="${X(x)}" y2="${mt}" stroke="#0001"/><text x="${X(x)}" y="${H-mb+15}" font-size="11" text-anchor="middle">${x}</text>`;
 const yt=Math.max(1,Math.ceil(ymax/8/5)*5);
 for(let y=0;y<=ymax;y+=yt)s+=`<line x1="${ml}" y1="${Y(y)}" x2="${W-mr}" y2="${Y(y)}" stroke="#0001"/><text x="${ml-6}" y="${Y(y)+4}" font-size="11" text-anchor="end">${y}¢</text>`;
 s+=`<polygon points="${lens}" fill="#9be3a8" fill-opacity=".35"/>`;
 s+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(xu)}" y2="${Y(maxv*xu)}" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(xl)}" y2="${Y(minv*xl)}" stroke="#c0692f" stroke-width="1.5" stroke-dasharray="4 3"/>`;
 s+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(N)}" y2="${Y(A)}" stroke="#e03" stroke-width="1.5" stroke-dasharray="2 4"/>`;
 s+=`<text x="${W/2}" y="${H-6}" text-anchor="middle" font-size="12">coins used (each step = 1 coin)</text><text x="12" y="${H/2}" font-size="12" transform="rotate(-90 12 ${H/2})" text-anchor="middle">cents so far</text>`;
 const path=(cc,col,w,op)=>{let x=0,y=0,o='';
  walkSteps(cc).forEach(k=>{const nx=x+1,ny=y+BK[k].v;
   o+=`<line x1="${X(x)}" y1="${Y(y)}" x2="${X(nx)}" y2="${Y(ny)}" stroke="${col||WC[k]}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round"><title>a ${BK[k].name.toLowerCase()}: +1 coin, +${BK[k].v}¢ (now ${nx} coins, ${ny}¢)</title></line>`;x=nx;y=ny});return o};
 if(g)s+=path(g,'#8892a6',3,.7);
 s+=path(c,null,4,1);
 s+=`<circle cx="${X(N)}" cy="${Y(A)}" r="9" fill="none" stroke="#e03" stroke-width="3"/><circle cx="${X(N)}" cy="${Y(A)}" r="3" fill="#e03"/><text x="${X(N)-12}" y="${Y(A)-12}" text-anchor="end" font-size="12" fill="#e03" font-weight="bold">target: ${N} coins = ${A}¢</text>`;
 s+=`<circle cx="${X(n)}" cy="${Y(v)}" r="5" fill="#222"/>`;
 s+='</svg>';
 const bar=(lab,cur,tot,fn)=>{const segs=ks.filter(k=>c[k]).map(k=>`<span style="display:inline-block;height:100%;width:${Math.min(100,fn(k)/tot*100)}%;background:${WC[k]}" title="${c[k]} ${BK[k].pl}: ${fn(k)}"></span>`).join('');
  return `<div style="margin:6px 0"><div style="display:flex;justify-content:space-between;font-size:13px"><b>${lab}</b><span class="${cur===tot?'pos':cur>tot?'neg':''}">${cur} / ${tot} ${cur===tot?'✓ full':cur>tot?'over!':''}</span></div><div style="height:20px;background:#e8e4d6;border-radius:10px;overflow:hidden;white-space:nowrap">${segs}</div></div>`};
 const legend=ks.map(k=>`<span style="margin-right:8px"><i style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${WC[k]};vertical-align:-1px"></i> ${BK[k].name} <small>(+${BK[k].v}¢)</small></span>`).join('');
 const avg=(A/N).toFixed(2).replace(/\.?0+$/,''),lo2=N*minv,hi2=N*maxv;
 const fit=A<lo2?`<span class="neg">Impossible: even ${N} ${BK[ks[0]].pl} (the lowest path) already make ${lo2}¢, which is more than ${A}¢.</span>`:A>hi2?`<span class="neg">Impossible: even ${N} ${BK[ks[ks.length-1]].pl} (the highest path) make only ${hi2}¢, short of ${A}¢.</span>`:`<span class="pos">Possible in principle: ${N} coins can make anything from ${lo2}¢ (all ${BK[ks[0]].pl}) to ${hi2}¢ (all ${BK[ks[ks.length-1]].pl}), and ${A}¢ is inside that range.</span>`;
 return `<h3>Coin Walk — the path to the target</h3>
 <div class="row"><button class="btn alt" data-act="ghost">Show another solution (grey)</button>${g?'<button class="btn alt" data-act="noghost">Hide grey</button>':''}</div>
 ${bar('Coin slots used',n,N,k=>c[k])}${bar('Cents filled',v,A,k=>c[k]*BK[k].v)}
 <div class="muted" style="margin-bottom:4px">${legend}</div>${s}
 <div class="card" style="background:#faf8f0;margin-top:8px"><ul class="muted" style="margin:0;padding-left:18px">
 <li>Every coin is <b>one step</b>: 1 to the right (uses a coin slot) and up by its value. Hover a step to read it. Your coins are laid out smallest first.</li>
 <li>A solution is a path that ends <b>exactly on the red target</b>: ${N} steps across and ${A}¢ up. Right now you are at <b>${n} coins, ${v}¢</b>${n===N&&v===A?' — on target! ✓':n>N?' — too many coins':v>A?' — too much money':' — keep going'}.</li>
 <li><span style="color:#c0692f"><b>Lowest dashed line</b></span> = all ${BK[ks[0]].pl}; <span style="color:#7c3aed"><b>highest dashed line</b></span> = all ${BK[ks[ks.length-1]].pl}. Every path lives in the <span style="background:#9be3a8;padding:0 4px">green zone</span> between them. ${fit}</li>
 <li>The red dotted line has slope <b>${avg}¢ per coin</b>: the <b>average coin</b>. Small coins pull the path under that line and big coins lift it back; a solution must cross back to land on the target.</li>
 <li>Two budgets, one answer: the bars above must both fill up at the same moment. A big coin barely uses a slot but fills the cents bar fast.</li></ul></div>`;
}
function pRose(){
 if(hidden())return '<h3>Rose</h3>'+hiddenMsg;
 const c=S.combo,list=sols(),mode=S.roseMode||'cents',tot=mode==='cents'?S.amount:S.count;
 const share=(s,k)=>tot?Math.min(1,(mode==='cents'?s[k]*BK[k].v:s[k])/tot):0;
 const W=560,H=520,cx=W/2,cy=H/2+4,R0=170,ang=i=>-Math.PI/2+i*Math.PI/3;
 const P=(i,t)=>[cx+Math.cos(ang(i))*R0*t,cy+Math.sin(ang(i))*R0*t];
 const poly=s=>KEYS.map((k,i)=>P(i,S.enabled[k]?share(s,k):0).map(v=>v.toFixed(1)).join(',')).join(' ');
 let g=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="background:#faf8f0;border-radius:10px">`;
 [.25,.5,.75,1].forEach(t=>{g+=`<polygon points="${KEYS.map((k,i)=>P(i,t).join(',')).join(' ')}" fill="none" stroke="#0002"/><text x="${cx+4}" y="${cy-R0*t+12}" font-size="10" fill="#888">${Math.round(t*100)}%</text>`});
 KEYS.forEach((k,i)=>{const[x,y]=P(i,1),[lx,ly]=P(i,1.2),on=S.enabled[k];
  g+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${on?'#667':'#0002'}" stroke-width="${on?2.5:1}"/>
  <g opacity="${on?1:.3}" transform="translate(${lx-19},${ly-19})">${icon(k,38).replace('class="ci"','class="ci" x="0"')}</g>
  <text x="${lx}" y="${ly+32}" text-anchor="middle" font-size="11" fill="#555">${BK[k].t}</text>`});
 const cur=ckey(c);
 list.slice(0,400).forEach(s=>{const key=ckey(s);if(key===cur)return;const f=S.found.has(key);
  g+=`<polygon points="${poly(s)}" fill="${f?'#2e9d46':'#2b7de0'}" fill-opacity="${f?.18:.06}" stroke="${f?'#2e9d46':'#2b7de0'}" stroke-opacity="${f?.9:.45}" stroke-width="${f?2.5:1.5}" data-act="load" data-arg="${key}" style="cursor:pointer"><title>${en().filter(k=>s[k]).map(k=>s[k]+' '+BK[k].pl).join(', ')}${f?' (found)':''}</title></polygon>`});
 const here=list.some(s=>ckey(s)===cur);
 g+=`<polygon points="${poly(c)}" fill="#e03" fill-opacity=".15" stroke="#e03" stroke-width="3.5" ${here?'':'stroke-dasharray="7 4"'} pointer-events="none"/>`;
 KEYS.forEach((k,i)=>{if(!c[k]||!S.enabled[k])return;const[x,y]=P(i,share(c,k));g+=`<circle cx="${x}" cy="${y}" r="5" fill="#e03" pointer-events="none"/><text x="${x+8}" y="${y-6}" font-size="12" font-weight="bold" fill="#e03" pointer-events="none">${c[k]}</text>`});
 g+='</svg>';
 const what=mode==='cents'?'share of the money':'share of the coins';
 return `<h3>Rose — every solution as a shape</h3>
 <div class="row"><button class="btn ${mode==='cents'?'':'alt'}" data-act="rosemode" data-arg="cents">By money (¢)</button><button class="btn ${mode==='coins'?'':'alt'}" data-act="rosemode" data-arg="coins">By coins</button></div>${g}
 <div class="card" style="background:#faf8f0;margin-top:8px"><b>${list.length} solution${list.length===1?'':'s'}, one shape each${list.length>400?' (first 400 drawn)':''}.</b>
 <ul class="muted" style="margin:4px 0 0;padding-left:18px">
 <li>Six spokes, one per coin. The farther a shape reaches along a spoke, the bigger that coin's <b>${what}</b> (${mode==='cents'?`its coins × value ÷ ${fmt(S.amount)}`:`its count ÷ ${S.count}`}).</li>
 <li>The six reaches always add up to <b>100%</b>: that is the rule ${mode==='cents'?`"the money must total ${fmt(S.amount)}"`:`"the coins must total ${S.count}"`}. Switch between money and coins to see how the same answer looks under each rule. A penny-heavy answer is spiky toward pennies by coins but small by money.</li>
 <li>Each shape is one complete answer. Hover to read it, click to load it. <span style="color:#2e9d46"><b>Green</b></span> = found, <span style="color:#2b7de0"><b>blue</b></span> = not yet, <span style="color:#e03"><b>red</b></span> = what you have now${here?'':' (dashed: not a solution yet)'}. Numbers at red corners are your coin counts.</li></ul></div>`;
}
function pMap(){
 if(hidden())return '<h3>Map</h3>'+hiddenMsg;
 const w=mapWin(),z=S.mapZ||0;
 const chart=(label,lo,hi,f,mark,act)=>{const n=hi-lo+1;let b=`<svg viewBox="0 0 ${n} 40" width="100%" height="60" preserveAspectRatio="none" style="background:#f3f0e4;border-radius:6px">`;
  let mx=1;for(let i=lo;i<=hi;i++)mx=Math.max(mx,f(i));
  for(let i=lo;i<=hi;i++){const h=f(i)>0?Math.max(2,Math.sqrt(f(i)/mx)*38):0;
   b+=`<rect x="${i-lo}" y="${40-h}" width="1" height="${h}" fill="${i===mark?'#e03':'#2b3a67'}" data-act="${act}" data-arg="${i}" style="cursor:pointer"/>`}
  return `<div class="muted">${label}</div>`+b+'</svg>'};
 return `<h3>Problem Map</h3>
 <div class="row"><button class="btn alt" data-act="mapzoom" data-arg="-1" ${z<=0?'disabled':''}>＋ Zoom in</button><button class="btn alt" data-act="mapzoom" data-arg="1" ${z>=3?'disabled':''}>－ Zoom out</button><span class="muted">${w.a1-w.a0+1} amounts × ${w.n1-w.n0+1} coin counts, centred on your problem</span></div>
 <canvas id="map" width="600" height="400"></canvas>
 <div class="muted">→ amount ${w.a0}–${w.a1}¢ · ↑ coins ${w.n0}–${w.n1} · brighter = more solutions · dark = none · white box = your problem · click to load a problem</div>
 ${chart(`Holding ${S.count} coins, sweep the amount (${w.a0}–${w.a1}¢): ways`,w.a0,w.a1,a=>ways(S.count,a),S.amount,'setA')}
 ${chart(`Holding ${fmt(S.amount)}, sweep the coin count (${w.n0}–${w.n1}): ways`,w.n0,w.n1,n=>ways(n,S.amount),S.count,'setN')}`;
}
const MAPZ=[[20,10],[50,20],[100,35],[null,null]];
function mapWin(){
 const AMAX=Math.max(300,S.amount+20),NMAX=Math.max(100,S.count+10),[ha,hn]=MAPZ[S.mapZ||0];
 if(ha===null)return{a0:1,a1:AMAX,n0:1,n1:NMAX};
 const fit=(c,h,mx)=>{let lo=c-h,hi=c+h;if(lo<1){hi+=1-lo;lo=1}if(hi>mx){lo=Math.max(1,lo-(hi-mx));hi=mx}return[lo,hi]};
 const[a0,a1]=fit(S.amount,ha,AMAX),[n0,n1]=fit(S.count,hn,NMAX);return{a0,a1,n0,n1};
}
function drawMap(){
 const cv=$('#map'),x=cv.getContext('2d'),w=mapWin(),cols=w.a1-w.a0+1,rows=w.n1-w.n0+1,cw=600/cols,ch=400/rows;let mx=1;
 for(let n=w.n0;n<=w.n1;n++)for(let a=w.a0;a<=w.a1;a++)mx=Math.max(mx,ways(n,a));
 x.fillStyle='#222';x.fillRect(0,0,600,400);
 for(let n=w.n0;n<=w.n1;n++)for(let a=w.a0;a<=w.a1;a++){const v=ways(n,a);if(!v)continue;
  const t=Math.log(v+1)/Math.log(mx+1);x.fillStyle=`hsl(${220-t*170},80%,${35+t*25}%)`;{const X0=Math.floor((a-w.a0)*cw),Y0=Math.floor((w.n1-n)*ch);x.fillRect(X0,Y0,Math.floor((a-w.a0+1)*cw)-X0+1,Math.floor((w.n1-n+1)*ch)-Y0+1)}}
 x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect((S.amount-w.a0)*cw-1,(w.n1-S.count)*ch-1,Math.max(cw,6)+2,Math.max(ch,6)+2);
 const tip=$('#tip'),pos=e=>{const r=cv.getBoundingClientRect();return[w.a0+Math.floor((e.clientX-r.left)/r.width*cols),w.n1-Math.floor((e.clientY-r.top)/r.height*rows)]};
 cv.onmousemove=e=>{const[a,n]=pos(e);tip.style.display='block';tip.style.left=e.clientX+12+'px';tip.style.top=e.clientY+12+'px';tip.textContent=`${n} coins = ${fmt(a)}: ${ways(n,a)} ways`};
 cv.onmouseleave=()=>tip.style.display='none';
 cv.onclick=e=>{const[a,n]=pos(e);if(a>=1&&n>=1)setProblem(a,n,true)};
}

