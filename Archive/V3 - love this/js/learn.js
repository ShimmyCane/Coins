const FACT_COLORS=[['#ff9a8b','#ff6a88'],['#a18cd1','#6a82fb'],['#43e97b','#14b8a6'],['#f6d365','#fda085'],['#4facfe','#00c6fb'],['#f093fb','#f5576c'],['#fbc2eb','#a6c1ee'],['#84fab0','#4facfe']];
const DECK=[
 {t:'fact',icon:'🪙',stat:'100',unit:'pennies make $1',title:'Count to a dollar',text:'20 nickels, 10 dimes, or 4 quarters do the same job!'},
 {t:'fact',icon:'🎩',stat:'1909',unit:'Lincoln joins the penny',title:'A real person!',text:'Abraham Lincoln was the first real person on a regular U.S. coin.'},
 {t:'tf',id:'dime',icon:'🔍',q:'A dime is bigger than a nickel.',a:false,why:'The dime is the smallest U.S. coin, even though it is worth more than a nickel!'},
 {t:'fact',icon:'🔬',stat:'97.5%',unit:'zinc inside a penny',title:'Secret center',text:'Since 1982 pennies are zinc inside with a thin copper skin.'},
 {t:'fact',icon:'🏭',stat:'2 dies',unit:'squeeze every coin',title:'How a coin is made',text:'A smooth blank is pressed between two engraved stamps — front and back at once!'},
 {t:'wonder',icon:'🤔',q:'Why do some coins have ridges on the edge?',hint:'Long ago coins were real silver. Ridges made it easy to spot anyone shaving the edges off!'},
 {t:'fact',icon:'🔢',stat:'118',unit:'ridges on a dime',title:'Ridge counting',text:'A quarter has 119 and a half dollar has 150. Bring a magnifying glass!'},
 {t:'tf',id:'ridges',icon:'📏',q:'A quarter has more ridges than a dime.',a:true,why:'Quarter 119, dime 118 — just one more!'},
 {t:'fact',icon:'⚖️',stat:'5 g',unit:'a nickel weighs',title:'Nickel mix',text:'It is 75% copper and 25% nickel.'},
 {t:'fact',icon:'🔤',stat:'P D S W',unit:'tiny mint marks',title:'Where was it made?',text:'Philadelphia, Denver, San Francisco, or West Point. Find the letter on a coin!'},
 {t:'tf',id:'half',icon:'➗',q:'Two quarters are worth the same as one half dollar.',a:true,why:'25¢ + 25¢ = 50¢. Half of a dollar!'},
 {t:'fact',icon:'🧐',stat:'numis·MAT·ist',unit:'a coin collector',title:'Coin detectives',text:'Collectors hunt for special years, designs, and funny mistakes.'},
 {t:'wonder',icon:'🧮',q:'How many ways can you make 25¢ with pennies, nickels, dimes, and quarters?',hint:'There are 13! Try the Coins 1 tab to explore combos.'},
 {t:'tf',id:'clean',icon:'🧽',q:'Scrubbing an old coin makes it more valuable.',a:false,why:'Scrubbing scratches the surface. Collectors leave coins just as they are.'},
 {t:'fact',icon:'🌎',stat:'Billions',unit:'of coins made each year',title:'Lots of coins!',text:'The U.S. Mint makes more pennies than any other coin.'},
 {t:'fact',icon:'🎨',stat:'Crayon + paper',unit:'coin rubbing',title:'Make art',text:'Put a coin under paper and rub the side of a crayon — the design appears!'},
 {t:'fact',icon:'👕',stat:'75%',unit:'cotton in a dollar bill',title:'Not made of trees',text:'Bills are 75% cotton and 25% linen, so they can survive a trip through the wash.'},
 {t:'tf',id:'five',icon:'💵',q:'A $5 bill shows Abraham Lincoln.',a:true,why:'Yes! Washington is on the $1, Lincoln on the $5, Hamilton on the $10.'},
 {t:'fact',icon:'⏳',stat:'30 yrs',unit:'a coin can last',title:'Tough little coins',text:'A $1 bill wears out in about 6 years.'},
 {t:'wonder',icon:'🎨',q:'If you designed a coin, what picture and words would it show?',hint:'Draw it! A good design is simple, so you can see it from far away.'}
];
const GALLERY=[
 ['Penny','1¢','penny front.jpg','penny back.jpg','#ff9a8b'],
 ['Nickel','5¢','nickel front.jpg','raw/2025-jefferson-nickel-uncirculated-reverse.jpg','#a18cd1'],
 ['Dime','10¢','dime front.jpg','dime back.jpg','#4facfe'],
 ['Quarter','25¢','quarter front.jpg','quarter back.jpg','#43e97b'],
 ['Half dollar','50¢','half front.jpg','half back','#f6d365'],
 ['Dollar','$1','dollar front.jpg','dollar back.jpg','#f093fb']
];
const learnState={i:0,tf:{},hints:{},stars:0};
const coinSrc=f=>`assets/${f.startsWith('raw/')?f:'images/'+encodeURIComponent(f)}`;

function renderLearnPage(){
 return `<header class="learn-hero"><div><h2>🪙 Coin Club</h2><p>Flip through the cards, Athena!</p></div><div class="learn-stars" id="learnStars"></div></header>
 <div id="deck"></div>
 <h3 class="gallery-title">✨ Tap a coin to flip it!</h3>
 <div class="gallery" id="gallery">${GALLERY.map(([name,value,front,back,color],i)=>`<button class="coin3d" data-learn="flip" style="--c:${color};--d:${i*.35}s" aria-label="Flip the ${name}">
  <span class="coin-inner"><img class="face front" src="${coinSrc(front)}" alt="${name} obverse"><img class="face back" src="${coinSrc(back)}" alt="${name} reverse"></span>
  <b>${name}</b><small>${value}</small></button>`).join('')}</div>`;
}

function renderDeck(){
 const card=DECK[learnState.i],[c1,c2]=FACT_COLORS[learnState.i%FACT_COLORS.length];
 let body='';
 if(card.t==='fact')body=`<div class="stat">${card.stat}</div><div class="stat-unit">${card.unit}</div><h3>${card.title}</h3><p>${card.text}</p>`;
 else if(card.t==='wonder')body=`<div class="tag">Wonder 💭</div><h3>${card.q}</h3>${learnState.hints[learnState.i]?`<p class="reveal">${card.hint}</p>`:`<button class="learn-btn" data-learn="hint">Show a hint</button>`}`;
 else{
  const ans=learnState.tf[card.id],done=ans!==undefined,ok=done&&ans===card.a;
  body=`<div class="tag">True or False? ⚡</div><h3>${card.q}</h3>
  <div class="tf-row"><button class="learn-btn tf-true ${done&&card.a?'right':''}" data-learn="tf" data-arg="true" ${done?'disabled':''}>👍 True</button><button class="learn-btn tf-false ${done&&!card.a?'right':''}" data-learn="tf" data-arg="false" ${done?'disabled':''}>👎 False</button></div>
  ${done?`<p class="reveal">${ok?'🎉 You got it! ':'💡 Good guess! '}${card.why}</p>`:''}`;
 }
 $('#deck').innerHTML=`<div class="fact-card" style="--c1:${c1};--c2:${c2}"><div class="fact-icon">${card.icon}</div>${body}
  <i class="spark s1">✦</i><i class="spark s2">✧</i><i class="spark s3">✦</i></div>
 <div class="deck-nav"><button class="learn-btn" data-learn="prev">← Back</button>
  <span class="dots">${DECK.map((_,i)=>`<button class="dot ${i===learnState.i?'on':''}" data-learn="go" data-arg="${i}" aria-label="Card ${i+1}"></button>`).join('')}</span>
  <button class="learn-btn" data-learn="next">Next →</button><button class="learn-btn alt" data-learn="rand">🎲</button></div>`;
 $('#learnStars').textContent=`⭐ ${Object.entries(learnState.tf).filter(([id,v])=>DECK.find(d=>d.id===id).a===v).length} / ${DECK.filter(d=>d.t==='tf').length}`;
}

document.addEventListener('click',e=>{
 const el=e.target.closest('[data-learn]');if(!el)return;
 const a=el.dataset.learn,n=DECK.length;
 if(a==='flip'){el.classList.toggle('flipped');el.classList.remove('hop');void el.offsetWidth;el.classList.add('hop');return}
 if(a==='next')learnState.i=(learnState.i+1)%n;
 else if(a==='prev')learnState.i=(learnState.i+n-1)%n;
 else if(a==='go')learnState.i=+el.dataset.arg;
 else if(a==='rand')learnState.i=(learnState.i+1+Math.floor(Math.random()*(n-1)))%n;
 else if(a==='hint')learnState.hints[learnState.i]=true;
 else if(a==='tf')learnState.tf[DECK[learnState.i].id]=el.dataset.arg==='true';
 renderDeck();
});
