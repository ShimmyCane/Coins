const CRYSTAL_PAGE_SIZE=36;
const CRYSTAL_STYLES=[
 ['spiky','Spiky prism'],['snowflake','Snowflake'],['gem','Gem']
];
const CRYSTAL_THEMES={
 jewel:{label:'Jewel box',bg:['#fdf4ff','#e4ecff'],ink:'#2b2a4a',shadow:'rgba(60,40,100,.2)',c:{P:'#e5484d',N:'#f5a623',D:'#2fbf71',Q:'#2f80ed',H:'#8e44ec',S:'#ff5fa2'}},
 candy:{label:'Candy',bg:['#fff0f6','#fff8dc'],ink:'#6b2a4a',shadow:'rgba(160,60,100,.18)',c:{P:'#ff6b9d',N:'#ffc233',D:'#4fd6a0',Q:'#5ab0ff',H:'#b388ff',S:'#ff8a5b'}},
 aurora:{label:'Aurora',bg:['#0b1030','#14506a'],ink:'#e8f4ff',shadow:'rgba(0,0,0,.35)',c:{P:'#7cffcb',N:'#4ee1ff',D:'#6f8bff',Q:'#b36bff',H:'#ff6bd6',S:'#ffe96b'}}
};
const CRYSTAL_PALETTES=Object.entries(CRYSTAL_THEMES).map(([id,th])=>[id,th.label]);
const CRYSTAL_COLORS=Object.fromEntries(Object.entries(CRYSTAL_THEMES).map(([id,th])=>[id,th.c]));
const crystalTheme=()=>CRYSTAL_THEMES[S.crystalPalette]||CRYSTAL_THEMES.jewel;
const swatchBg=th=>`linear-gradient(90deg,${KEYS.map((k,i)=>`${th.c[k]} ${i*100/6}% ${(i+1)*100/6}%`).join(',')})`;

function renderCrystalPage(){
 const list=sols();
 const pages=Math.max(1,Math.ceil(list.length/CRYSTAL_PAGE_SIZE));
 S.crystalPage=Math.min(S.crystalPage,pages-1);
 const start=S.crystalPage*CRYSTAL_PAGE_SIZE;
 const end=Math.min(start+CRYSTAL_PAGE_SIZE,list.length);
 const coinLabel=S.count===1?'coin':'coins';
 const countText=list.length===3000?'3,000 listed (there may be more)':
  `${list.length} solution${list.length===1?'':'s'}`;
 return `<header class="card crystal-heading">
  <div><h2 style="margin:0">💎 Crystal Garden</h2><div class="muted">${S.count} ${coinLabel} = ${fmt(S.amount)} · ${countText}</div></div>
  <div class="crystal-controls"><button data-act="crystalPage" data-arg="-1" ${S.crystalPage===0?'disabled':''}>← Previous</button>
   <span class="muted">${list.length?`Set ${S.crystalPage+1} of ${pages} · ${start+1}–${end}`:'No matching set'}</span>
   <button data-act="crystalPage" data-arg="1" ${S.crystalPage>=pages-1?'disabled':''}>Next →</button></div>
 </header>
 <div class="card">
  <div class="crystal-controls"><b>Shape</b>${CRYSTAL_STYLES.map(([id,label])=>`<button class="${S.crystalStyle===id?'on':''}" data-act="crystalStyle" data-arg="${id}">${label}</button>`).join('')}
   <span class="muted" style="margin-left:8px">Palette</span><span class="swatches">${CRYSTAL_PALETTES.map(([id,label])=>`<button class="swatch ${S.crystalPalette===id?'on':''}" data-act="crystalPalette" data-arg="${id}" title="${label}"><i style="background:${swatchBg(CRYSTAL_THEMES[id])};box-shadow:inset 0 0 0 100px transparent"></i><small style="color:inherit">${label}</small></button>`).join('')}</span></div>
 </div>
 ${list.length?`<div class="card crystal-scene"><canvas class="crystal-canvas" id="crystalCanvas" aria-label="Drag and tumble solution crystals on the tabletop"></canvas>
  <div class="crystal-note muted">Drag to toss, nudge crystals into each other, and watch them settle on the tabletop. Click a crystal to put that coin combination on the coin table. Each crystal grows from its coin mix: more of a coin pushes the crystal out toward that coin, so solutions that are one trade apart look like siblings.</div></div>
  <details class="card"><summary>Pick a crystal by its coin counts</summary><div class="row">${list.map(solution=>`<button class="mv" data-act="load" data-arg="${ckey(solution)}">${en().filter(k=>solution[k]).map(k=>`${BK[k].l}${solution[k]}`).join(' ')}</button>`).join('')}</div></details>`:
  `<div class="card"><h3>No crystals for this problem yet</h3><p class="muted">Try changing the coin types, coin count, or amount in the shared controls. Crystals appear when at least one combination works.</p></div>`}
 <div class="card muted">The faceted gems use a 3-D look with a lightweight tabletop physics simulation: gravity, sliding, bouncing, and crystal-to-crystal bumps. Use the shared coin controls above to change the solution set.</div>`;
}

/* A crystal's "genome" is its share of the money in each coin type. Every outline,
   color and size below is a smooth function of it, so neighbouring solutions
   (one trade apart) grow into near-identical siblings. */
function crystalGenome(solution){
 const total=Math.max(1,val(solution));
 return KEYS.map(k=>(solution[k]||0)*BK[k].v/total);
}

function crystalRadius(solution){
 const entropy=-crystalGenome(solution).reduce((s,p)=>s+(p>0?p*Math.log(p):0),0);
 return 17+44*Math.pow(entropy/Math.log(Math.max(2,en().length)),.7);
}

function blendCrystalColors(genome,colors){
 const rgb=KEYS.reduce((sum,k,i)=>{
  const hex=colors[k];
  return sum.map((value,c)=>value+parseInt(hex.slice(1+c*2,3+c*2),16)*genome[i]);
 },[0,0,0]);
 return `#${rgb.map(value=>Math.round(value).toString(16).padStart(2,'0')).join('')}`;
}

const spokeAngle=i=>-Math.PI/2+i*Math.PI/3;
function crystalReach(genome,theta){
 const top=Math.max(...genome,1e-9);
 const f=genome.reduce((s,p,i)=>s+Math.pow(p/top,1.6)*Math.pow(Math.max(0,Math.cos(theta-spokeAngle(i))),5),0);
 return .24+.76*Math.min(1,f);
}

function stopCrystals(){
 if(S._crystalRaf){cancelAnimationFrame(S._crystalRaf);S._crystalRaf=0}
}

function mountCrystals(){
 stopCrystals();
 const canvas=$('#crystalCanvas');
 if(!canvas)return;
 const ctx=canvas.getContext('2d');
 const theme=crystalTheme();canvas.style.background=`linear-gradient(160deg,${theme.bg[0]},${theme.bg[1]})`;
 const list=sols().slice(S.crystalPage*CRYSTAL_PAGE_SIZE,(S.crystalPage+1)*CRYSTAL_PAGE_SIZE);
 const keys=new Set(list.map(ckey));
 for(const key of S.crystalBodies.keys())if(!keys.has(key))S.crystalBodies.delete(key);
 const rect=canvas.getBoundingClientRect(),width=Math.max(300,rect.width),height=Math.max(300,rect.height);
 list.forEach((solution,i)=>{
  const key=ckey(solution);
  if(!S.crystalBodies.has(key)){
   const r=crystalRadius(solution);
   S.crystalBodies.set(key,{key,solution,r,x:width*(i+1)/(list.length+1),y:-r-i%3*14,vx:(i%2?1:-1)*(.2+i%4*.09),vy:0,angle:0,spin:0,dragged:false});
  }
 });
 const bodies=list.map(solution=>S.crystalBodies.get(ckey(solution)));
 let dpr=1,last=0,drag=null;
 function resize(){
  const bounds=canvas.getBoundingClientRect();
  dpr=window.devicePixelRatio||1;
  canvas.width=Math.round(bounds.width*dpr);canvas.height=Math.round(bounds.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
 }
 resize();
 const pointer=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
 canvas.addEventListener('pointerdown',e=>{
  const p=pointer(e);
  const body=[...bodies].reverse().find(b=>Math.hypot(p.x-b.x,p.y-b.y)<=b.r+7);
  if(!body)return;
  drag={body,startX:p.x,startY:p.y,lastX:p.x,lastY:p.y,lastTime:performance.now(),moved:false};
  body.dragged=true;canvas.setPointerCapture(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!drag)return;
  const p=pointer(e),now=performance.now(),elapsed=Math.max(1,now-drag.lastTime);
  drag.moved ||= Math.hypot(p.x-drag.startX,p.y-drag.startY)>5;
  drag.body.x=p.x;drag.body.y=p.y;
  drag.body.vx=(p.x-drag.lastX)/elapsed*16;
  drag.body.vy=(p.y-drag.lastY)/elapsed*16;
  drag.lastX=p.x;drag.lastY=p.y;drag.lastTime=now;
 });
 canvas.addEventListener('pointerup',()=>{
  if(!drag)return;
  const {body,moved}=drag;body.dragged=false;body.spin=body.vx*.006;drag=null;
  if(!moved)setCombo(body.solution,'choose crystal solution');
 });
 canvas.addEventListener('pointercancel',()=>{if(drag){drag.body.dragged=false;drag=null}});

 function polygon(points,fill,stroke='#ffffffaa'){
  ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
  points.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));
  ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=1.2;ctx.stroke();
 }
 function drawCrystal(body){
  const {solution,r}=body,types=en().filter(k=>solution[k]>0),colors=crystalTheme().c;
  const genome=crystalGenome(solution),color=blendCrystalColors(genome,colors);
  const top=Math.max(...genome,1e-9),nTypes=genome.filter(p=>p>0).length;
  const dominant=a=>{let best=0,bestScore=-1;genome.forEach((p,k)=>{const s=p*Math.pow(Math.max(0,Math.cos(a-spokeAngle(k))),2);if(s>bestScore){bestScore=s;best=k}});return KEYS[best]};
  const domKey=KEYS[genome.indexOf(top)];
  ctx.save();ctx.translate(body.x,body.y);ctx.rotate(body.angle);
  ctx.fillStyle=crystalTheme().shadow;ctx.beginPath();ctx.ellipse(2,r*.83,r*.92,r*.27,0,0,Math.PI*2);ctx.fill();
  const style=S.crystalStyle,t=performance.now()/1800;
  if(style==='snowflake'){
   ctx.lineCap='round';
   KEYS.forEach((k,i)=>{
    const p=genome[i],a=spokeAngle(i),len=r*(p>0?.3+.7*Math.pow(p/top,.8):.12);
    const ux=Math.cos(a),uy=Math.sin(a),px=-uy,py=ux;
    ctx.strokeStyle=colors[k];ctx.lineWidth=p>0?2+5*Math.sqrt(p):1.2;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(ux*len,uy*len);ctx.stroke();
    if(p<=0)return;
    const branches=1+Math.round(p*6*(1+nTypes*.15));
    ctx.lineWidth=1.5+2.5*Math.sqrt(p);
    for(let b=1;b<=Math.min(5,branches);b++){
     const f=b/(Math.min(5,branches)+1),bl=len*(.45-.25*f)*(.6+p),bx=ux*len*f,by=uy*len*f;
     [-1,1].forEach(s=>{const ba=a+s*.8;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+Math.cos(ba)*bl,by+Math.sin(ba)*bl);ctx.stroke()});
    }
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ux*len,uy*len,2+3*Math.sqrt(p),0,Math.PI*2);ctx.fill();
   });
   ctx.fillStyle=color;ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r*.16+3,0,Math.PI*2);ctx.fill();ctx.stroke();
  }else if(style==='spiky'){
   const n=12,height=r*(.85+.15*nTypes),rings=[[-height*.9,0],[-height*.4,.7],[height*.1,1.1],[height*.7,.55]];
   const spike=1.2+.9*(1-top),ph=body.phase||(body.phase=Math.random()*6.28);
   const cy=Math.cos(.45),sy=Math.sin(.45),cr=Math.cos(t+ph),sr=Math.sin(t+ph);
   const proj=(x,y,z)=>{const rx=x*cr+z*sr,rz=-x*sr+z*cr;return[rx,y*cy-rz*sy,y*sy+rz*cy]};
   const verts=rings.map(([y,s],k)=>Array.from({length:n},(_,i)=>{
    const a=-Math.PI/2+i*Math.PI*2/n,mid=k===1||k===2,m=mid?(i%2?spike:.62):1;
    const q=crystalReach(genome,a)*r*s*1.05*m;return proj(Math.cos(a)*q,y,Math.sin(a)*q)}));
   const apexT=proj(0,-height*1.45,0),apexB=proj(0,height*1.15,0),faces=[];
   for(let i=0;i<n;i++){
    const j=(i+1)%n,key=colors[dominant(-Math.PI/2+(i+.5)*Math.PI*2/n)];
    faces.push({pts:[apexT,verts[0][i],verts[0][j]],key});
    for(let k=0;k<3;k++)faces.push({pts:[verts[k][i],verts[k][j],verts[k+1][j],verts[k+1][i]],key});
    faces.push({pts:[verts[3][i],verts[3][j],apexB],key});
   }
   faces.forEach(f=>{f.z=f.pts.reduce((s,p)=>s+p[2],0)/f.pts.length;
    const [a,b,c]=f.pts,ux=b[0]-a[0],uy=b[1]-a[1],vx=c[0]-a[0],vy=c[1]-a[1];f.facing=ux*vy-uy*vx});
   faces.sort((a,b)=>b.z-a.z).forEach(f=>{
    const shade=f.facing<0?Math.max(0,Math.min(1,.5+f.z/(r*1.6))):0;
    polygon(f.pts.map(p=>[p[0],p[1]]),f.key,'#ffffff55');
    polygon(f.pts.map(p=>[p[0],p[1]]),f.facing<0?`rgba(255,255,255,${(shade*.45).toFixed(2)})`:'rgba(20,10,40,.28)','#ffffff30');
   });
  }else{
   /* Gem: each of the six coin shares drives one feature of the stone. */
   const f=KEYS.map((k,i)=>genome[i]>0?.22+.78*Math.pow(genome[i]/top,.8):0);
   const [fP,fN,fD,fQ,fH,fS]=f;
   const W=r*(.5+.75*fD),gt=r*.1,tw=W*(.25+.6*fN),ch=r*(.2+.7*fP),pd=r*(.45+1*fQ);
   const oy=-(ch+pd+gt)/2+ch;
   const Y=y=>y+oy-ch*.0;
   const shine=(c,a)=>c+Math.round(a*255).toString(16).padStart(2,'0');
   if(fS>0){const g=ctx.createRadialGradient(0,Y(0),0,0,Y(0),r*(.9+.8*fS));g.addColorStop(0,shine(colors.S,.55*fS));g.addColorStop(1,shine(colors.S,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,Y(0),r*(.9+.8*fS),0,Math.PI*2);ctx.fill()}
   const gx=[-W,-W/3,W/3,W],tx=[-tw,-tw/3,tw/3,tw],cul=[0,Y(gt+pd)];
   for(let i=0;i<3;i++){
    polygon([[gx[i],Y(gt)],[gx[i+1],Y(gt)],cul],i===1?colors.Q:shine(colors.Q,.8),'#ffffff88');
    polygon([[gx[i],Y(0)],[gx[i+1],Y(0)],[tx[i+1],Y(-ch)],[tx[i],Y(-ch)]],i===1?colors.P:shine(colors.P,.78),'#ffffff88');
   }
   ctx.fillStyle=colors.D;ctx.fillRect(-W,Y(0),W*2,gt);ctx.strokeStyle='#ffffffaa';ctx.lineWidth=1.2;ctx.strokeRect(-W,Y(0),W*2,gt);
   ctx.fillStyle=colors.N;ctx.beginPath();ctx.ellipse(0,Y(-ch),tw,r*.09,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   if(fH>0){const hh=pd*(.25+.5*fH);polygon([[-W/3,Y(gt)],[0,Y(gt+hh)],[W/3,Y(gt)]],shine(colors.H,.95),'#ffffffcc')}
   if(fS>0){const sx=W*.75,sy2=Y(-ch*.7),sz=r*(.15+.4*fS);ctx.fillStyle='#fff';ctx.strokeStyle=colors.S;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx,sy2-sz);ctx.lineTo(sx+sz*.25,sy2-sz*.25);ctx.lineTo(sx+sz,sy2);ctx.lineTo(sx+sz*.25,sy2+sz*.25);ctx.lineTo(sx,sy2+sz);ctx.lineTo(sx-sz*.25,sy2+sz*.25);ctx.lineTo(sx-sz,sy2);ctx.lineTo(sx-sz*.25,sy2-sz*.25);ctx.closePath();ctx.fill();ctx.stroke()}
  }
  ctx.restore();
  ctx.fillStyle=crystalTheme().ink;ctx.font='11px system-ui';ctx.textAlign='center';
  ctx.fillText(types.map(k=>`${BK[k].l}${solution[k]}`).join(' '),body.x,body.y+r+16);
  if(ckey(S.combo)===body.key){ctx.strokeStyle='#e03';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(body.x,body.y,r+5,0,Math.PI*2);ctx.stroke()}
 }
 function frame(now){
  if(!canvas.isConnected||S.page!=='crystals'){stopCrystals();return}
  const bounds=canvas.getBoundingClientRect();
  if(Math.round(bounds.width*dpr)!==canvas.width||Math.round(bounds.height*dpr)!==canvas.height)resize();
  const w=bounds.width,h=bounds.height,dt=last?Math.min(2,(now-last)/16.67):1;last=now;
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1;
  for(let x=18;x<w;x+=38){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  bodies.forEach(body=>{
   if(body.dragged)return;
   body.vy+=.28*dt;body.x+=body.vx*dt;body.y+=body.vy*dt;body.angle+=body.spin*dt;
   body.vx*=Math.pow(.997,dt);body.spin*=Math.pow(.999,dt);
   if(body.x<body.r){body.x=body.r;body.vx=Math.abs(body.vx)*.72}
   if(body.x>w-body.r){body.x=w-body.r;body.vx=-Math.abs(body.vx)*.72}
   if(body.y<body.r){body.y=body.r;body.vy=Math.abs(body.vy)*.55}
   if(body.y>h-body.r-22){body.y=h-body.r-22;body.vy=-Math.abs(body.vy)*.45;body.vx*=.9;if(Math.abs(body.vy)<.35)body.vy=0}
  });
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
   const a=bodies[i],b=bodies[j];if(a.dragged||b.dragged)continue;
   const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.001,min=a.r+b.r;
   if(d>=min)continue;
   const nx=dx/d,ny=dy/d,overlap=min-d;
   a.x-=nx*overlap*.5;a.y-=ny*overlap*.5;b.x+=nx*overlap*.5;b.y+=ny*overlap*.5;
   const approach=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
   if(approach<0){const impulse=-approach*.42;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny}
  }
  bodies.forEach(drawCrystal);
  S._crystalRaf=requestAnimationFrame(frame);
 }
 S._crystalRaf=requestAnimationFrame(frame);
}
