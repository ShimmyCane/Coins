/* ---------- table top ---------- */
const TW=440,TH=420;
function syncTable(){
 KEYS.forEach(k=>{
  const mine=S.table.filter(c=>c.k===k);
  const want=S.combo[k];
  if(mine.length>want){const drop=new Set(mine.slice(want).map(c=>c.id));S.table=S.table.filter(c=>!drop.has(c.id))}
  for(let i=mine.length;i<want;i++)S.table.push({id:++S.uid,k,x:50+Math.random()*(TW-100),y:50+Math.random()*(TH-120)});
 });
}
const PILE={P:n=>n<=20?5:10,N:n=>n<=10?2:10,D:n=>n<=20?5:10,Q:()=>4,H:n=>n<=6?2:10,S:n=>n<=20?5:10};
function arrange(ms=750){
 let y=12;S.labels=[];S.sum=[];
 KEYS.forEach(k=>{
  const cs=S.table.filter(c=>c.k===k);if(!cs.length)return;
  const g=PILE[k](cs.length),dy=g>5?3:4;
  const r=R(k),pw=2*r+10,per=Math.floor((TW-40)/pw),ph=2*r+(g-1)*dy,rows=Math.ceil(cs.length/g/per),full=Math.floor(cs.length/g),rem=cs.length%g;
  S.labels.push({x:20,y:y+12,text:`${BK[k].pl}: ${cs.length} coin${cs.length>1?'s':''} - ${fmt(cs.length*BK[k].v)}`});
  S.sum.push(cs.length*BK[k].v);
  y+=20;
  cs.forEach((c,n)=>{const pi=Math.floor(n/g),jj=n%g,row=Math.floor(pi/per),col=pi%per;
   c.x=20+r+col*pw;c.y=y+row*(ph+10)+ph-r-jj*dy;});
  y+=rows*(ph+10)+6;
 });
 const sumH=S.sum.length*20+34;S.ttH=Math.max(TH,y+8);if(S.ttH-sumH<y)S.ttH=y+sumH+8;
 const svg=$('#tt');svg.style.setProperty('--ad',ms+'ms');svg.classList.add('anim');svg.setAttribute('viewBox','0 0 '+TW+' '+S.ttH);
 $('#ttbg').setAttribute('height',S.ttH);$('#ttbd').setAttribute('height',S.ttH-12);
 S.table.forEach(c=>{const el=svg.querySelector('[data-id="'+c.id+'"]');if(el)el.style.transform=`translate(${c.x}px,${c.y}px)`});
 S.table.sort((a,b)=>b.y-a.y);
 clearTimeout(S._at);S._at=setTimeout(()=>{svg.classList.remove('anim');S.sorted=true;renderTable()},ms+50);
}
function coinG(c){return `<g class="tcoin" data-id="${c.id}" style="cursor:grab;transform:translate(${c.x}px,${c.y}px)"><g transform="scale(${R(c.k)})"><use href="#coin-${c.k}" x="-1" y="-1" width="2" height="2"/></g></g>`}
function renderTable(){
 syncTable();
 if(!S.table.length)S.ttH=TH;const H=S.ttH;$('#tt').setAttribute('viewBox','0 0 '+TW+' '+H);
 $('#tt').innerHTML=`<rect id="ttbg" width="${TW}" height="${H}" fill="#1f6b46"/><rect id="ttbd" x="6" y="6" width="${TW-12}" height="${H-12}" rx="14" fill="none" stroke="#fff3" stroke-width="3"/>`+(S.sorted?S.labels.map(l=>`<text class="tlabel" x="${l.x}" y="${l.y}" fill="#fff" font-size="13" font-weight="600">${l.text}</text>`).join('')+sumSvg(H):'')+
  (S.table.length?'':`<text x="${TW/2}" y="215" text-anchor="middle" fill="#fff6" font-size="22">Drag coins here from the tray</text>`)+
  S.table.map(coinG).join('');
 const c=S.combo;
 $('#tray').innerHTML=en().map(k=>`<div class="tray-coin" data-k="${k}">${icon(k,34)}<b>×${c[k]}</b></div>`).join('')+
  `<button class="btn alt" data-act="arrange">Sort</button><button class="btn alt" data-act="reset">Clear</button><span class="muted">Drag out to remove · double-click removes</span>`;
}
function svgPt(e){const s=$('#tt'),p=s.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(s.getScreenCTM().inverse())}
const inSvg=e=>{const r=$('#tt').getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom};
function addCoin(k,x,y){
 S.table.push({id:++S.uid,k,x,y});
 setCombo({...S.combo,[k]:S.combo[k]+1},'+1 '+BK[k].name);
}
function removeCoin(id){
 const c=S.table.find(c=>c.id===id);if(!c)return;
 S.table=S.table.filter(x=>x.id!==id);
 setCombo({...S.combo,[c.k]:S.combo[c.k]-1},'-1 '+BK[c.k].name);
}
document.addEventListener('pointerdown',e=>{
 const tc=e.target.closest('.tcoin');
 if(tc){
  e.preventDefault();
  const coin=S.table.find(c=>c.id==tc.dataset.id);if(!coin)return;S.sorted=false;document.querySelectorAll('.tlabel').forEach(n=>n.remove());
  const p0=svgPt(e),off={x:coin.x-p0.x,y:coin.y-p0.y};tc.parentNode.appendChild(tc);
  const mv=ev=>{const p=svgPt(ev);coin.x=p.x+off.x;coin.y=p.y+off.y;tc.style.transform=`translate(${coin.x}px,${coin.y}px)`};
  const up=ev=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);
   if(!inSvg(ev))removeCoin(coin.id);else{coin.x=Math.max(10,Math.min(TW-10,coin.x));coin.y=Math.max(10,Math.min(S.ttH-10,coin.y));tc.style.transform=`translate(${coin.x}px,${coin.y}px)`}};
  window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);return;
 }
 const tr=e.target.closest('.tray-coin');
 if(tr){
  e.preventDefault();
  const k=tr.dataset.k,sx=e.clientX,sy=e.clientY;let moved=false;
  const g=document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('opacity','.85');g.innerHTML=`<g transform="scale(${R(k)})"><use href="#coin-${k}" x="-1" y="-1" width="2" height="2"/></g>`;
  const place=ev=>{const p=svgPt(ev);g.setAttribute('transform',`translate(${p.x},${p.y})`)};
  const mv=ev=>{if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>6){moved=true;$('#tt').appendChild(g)}if(moved)place(ev)};
  const up=ev=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);g.remove();
   if(!moved)addCoin(k,60+Math.random()*580,60+Math.random()*240);
   else if(inSvg(ev)){const p=svgPt(ev);addCoin(k,p.x,p.y)}};
  window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);
 }
});
document.addEventListener('dblclick',e=>{const tc=e.target.closest('.tcoin');if(tc)removeCoin(+tc.dataset.id)});


function sumSvg(H){
 const v=S.sum||[];if(!v.length)return '';
 const x=TW-26,n=v.length,top=H-24-n*20-8;
 let s=v.map((a,i)=>`<text class="tlabel" x="${x}" y="${top+i*20+14}" text-anchor="end" fill="#fff" font-size="15" font-weight="600">${n>1&&i===n-1?'+ ':''}${fmt(a)}</text>`).join('');
 s+=`<line class="tlabel" x1="${x-90}" x2="${x+2}" y1="${top+n*20+2}" y2="${top+n*20+2}" stroke="#fff" stroke-width="2"/>`;
 s+=`<text class="tlabel" x="${x}" y="${top+n*20+22}" text-anchor="end" fill="#fff" font-size="16" font-weight="700">${fmt(v.reduce((p,q)=>p+q,0))}</text>`;
 return s;
}
