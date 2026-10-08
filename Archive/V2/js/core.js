const $=s=>document.querySelector(s);
const COINS=[
 {k:'P',name:'Penny',pl:'pennies',v:1,d:19.05,a:'#e3a077',b:'#9a5528',t:'1¢',l:'p'},
 {k:'N',name:'Nickel',pl:'nickels',v:5,d:21.21,a:'#e4e7ea',b:'#8f969e',t:'5¢',l:'n'},
 {k:'D',name:'Dime',pl:'dimes',v:10,d:17.91,a:'#e4e7ea',b:'#8f969e',t:'10¢',l:'d'},
 {k:'Q',name:'Quarter',pl:'quarters',v:25,d:24.26,a:'#e4e7ea',b:'#8f969e',t:'25¢',l:'q'},
 {k:'H',name:'Half',pl:'halves',v:50,d:30.61,a:'#e4e7ea',b:'#8f969e',t:'50¢',l:'h'},
 {k:'S',name:'Dollar',pl:'dollars',v:100,d:26.5,a:'#f1d56a',b:'#a4811a',t:'$1',l:'s'}];
const KEYS=COINS.map(c=>c.k), BK=Object.fromEntries(COINS.map(c=>[c.k,c]));
const zero=()=>Object.fromEntries(KEYS.map(k=>[k,0]));
const S={ttH:420,sorted:false,labels:[],open:['table'],amount:100,count:50,enabled:{P:1,N:1,D:1,Q:1,H:0,S:0},combo:zero(),table:[],found:new Set(),
 hist:[{label:'start',combo:zero()}],peel:[],ghost:null,
 predictOn:false,settings:innerWidth>980&&innerHeight>760,pred:null,streak:0,reveal:false,uid:0};
const NM=200, AM=1000;
const R=k=>BK[k].d*0.85;
const en=()=>KEYS.filter(k=>S.enabled[k]);
const val=c=>KEYS.reduce((s,k)=>s+BK[k].v*(c[k]||0),0);
const cnt=c=>KEYS.reduce((s,k)=>s+(c[k]||0),0);
const ckey=c=>KEYS.map(k=>c[k]||0).join(',');
const fmt=c=>c<100&&c>-100?c+'¢':(c<0?'-':'')+'$'+(Math.abs(c)/100).toFixed(2);
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));

/* ---------- graphics ---------- */
function buildDefs(){
 let h='';
 COINS.forEach(c=>{
  h+=`<radialGradient id="g-${c.k}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${c.a}"/><stop offset="1" stop-color="${c.b}"/></radialGradient>`;
  const fs=c.t.length>2?.52:.7;
  h+=`<symbol id="coin-${c.k}" viewBox="-1 -1 2 2"><circle r=".96" fill="url(#g-${c.k})" stroke="#0005" stroke-width=".05"/><circle r=".76" fill="none" stroke="#0003" stroke-width=".04"/><text y=".24" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#0008" font-family="system-ui">${c.t}</text></symbol>`;
 });
 $('#defs').innerHTML=h;
}
const icon=(k,px=20)=>`<svg class="ci" width="${px}" height="${px}"><use href="#coin-${k}" width="${px}" height="${px}"/></svg>`;

/* ---------- math ---------- */
let Wc=null;
function getW(){
 const key=en().join('');
 if(Wc&&Wc.key===key)return Wc;
 const W=new Float64Array((NM+1)*(AM+1)); W[0]=1;
 for(const k of en()){const v=BK[k].v;
  for(let n=1;n<=NM;n++){const r=n*(AM+1),p=(n-1)*(AM+1);
   for(let a=v;a<=AM;a++)W[r+a]+=W[p+a-v];}}
 return Wc={key,W};
}
const ways=(n,a)=>(n>=0&&n<=NM&&a>=0&&a<=AM)?getW().W[n*(AM+1)+a]:0;
function minMax(A){
 const vs=en().map(k=>BK[k].v),mn=Array(A+1).fill(Infinity),mx=Array(A+1).fill(-Infinity);mn[0]=0;mx[0]=0;
 const pr=Array(A+1).fill(0);
 for(let a=1;a<=A;a++)for(const v of vs)if(a>=v){
  if(mn[a-v]+1<mn[a]){mn[a]=mn[a-v]+1;pr[a]=v}
  if(mx[a-v]+1>mx[a])mx[a]=mx[a-v]+1;}
 let combo=null;
 if(isFinite(mn[A])){combo=zero();let a=A;while(a>0){const v=pr[a];const k=KEYS.find(k=>BK[k].v===v);combo[k]++;a-=v}}
 return{min:mn[A],max:mx[A],combo};
}
let solCache=null;
function sols(){
 const key=[S.amount,S.count,en().join('')].join('|');
 if(solCache&&solCache.key===key)return solCache.list;
 const ks=en().reverse(),vs=ks.map(k=>BK[k].v),res=[],cap=3000;
 const rec=(i,a,n,cur)=>{
  if(res.length>=cap)return;
  if(i===ks.length-1){if(a===n*vs[i]){cur[ks[i]]=n;res.push({...cur});cur[ks[i]]=0}return}
  const lo=vs[ks.length-1],hi=vs[i+1];
  for(let c=0;c<=Math.min(n,Math.floor(a/vs[i]));c++){
   const ra=a-c*vs[i],rn=n-c;
   if(ra<rn*lo||ra>rn*hi)continue;
   cur[ks[i]]=c;rec(i+1,ra,rn,cur);cur[ks[i]]=0;}
 };
 if(ks.length)rec(0,S.amount,S.count,zero());
 solCache={key,list:res};return res;
}
function cw(i,a,n,ks,memo){
 if(a<0||n<0)return 0;
 if(i>=ks.length)return a===0&&n===0?1:0;
 const v=BK[ks[i]].v;
 if(i===ks.length-1)return a===n*v?1:0;
 const key=i+'|'+a+'|'+n;if(memo.has(key))return memo.get(key);
 let s=0;for(let c=0;c<=Math.min(n,Math.floor(a/v));c++)s+=cw(i+1,a-c*v,n-c,ks,memo);
 memo.set(key,s);return s;
}
const solved=c=>cnt(c)===S.count&&val(c)===S.amount&&S.count>0;

/* ---------- state changes ---------- */
function setCombo(c,label,noHist){
 const nc=zero();KEYS.forEach(k=>nc[k]=S.enabled[k]?Math.max(0,c[k]||0):0);
 S.combo=nc;S.sorted=false;
 if(!noHist){S.hist.push({label,combo:{...nc}});if(S.hist.length>80)S.hist.shift()}
 if(solved(nc))S.found.add(ckey(nc));
 renderAll();
}
const resetFound=()=>{S.found=new Set();S.peel=[]};
function setProblem(A,N,clear){
 S.amount=Math.max(1,Math.min(AM,Math.round(A)||1));S.count=Math.max(1,Math.min(NM,Math.round(N)||1));
 resetFound();S.reveal=false;S.ghost=null;
 if(clear){S.combo=zero();S.table=[];S.hist.push({label:`new problem ${S.count} coins = ${fmt(S.amount)}`,combo:zero()})}
 renderAll();
}
function surprise(){
 for(let t=0;t<400;t++){
  const A=ri(10,300),N=ri(2,Math.min(60,A)),w=ways(N,A);
  if(w>=1&&w<=40){setProblem(A,N,true);startPredict();return}
 }
 setProblem(100,50,true);startPredict();
}
function startPredict(){S.pred=S.predictOn?{pending:true}:null}

