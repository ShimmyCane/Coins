/* ---------- panels ---------- */
const TABS=[['Views',[['walk','Coin Walk'],['table','Table'],['eq','Equations'],['par','Rose'],['map','Map']]],
 ['Strategies',[['trade','Trade'],['twostep','Two-step'],['peel','Peel-off'],['bounds','Bounds'],['pairs','Two types'],['balance','Balance'],['family','Families']]],
 ['Progress',[['sols','Solutions'],['hist','History']]]];
const PANELS={table:pTable,eq:pEq,walk:pWalk,par:pRose,map:pMap,trade:pTrade,twostep:pTwo,peel:pPeel,bounds:pBounds,pairs:pPairs,balance:pBalance,family:pFamily,sols:pSols,hist:pHist};
function renderRight(){
 $('#tabs').innerHTML=TABS.map(([g,ts])=>`<span class="g">${g}</span>`+ts.map(([id,n])=>`<button class="${S.open.includes(id)?'on':''}" data-act="tab" data-arg="${id}">${S.open.includes(id)?'−':'+'} ${n}</button>`).join('')).join('');
 $('#panels').innerHTML=S.open.length?S.open.map(id=>`<div class="card panel"><button class="pclose" data-act="tab" data-arg="${id}" title="Hide">−</button>${PANELS[id]()}</div>`).join(''):'<p class="muted">Use the + buttons above to open views and strategies. Open as many as you like.</p>';
 if(S.open.includes('map'))drawMap();
}
const hidden=()=>S.pred&&S.pred.pending;
const hiddenMsg='<p class="muted">🙈 Make your prediction first — then this view will reveal the answer.</p>';

/* ---------- events ---------- */
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-act]');if(!el)return;
 const a=el.dataset.act,g=el.dataset.arg,c=S.combo;
 switch(a){
  case'page':S.page=g;renderAll();break;
  case'settings':S.settings=!S.settings;renderBar();break;
  case'tab':S.open=S.open.includes(g)?S.open.filter(x=>x!==g):[...S.open,g];renderRight();break;
  case'arrange':arrange();break;
  case'reset':setCombo(zero(),'clear');S.table=[];renderAll();break;
  case'toggle':{const on=en();if(S.enabled[g]&&on.length===1)break;S.enabled[g]=S.enabled[g]?0:1;
   resetFound();const nc={...c};if(!S.enabled[g])nc[g]=0;setCombo(nc,'coin types changed');break}
  case'fewer':{const on=en();if(on.length>1){S.enabled[on[on.length-1]]=0;resetFound();setCombo(c,'fewer types')}break}
  case'more':{const off=KEYS.find(k=>!S.enabled[k]&&BK[k].v>BK[en().slice(-1)[0]].v)||KEYS.find(k=>!S.enabled[k]);if(off){S.enabled[off]=1;resetFound();setCombo(c,'more types')}break}
  case'surprise':surprise();break;
  case'ghost':{const l=sols().filter(s=>ckey(s)!==ckey(c));if(l.length){S.ghost=l[ri(0,l.length-1)];renderAll()}break}
  case'noghost':S.ghost=null;renderAll();break;
  case'one':{const l=sols().filter(s=>!S.found.has(ckey(s)));const p=l.length?l:sols();if(p.length)setCombo(p[ri(0,p.length-1)],'show me one');else{if(!S.open.includes('sols'))S.open.push('sols');renderAll()}break}
  case'undo':if(S.hist.length>1){S.hist.pop();setCombo(S.hist[S.hist.length-1].combo,'',true)}break;
  case'guess':guess(g);break;
  case'inc':setCombo({...c,[g]:c[g]+1},'+1 '+BK[g].name);break;
  case'dec':setCombo({...c,[g]:c[g]-1},'-1 '+BK[g].name);break;

  case'setA':setProblem(+g,S.count,true);break;
  case'setN':setProblem(S.amount,+g,true);break;
  case'trade':{const[i,d]=g.split(',');applyTrade(+i,d);break}
  case'fillbase':setCombo({[en()[0]]:S.count},'fill '+BK[en()[0]].pl);break;
  case'swap':{const k0=en()[0];setCombo({...c,[k0]:c[k0]-1,[g]:c[g]+1},`swap ${BK[k0].l}→${BK[g].l}`);break}
  case'unswap':{const k0=en()[0];setCombo({...c,[k0]:c[k0]+1,[g]:c[g]-1},`swap ${BK[g].l}→${BK[k0].l}`);break}
  case'greedy':setCombo(minMax(S.amount).combo,'fewest coins');break;
  case'peel':{const[i,v]=g.split(',').map(Number);S.peel.length=i;S.peel[i]=v;renderRight();break}
  case'peelclear':S.peel=[];renderRight();break;
  case'peelapply':{const nc=zero();S._peelKs.forEach((k,i)=>{if(S._peelChosen[i]!=null)nc[k]=S._peelChosen[i]});setCombo(nc,'peel-off');break}
  case'pairload':{const[x,y]=g.split(','),r=pairSolve(x,y),nc=zero();nc[x]=r.x;nc[y]=r.y;setCombo(nc,`pair ${BK[x].l}+${BK[y].l}`);break}
  case'paironly':{const[x,y]=g.split(',');KEYS.forEach(k=>S.enabled[k]=(k===x||k===y)?1:0);resetFound();const r=pairSolve(x,y),nc=zero();nc[x]=r.x;nc[y]=r.y;setCombo(nc,'only '+BK[x].l+BK[y].l);break}
  case'move':famAnimate(S._moves[+g]);break
  case'rosemode':S.roseMode=g;renderRight();break;
  case'mapzoom':S.mapZ=Math.max(0,Math.min(3,(S.mapZ||0)+ +g));renderRight();break;
  case'load':setCombo(Object.fromEntries(KEYS.map((k,i)=>[k,+g.split(',')[i]])),'load solution');break;
  case'reveal':S.reveal=!S.reveal;renderRight();break;
  case'restore':setCombo(S.hist[+g].combo,'restore');break;
  case'crystalStyle':S.crystalStyle=g;renderAll();break;
  case'crystalPalette':S.crystalPalette=g;renderAll();break;
  case'crystalPage':S.crystalPage=Math.max(0,S.crystalPage+ +g);renderAll();break;
 }
});
document.addEventListener('change',e=>{
 const el=e.target,i=el.dataset.in;if(!i)return;
 if(i==='amount')setProblem(+el.value,S.count,false);
 else if(i==='count')setProblem(S.amount,+el.value,false);
 else if(i==='predict'){S.predictOn=el.checked;S.pred=null;renderAll()}
 else if(i==='tbl'||i==='eq')setCombo({...S.combo,[el.dataset.k]:Math.max(0,Math.floor(+el.value)||0)},'set '+BK[el.dataset.k].pl);
});

function renderAll(){
 const f=document.activeElement;if(f&&f.tagName==='INPUT')f.blur();
 renderBar();renderTable();renderRight();
 document.querySelectorAll('.ptabs [data-act="page"]').forEach(button=>button.classList.toggle('on',button.dataset.arg===S.page));
 $('#coinPage').hidden=S.page!=='coins';
 $('#crystalPage').hidden=S.page!=='crystals';
 $('#learnPage').hidden=S.page!=='learn';
 if(!$('#learnPage').dataset.mounted){$('#learnPage').innerHTML=renderLearnPage();$('#learnPage').dataset.mounted='true';renderDeck()}
 if(S.page==='crystals'){$('#crystalPage').innerHTML=renderCrystalPage();mountCrystals()}
 else stopCrystals();
}
buildDefs();renderAll();
