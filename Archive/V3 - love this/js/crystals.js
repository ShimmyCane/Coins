const CRYSTAL_PAGE_SIZE=36;
const CRYSTAL_STYLES=[
 ['rose','Rose prism'],['snowflake','Snowflake'],['3d','3D'],['conical','Conical']
];
const CRYSTAL_PALETTES=[
 ['mint','Mint'],['ocean','Ocean'],['amethyst','Amethyst'],['sunset','Sunset']
];
const CRYSTAL_COLORS={
 mint:{P:'#c0692f',N:'#84919d',D:'#7d91a5',Q:'#8670bd',H:'#49978d',S:'#d4a944'},
 ocean:{P:'#cd7950',N:'#9eb5c0',D:'#4397c4',Q:'#5778b8',H:'#31a59c',S:'#e3c86e'},
 amethyst:{P:'#b97868',N:'#a49abb',D:'#6f8cc6',Q:'#a46dbb',H:'#7b70ad',S:'#d3ad75'},
 sunset:{P:'#d36d42',N:'#9e9695',D:'#518db2',Q:'#ab62a2',H:'#d17a55',S:'#e0b343'}
};

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
   <span class="muted" style="margin-left:8px">Color</span>${CRYSTAL_PALETTES.map(([id,label])=>`<button class="${S.crystalPalette===id?'on':''}" data-act="crystalPalette" data-arg="${id}">${label}</button>`).join('')}</div>
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
 return 17+44*Math.pow(entropy/Math.log(KEYS.length),.7);
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
  const {solution,r}=body,types=en().filter(k=>solution[k]>0),colors=CRYSTAL_COLORS[S.crystalPalette]||CRYSTAL_COLORS.mint;
  const genome=crystalGenome(solution),color=blendCrystalColors(genome,colors);
  const top=Math.max(...genome,1e-9),nTypes=genome.filter(p=>p>0).length;
  const dominant=a=>{let best=0,bestScore=-1;genome.forEach((p,k)=>{const s=p*Math.pow(Math.max(0,Math.cos(a-spokeAngle(k))),2);if(s>bestScore){bestScore=s;best=k}});return KEYS[best]};
  const domKey=KEYS[genome.indexOf(top)];
  ctx.save();ctx.translate(body.x,body.y);ctx.rotate(body.angle);
  ctx.fillStyle='rgba(29,66,55,.2)';ctx.beginPath();ctx.ellipse(2,r*.83,r*.92,r*.27,0,0,Math.PI*2);ctx.fill();
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
  }else if(style==='3d'){
   const n=12,height=r*(.8+.18*nTypes),rings=[[-height,0],[-height*.45,.75],[height*.2,1],[height*.75,.6]];
   const cy=Math.cos(.45),sy=Math.sin(.45),cr=Math.cos(t+body.x*.01),sr=Math.sin(t+body.x*.01);
   const proj=(x,y,z)=>{const rx=x*cr+z*sr,rz=-x*sr+z*cr;return[rx,y*cy-rz*sy,y*sy+rz*cy]};
   const verts=rings.map(([y,s])=>Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/n,q=crystalReach(genome,a)*r*s*1.05;return proj(Math.cos(a)*q,y,Math.sin(a)*q)}));
   const apexT=proj(0,-height*1.35,0),apexB=proj(0,height*1.05,0),faces=[];
   for(let i=0;i<n;i++){
    const j=(i+1)%n,key=colors[dominant(-Math.PI/2+(i+.5)*Math.PI*2/n)];
    faces.push({pts:[apexT,verts[0][i],verts[0][j]],key});
    for(let k=0;k<3;k++)faces.push({pts:[verts[k][i],verts[k][j],verts[k+1][j],verts[k+1][i]],key});
    faces.push({pts:[verts[3][i],verts[3][j],apexB],key});
   }
   faces.forEach(f=>{f.z=f.pts.reduce((s,p)=>s+p[2],0)/f.pts.length;
    const [a,b,c]=f.pts,ux=b[0]-a[0],uy=b[1]-a[1],vx=c[0]-a[0],vy=c[1]-a[1];f.facing=ux*vy-uy*vx});
   faces.filter(f=>f.facing<0).sort((a,b)=>b.z-a.z).forEach(f=>{
    const shade=Math.max(0,Math.min(1,.5+f.z/(r*1.6)));
    polygon(f.pts.map(p=>[p[0],p[1]]),f.key,'#ffffff55');
    polygon(f.pts.map(p=>[p[0],p[1]]),`rgba(255,255,255,${(shade*.45).toFixed(2)})`,'#ffffff30');
   });
  }else if(style==='conical'){
   const tiers=KEYS.map((k,i)=>[k,genome[i]]).filter(([,p])=>p>0);
   const H=r*(1.2+.9*top),R=r*(.55+.5*(1-top)+.1*nTypes);
   let y=r*.7;
   const widthAt=yy=>R*Math.max(0,(yy+H-r*.7)/H);
   tiers.sort((a,b)=>b[1]-a[1]);
   tiers.forEach(([k,p],idx)=>{
    const h=H*p,y2=y-h,w1=widthAt(y),w2=widthAt(y2),e1=w1*.28,e2=w2*.28;
    ctx.beginPath();ctx.moveTo(-w1,y);ctx.ellipse(0,y,w1,e1,0,Math.PI,0,true);ctx.lineTo(w2,y2);ctx.ellipse(0,y2,w2,e2,0,0,Math.PI,false);ctx.closePath();
    const g=ctx.createLinearGradient(-w1,0,w1,0);g.addColorStop(0,colors[k]);g.addColorStop(.4,'#ffffffcc');g.addColorStop(1,colors[k]);
    ctx.fillStyle=colors[k];ctx.fill();ctx.fillStyle=g;ctx.globalAlpha=.55;ctx.fill();ctx.globalAlpha=1;
    ctx.strokeStyle='#ffffffaa';ctx.lineWidth=1.2;ctx.stroke();
    y=y2;
   });
   ctx.fillStyle='#ffffffcc';ctx.beginPath();ctx.arc(0,y,2.5,0,Math.PI*2);ctx.fill();
  }else{
   const sides=Math.max(12,8+nTypes*4)*(1),points=[],angles=[];
   const spike=.45+.5*(1-top);
   for(let i=0;i<sides;i++){
    const angle=-Math.PI/2+i*Math.PI*2/sides;
    let reach=crystalReach(genome,angle)*(i%2?spike:1.12);
    angles.push(angle);points.push([Math.cos(angle)*r*reach,Math.sin(angle)*r*reach*.86]);
   }
   const gradient=ctx.createLinearGradient(-r,-r,r,r);gradient.addColorStop(0,'#ffffffd9');gradient.addColorStop(.4,color);gradient.addColorStop(1,'#293e70');
   polygon(points,gradient);
   for(let i=0;i<sides;i++){
    const a=points[i],b=points[(i+1)%sides],facetColor=colors[dominant(angles[i])];
    polygon([[0,0],a,b],i%2===0?`${facetColor}d9`:'#ffffff48','#ffffff30');
   }
  }
  ctx.restore();
  ctx.fillStyle='#28433a';ctx.font='11px system-ui';ctx.textAlign='center';
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
