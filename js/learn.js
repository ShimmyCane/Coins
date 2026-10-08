const FACT_COLORS=[['#ff9a8b','#ff6a88'],['#a18cd1','#6a82fb'],['#43e97b','#14b8a6'],['#f6d365','#fda085'],['#4facfe','#00c6fb'],['#f093fb','#f5576c'],['#fbc2eb','#a6c1ee'],['#84fab0','#4facfe']];
const DECK = [
  {t:'fact',icon:'🪙',stat:'100',unit:'pennies make $1',title:'A dollar of pennies',text:'That is a LOT of coins! One dollar in pennies is 100 separate coins.'},
  {t:'fact',icon:'💰',stat:'4',unit:'quarters make $1',title:'Four coins = a dollar',text:'Four quarters can turn into one whole dollar.'},
  {t:'fact',icon:'🔟',stat:'10',unit:'dimes make $1',title:'The dime trick',text:'A dime is 10 cents, so ten dimes make exactly one dollar.'},
  {t:'fact',icon:'⚖️',stat:'5 g',unit:'a nickel weighs',title:'A nickel weighs 5 grams',text:'That is exactly twice the weight of a modern penny.'},
  {t:'fact',icon:'⚖️',stat:'2.5 g',unit:'a penny weighs',title:'Tiny penny',text:'A modern penny weighs just 2.5 grams.'},
  {t:'fact',icon:'🔬',stat:'97.5%',unit:'zinc in a penny',title:'Secret center',text:'Modern pennies are mostly zinc with a very thin copper coating.'},
  {t:'fact',icon:'🪙',stat:'75/25',unit:'copper / nickel',title:'Nickel recipe',text:'A nickel is 75% copper and 25% nickel.'},
  {t:'fact',icon:'📏',stat:'119',unit:'ridges on a quarter',title:'Ridge counting',text:'A modern quarter has 119 little ridges around its edge.'},
  {t:'fact',icon:'📏',stat:'118',unit:'ridges on a dime',title:'Almost the quarter',text:'A dime has 118 ridges — just one fewer than a quarter.'},
  {t:'tf',id:'dimebig',icon:'🔍',q:'A dime is bigger than a nickel.',a:false,why:'No! The dime is actually smaller, even though it is worth more.'},
  {t:'tf',id:'quarterridges',icon:'📏',q:'A quarter has more ridges than a dime.',a:true,why:'Yes! 119 versus 118.'},
  {t:'fact',icon:'🪙',stat:'1909',unit:'Lincoln appears on the penny',title:'Lincoln joins the penny',text:'Abraham Lincoln became the first real person to appear on a regular U.S. coin.'},
  {t:'fact',icon:'🏭',stat:'2',unit:'engraved dies press a coin',title:'Coin sandwich',text:'A coin blank is squeezed between two engraved dies to make both sides at once.'},
  {t:'wonder',icon:'🤔',q:'Why do some coins have ridges around the edge?',hint:'Think about old coins made from valuable metals like silver.'},
  {t:'fact',icon:'🕵️',stat:'1792',unit:'the U.S. Mint begins',title:'Very old mint!',text:'The U.S. Mint began making U.S. coins in 1792.'},
  {t:'fact',icon:'🏛️',stat:'Philadelphia',unit:'first U.S. Mint',title:'Where did it start?',text:'Philadelphia had the first U.S. Mint because it was the nation\'s capital at the time.'},
  {t:'fact',icon:'🔤',stat:'D or P',unit:'common mint marks',title:'Where was it made?',text:'Look for a tiny letter. D means Denver and P means Philadelphia.'},
  {t:'fact',icon:'🪙',stat:'0',unit:'ridges on a penny',title:'Smooth penny',text:'A modern penny has a plain, smooth edge.'},
  {t:'fact',icon:'🪙',stat:'0',unit:'ridges on a nickel',title:'Smooth nickel',text:'A modern nickel also has a plain, smooth edge.'},
  {t:'tf',id:'sizevalue',icon:'📏',q:'A quarter is worth more because it is bigger.',a:false,why:'Coin size does not determine value.'},
  {t:'fact',icon:'🧲',stat:'2.5%',unit:'copper in a penny',title:'A copper disguise',text:'The copper-colored outside is only a thin coating. Most of the penny is zinc.'},
  {t:'wonder',icon:'🧲',q:'Will a magnet pick up a penny?',hint:'Make your prediction before you test one.'},
  {t:'fact',icon:'🪙',stat:'50¢',unit:'a half dollar',title:'The big half',text:'A half dollar is worth 50 cents — exactly half of a dollar.'},
  {t:'fact',icon:'👨',stat:'Kennedy',unit:'on the half dollar',title:'Who is on it?',text:'The Kennedy half dollar has President John F. Kennedy on the front.'},
  {t:'fact',icon:'👩',stat:'Sacagawea',unit:'on a dollar coin',title:'An explorer on a coin',text:'Sacagawea appears on the golden-colored $1 coin.'},
  {t:'tf',id:'dollarcoin',icon:'💰',q:'The United States has made $1 coins.',a:true,why:'Yes! The U.S. has made several different dollar coins.'},
  {t:'fact',icon:'🗺️',stat:'50',unit:'different state quarters',title:'Collect all 50!',text:'The U.S. made a special quarter for every state.'},
  {t:'wonder',icon:'🗺️',q:'Which state quarter would you want to find first?',hint:'Can you find your own state\'s quarter?'},
  {t:'fact',icon:'🦬',stat:'1',unit:'buffalo on an old nickel',title:'A buffalo in your pocket',text:'The famous Buffalo nickel had a bison on its reverse.'},
  {t:'fact',icon:'🦅',stat:'13',unit:'arrows held by the eagle',title:'Count the eagle!',text:'The eagle on the Great Seal holds 13 arrows, representing the original 13 colonies.'},
  {t:'fact',icon:'⭐',stat:'13',unit:'stars above the eagle',title:'Another 13!',text:'The Great Seal uses the number 13 in several places because there were 13 original colonies.'},
  {t:'fact',icon:'🌎',stat:'13',unit:'letters in E PLURIBUS UNUM',title:'Secret Latin',text:'The phrase means “Out of many, one.”'},
  {t:'tf',id:'presidentcoins',icon:'🙂',q:'Every U.S. coin has a president on it.',a:false,why:'No! Coins can show animals, buildings, symbols, and other people.'},
  {t:'fact',icon:'🎨',stat:'Crayon + paper',unit:'makes a coin rubbing',title:'Turn money into art',text:'Put paper over a coin and gently rub with a crayon to reveal the design.'},
  {t:'fact',icon:'💵',stat:'75%',unit:'cotton in a dollar bill',title:'Money isn\'t normal paper',text:'U.S. currency is 75% cotton and 25% linen.'},
  {t:'fact',icon:'🧵',stat:'25%',unit:'linen in a dollar bill',title:'A fabric bill',text:'The other quarter of the material is linen.'},
  {t:'fact',icon:'⚖️',stat:'1 g',unit:'about the weight of a bill',title:'A bill weighs almost nothing',text:'A U.S. banknote weighs about 1 gram, no matter its denomination.'},
  {t:'fact',icon:'🧵',stat:'red + blue',unit:'tiny fibers in bills',title:'Look closely!',text:'U.S. currency paper contains tiny red and blue security fibers.'},
  {t:'fact',icon:'💵',stat:'11',unit:'characters in a bill\'s serial number',title:'Secret number',text:'The serial number uses eleven numbers and letters.'},
  {t:'fact',icon:'🔎',stat:'2',unit:'times the serial number appears',title:'Find it twice!',text:'The serial number appears twice on the front of a Federal Reserve note.'},
  {t:'fact',icon:'💵',stat:'7',unit:'denominations currently issued',title:'Count the bills',text:'The Federal Reserve currently issues $1, $2, $5, $10, $20, $50, and $100 notes.'},
  {t:'fact',icon:'🤔',stat:'$2',unit:'the bill people forget',title:'The unusual $2 bill',text:'The $2 bill is real money, but you don\'t see it very often.'},
  {t:'fact',icon:'👴',stat:'$100',unit:'Franklin\'s bill',title:'Not a president!',text:'Benjamin Franklin appears on the $100 bill — and he was never president.'},
  {t:'fact',icon:'👨',stat:'$10',unit:'Hamilton\'s bill',title:'Another non-president',text:'Alexander Hamilton appears on the $10 bill. He was never president either.'},
  {t:'fact',icon:'🖼️',stat:'42',unit:'people visible on the $2 bill',title:'Look at the crowd!',text:'The back shows part of a painting of the Declaration of Independence. Space limits mean only 42 people are visible.'},
  {t:'fact',icon:'🔵',stat:'red + blue',unit:'security fibers',title:'Tiny threads',text:'Look closely at a bill and you can see tiny colored fibers mixed into the material.'},
  {t:'fact',icon:'💡',stat:'UV',unit:'can reveal security features',title:'Money under special light',text:'Some bills have security threads that glow different colors under ultraviolet light.'},
  {t:'fact',icon:'🔔',stat:'3-D',unit:'security ribbon on $100',title:'A moving ribbon',text:'The modern $100 bill has a 3-D security ribbon that seems to move when you tilt the bill.'},
  {t:'fact',icon:'💵',stat:'4,000',unit:'folds to tear a banknote',title:'Tough money',text:'It takes roughly 4,000 back-and-forth double folds to tear a banknote.'},
  {t:'fact',icon:'⏳',stat:'7.2 yrs',unit:'estimated $1 bill lifespan',title:'How long does money live?',text:'A $1 bill circulates for about 7.2 years on average before it is retired.'},
  {t:'fact',icon:'💵',stat:'24 yrs',unit:'estimated $100 bill lifespan',title:'The long-lived bill',text:'A $100 bill lasts much longer on average than a $1 bill — about 24 years.'},
  {t:'wonder',icon:'🧠',q:'Would you rather carry $10 in pennies or $10 in quarters?',hint:'Think about how many coins you would need!'},
  {t:'fact',icon:'⚖️',stat:'250 g',unit:'about $1 in pennies',title:'A heavy dollar',text:'One hundred pennies weigh about 250 grams — much more than four quarters.'},
  {t:'wonder',icon:'🧩',q:'Can you make 41¢ using exactly four coins?',hint:'Try a quarter first.'},
  {t:'wonder',icon:'🧩',q:'Can you make 30¢ using exactly four coins?',hint:'Try mixing quarters, dimes, nickels, and pennies.'},
  {t:'wonder',icon:'🏆',q:'What is the fewest number of coins you can use to make 99¢?',hint:'Start by thinking about quarters.'},
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
