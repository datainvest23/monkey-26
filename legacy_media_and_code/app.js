(function(){
'use strict';
var N=25, ROWS=['A','B','C','D','E'];
var grid=document.getElementById('grid'), range=document.getElementById('range'), monkey=document.getElementById('monkey'), flight=document.getElementById('flight');
var plaque=document.getElementById('plaque'), live=document.getElementById('live'), toast=document.getElementById('toast'), entropyEl=document.getElementById('entropy');
var ledgerBody=document.getElementById('ledger'), distEl=document.getElementById('distribution'), regimesEl=document.getElementById('regimes');
var buttons=['throw','throw10','throw100','audit','copy','reset','download'].map(function(id){return document.getElementById(id)});
var cellCounts=new Array(N).fill(0), tickerCounts={}, throws=0, ledger=[], deal=[], busy=false, audit=false;
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasCrypto=!!(window.crypto&&window.crypto.getRandomValues), rngBuf=hasCrypto?new Uint32Array(1):null;
var rngTotal={calls:0,rejections:0}, lastRng={raw:-1,n:0,idx:0,rejections:0};
var REGIME={Tailwind:['tail','var(--green)'],'Neutral+':['neup','var(--teal)'],Neutral:['neu','var(--blue)'],Cautious:['caut','var(--gold)'],Headwind:['head','var(--red-2)'],Ballast:['ball','var(--purple)']};
var DART='<svg viewBox="0 0 78 20" width="78" height="20"><polygon points="0,10 13,5.5 13,14.5" fill="#eee"/><rect x="13" y="5.5" width="28" height="9" rx="1.5" fill="#d8a748"/><rect x="41" y="8" width="14" height="4" fill="#89959b"/><polygon points="55,10 78,2 78,18" fill="#d64d3b"/><polygon points="55,10 78,2 78,10" fill="#f06a52"/></svg>';
var DART_TAIL='<svg viewBox="0 0 40 40" width="40" height="40"><polygon points="20,2 27,18 13,18" fill="#d64d3b"/><polygon points="20,38 27,22 13,22" fill="#d64d3b"/><polygon points="38,20 22,27 22,13" fill="#f06a52"/><polygon points="2,20 18,27 18,13" fill="#f06a52"/><circle cx="20" cy="20" r="6" fill="#d8a748"/></svg>';
var IMPACT='<svg viewBox="0 0 30 30" width="25" height="25"><path d="M15 1V29M1 15H29M5 5L25 25M25 5L5 25" stroke="#f0cb72" stroke-width="2" stroke-linecap="round"/><circle cx="15" cy="15" r="4" fill="none" stroke="#f0cb72" stroke-width="2"/></svg>';
function regime(r){return REGIME[r]||REGIME.Neutral}
function label(i){return ROWS[Math.floor(i/5)]+String(i%5+1)}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function wait(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
function snapshot(){return {calls:rngTotal.calls,rejections:rngTotal.rejections}}
function delta(before){return {calls:rngTotal.calls-before.calls,rejections:rngTotal.rejections-before.rejections}}
function randInt(n){
  var r,rej=0;
  if(!hasCrypto){r=Math.floor(Math.random()*n);lastRng={raw:-1,n:n,idx:r,rejections:0};rngTotal.calls++;return r}
  var limit=Math.floor(4294967296/n)*n;
  do{crypto.getRandomValues(rngBuf);r=rngBuf[0];rngTotal.calls++;if(r>=limit){rej++;rngTotal.rejections++}}while(r>=limit);
  lastRng={raw:r,n:n,idx:r%n,rejections:rej};return r%n;
}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=randInt(i+1),t=a[i];a[i]=a[j];a[j]=t}return a}
function hex(v){return v<0?'n/a':'0x'+('00000000'+v.toString(16).toUpperCase()).slice(-8)}
function lock(value){busy=value;buttons.forEach(function(b){if(b)b.disabled=value});document.getElementById('top-status').textContent=value?'Simulation running':'Cryptographic RNG ready'}
function notify(text){toast.textContent=text;toast.classList.add('show');clearTimeout(notify.t);notify.t=setTimeout(function(){toast.classList.remove('show')},1800)}
var slots=[];
for(var i=0;i<N;i++){
  var slot=document.createElement('div');slot.className='slot';slot.innerHTML='<div class="card"><div class="face back"><span class="cell-id">'+label(i)+'</span><span class="hit-count"></span></div><div class="face front"><span class="ticker"></span><span class="type"></span></div></div><div class="pins"></div>';
  grid.appendChild(slot);slots.push(slot);
}
function dealCards(){
  var before=snapshot(),pool=shuffle(TICKERS.slice()),stats;deal=pool.slice(0,N);stats=delta(before);
  slots.forEach(function(slot,i){var d=deal[i],f=slot.querySelector('.front'),r=regime(d.r);f.style.setProperty('--rg',r[1]);f.querySelector('.ticker').textContent=d.t;f.querySelector('.type').textContent=d.ty==='ETF'?'ETF':d.x.split(' ')[0];slot.classList.remove('faceup')});
  audit=false;grid.classList.remove('audit');document.getElementById('audit').textContent='Audit wall';return stats;
}
function addPin(slot,x,y){var wrap=slot.querySelector('.pins'),pin=document.createElement('div');pin.className='pin';pin.style.left=x+'%';pin.style.top=y+'%';pin.style.transform='translate(0,-50%) rotate('+(-53+Math.random()*28).toFixed(1)+'deg) scale(.88)';pin.innerHTML=DART.replace('width="78" height="20"','width="29" height="8"');wrap.appendChild(pin);var pins=wrap.querySelectorAll('.pin');if(pins.length>12)pins[0].remove()}
function burst(slot,x,y){if(reduced)return;var mark=document.createElement('div');mark.className='impact';mark.style.left=x+'%';mark.style.top=y+'%';mark.innerHTML=IMPACT;slot.querySelector('.pins').appendChild(mark);setTimeout(function(){mark.remove()},580)}
function setPlaque(cell,d){var r=regime(d.r);plaque.innerHTML='<span class="plaque-label">'+cell+'</span><span class="plaque-ticker">'+esc(d.t)+'</span><span class="plaque-name">'+esc(d.n)+' · '+esc(d.c)+'</span><span class="chip '+r[0]+'">'+esc(d.r)+'</span>';document.getElementById('stage-verdict').textContent=d.t+' selected';document.getElementById('stage-sub').textContent=d.n+' · '+d.r}
function land(i,x,y,flourish,dealStats,hitTrace){
  var slot=slots[i],d=deal[i];addPin(slot,x,y);cellCounts[i]++;throws++;tickerCounts[d.t]=(tickerCounts[d.t]||0)+1;
  var back=slot.querySelector('.back');back.style.setProperty('--heat',Math.min(1,cellCounts[i]/5).toFixed(2));var hc=back.querySelector('.hit-count');hc.textContent=cellCounts[i];hc.classList.add('on');slot.classList.add('faceup','struck');setTimeout(function(){slot.classList.remove('struck')},230);
  ledger.unshift({no:throws,cell:label(i),d:d});setPlaque(label(i),d);if(flourish)burst(slot,x,y);renderAll();showRng(dealStats,hitTrace);live.textContent='Dart landed on '+label(i)+', selecting '+d.t+', '+d.n+'.';
}
function fly(slot,x,y){
  var hand=document.getElementById('hand').getBoundingClientRect(),rect=slot.getBoundingClientRect(),x0=hand.left+hand.width/2,y0=hand.top+hand.height/2,x1=rect.left+rect.width*x/100,y1=rect.top+rect.height*y/100,lift=Math.min(150,Math.abs(x1-x0)*.27)+35,duration=560;
  var d=document.createElement('div');d.className='dart';d.innerHTML='<div class="dart-side">'+DART+'</div><div class="dart-tail">'+DART_TAIL+'</div>';flight.appendChild(d);var side=d.querySelector('.dart-side'),tail=d.querySelector('.dart-tail');
  var anim=d.animate([{transform:'translate('+x0+'px,'+y0+'px) translate(-50%,-50%) rotate(-40deg) scale(1.55)'},{transform:'translate('+((x0+x1)/2)+'px,'+(((y0+y1)/2)-lift)+'px) translate(-50%,-50%) rotate(-12deg) scale(.65)',offset:.5},{transform:'translate('+x1+'px,'+y1+'px) translate(-50%,-50%) rotate(8deg) scale(.16)'}],{duration:duration,easing:'cubic-bezier(.32,.02,.28,1)',fill:'forwards'});
  side.animate([{opacity:1},{opacity:1,offset:.55},{opacity:0,offset:.8}],{duration:duration,fill:'forwards'});tail.animate([{opacity:0},{opacity:0,offset:.55},{opacity:1,offset:.8}],{duration:duration,fill:'forwards'});return anim.finished.then(function(){d.remove()},function(){d.remove()})
}
async function runOne(animate){
  slots.forEach(function(s){s.classList.remove('faceup')});if(animate&&!reduced)await wait(230);var dealStats=dealCards();if(animate&&!reduced)await wait(100);
  var i=randInt(N),hitTrace={raw:lastRng.raw,idx:lastRng.idx,rejections:lastRng.rejections},x=20+Math.random()*60,y=18+Math.random()*64;
  if(animate&&!reduced){monkey.classList.add('winding');await wait(280);monkey.classList.remove('winding');monkey.classList.add('release','throwing');await wait(85);await fly(slots[i],x,y);land(i,x,y,true,dealStats,hitTrace);range.classList.add('shake');setTimeout(function(){range.classList.remove('shake')},320);monkey.classList.remove('release','throwing')}else{land(i,x,y,false,dealStats,hitTrace)}
}
async function single(){if(busy)return;lock(true);try{await runOne(true)}finally{lock(false)}}
async function batch(n){if(busy)return;lock(true);try{for(var i=0;i<n;i++){await runOne(false);if(!reduced&&i<n-1)await wait(n>20?18:80)}}finally{lock(false)}notify(n+' fair throws completed')}
function toggleAudit(){if(busy)return;audit=!audit;grid.classList.toggle('audit',audit);document.getElementById('audit').textContent=audit?'Hide wall':'Audit wall';notify(audit?'Current 25-card deal revealed':'Wall returned to blind mode')}
function reset(){if(busy)return;cellCounts=new Array(N).fill(0);tickerCounts={};throws=0;ledger=[];rngTotal={calls:0,rejections:0};slots.forEach(function(s){s.classList.remove('faceup');s.querySelector('.pins').innerHTML='';var b=s.querySelector('.back');b.style.setProperty('--heat',0);var c=b.querySelector('.hit-count');c.textContent='';c.classList.remove('on')});dealCards();plaque.innerHTML='<span class="plaque-label">Last draw</span><span class="plaque-name">Wall cleared. Thirty-one tickers are back in the deck.</span>';document.getElementById('stage-verdict').textContent='The experiment is armed.';document.getElementById('stage-sub').textContent='One fair throw is all it takes to begin.';entropyEl.innerHTML='<b>RNG</b> reset · source <span class="v">'+(hasCrypto?'crypto.getRandomValues':'Math.random fallback')+'</span> · unbiased integer selection via rejection sampling';renderAll();notify('Experiment reset')}
function expectedDistinct(){return 31*(1-Math.pow(30/31,throws))}
function tickerChi(){if(!throws)return null;var e=throws/31,sum=0;TICKERS.forEach(function(d){var o=tickerCounts[d.t]||0,dx=o-e;sum+=dx*dx/e});return sum}
function entropyScore(){if(!throws)return null;var s=0;TICKERS.forEach(function(d){var c=tickerCounts[d.t]||0;if(c){var p=c/throws;s-=p*Math.log(p)}});return s/Math.log(31)}
function logGamma(z){var x=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,.001208650973866179,-.000005395239384953];var y=z,tmp=z+5.5;tmp-=(z+.5)*Math.log(tmp);var ser=1.000000000190015;for(var j=0;j<6;j++){y+=1;ser+=x[j]/y}return -tmp+Math.log(2.5066282746310005*ser/z)}
function gammaQ(a,x){if(x<0||a<=0)return NaN;if(x===0)return 1;if(x<a+1){var ap=a,del=1/a,sum=del;for(var n=1;n<=100;n++){ap++;del*=x/ap;sum+=del;if(Math.abs(del)<Math.abs(sum)*3e-7)break}return 1-sum*Math.exp(-x+a*Math.log(x)-logGamma(a))}var b=x+1-a,c=1/1e-30,d=1/b,h=d;for(var i=1;i<=100;i++){var an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-30)d=1e-30;c=b+an/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;var de=d*c;h*=de;if(Math.abs(de-1)<3e-7)break}return Math.exp(-x+a*Math.log(x)-logGamma(a))*h}
function renderKpis(){
  var distinct=Object.keys(tickerCounts).length,repeats=throws-distinct,hit=cellCounts.filter(function(v){return v>0}).length,ent=entropyScore(),chi=tickerChi(),p=throws>=31?gammaQ(15,chi/2):null;
  document.getElementById('k-throws').textContent=throws;document.getElementById('k-distinct').innerHTML=distinct+' <small>/ 31</small>';document.getElementById('k-distinct-note').textContent='expected '+expectedDistinct().toFixed(1);document.getElementById('k-repeat').textContent=(throws?repeats/throws*100:0).toFixed(1)+'%';document.getElementById('k-cells').innerHTML=hit+' <small>/ 25</small>';document.getElementById('k-entropy').textContent=ent===null?'—':ent.toFixed(3);
  var fair=document.getElementById('k-fair'),note=document.getElementById('k-fair-note');fair.className='kpi-value';if(p===null){fair.textContent='—';note.textContent='need 31+ throws'}else{fair.textContent='p '+p.toFixed(3);if(p>=.05){fair.classList.add('ok');note.textContent='consistent with 1/31'}else{fair.classList.add('bad');note.textContent='unusually uneven sample'}}
}
function renderDistribution(){
  var max=1;TICKERS.forEach(function(d){max=Math.max(max,tickerCounts[d.t]||0)});distEl.innerHTML=TICKERS.map(function(d){var c=tickerCounts[d.t]||0,h=c?Math.max(5,c/max*130):3;return '<div class="bar-wrap" title="'+esc(d.t)+': '+c+'"><div class="bar" data-count="'+c+'" style="height:'+h+'px"></div><div class="bar-label">'+esc(d.t)+'</div></div>'}).join('');document.getElementById('dist-meta').textContent=throws?throws+' observations · max '+max:'No observations'
}
function renderRegimes(){
  var names=['Tailwind','Neutral+','Neutral','Cautious','Headwind','Ballast'],base={},obs={};names.forEach(function(n){base[n]=0;obs[n]=0});TICKERS.forEach(function(d){base[d.r]=(base[d.r]||0)+1;obs[d.r]=(obs[d.r]||0)+(tickerCounts[d.t]||0)});regimesEl.innerHTML=names.map(function(n){var share=throws?obs[n]/throws*100:0,baseShare=base[n]/31*100,r=regime(n);return '<div class="regime-row"><div class="regime-name">'+n+'</div><div class="regime-track"><div class="regime-fill" style="--rc:'+r[1]+';width:'+share.toFixed(1)+'%"></div></div><div class="regime-score">'+share.toFixed(0)+'% / '+baseShare.toFixed(0)+'%</div></div>'}).join('')
}
function renderLedger(){
  if(!ledger.length){ledgerBody.innerHTML='<tr><td class="empty" colspan="11">Throw a dart to open the first card.</td></tr>';return}ledgerBody.innerHTML=ledger.slice(0,500).map(function(e){var d=e.d,r=regime(d.r);return '<tr><td class="num">'+e.no+'</td><td class="cell">'+e.cell+'</td><td class="tkr">'+esc(d.t)+'</td><td class="company">'+esc(d.n)+'</td><td>'+esc(d.ty)+'</td><td>'+esc(d.x)+'</td><td>'+esc(d.s)+'</td><td>'+esc(d.c)+'</td><td><span class="chip '+r[0]+'">'+esc(d.r)+'</span></td><td>'+(d.p===2?'●●':'●')+'</td><td>'+esc(d.v==='no'?'unverified':d.v)+'</td></tr>'}).join('')
}
function renderAll(){renderKpis();renderDistribution();renderRegimes();renderLedger()}
function showRng(dealStats,hit){entropyEl.innerHTML='<b>DEAL</b> '+dealStats.calls+' accepted RNG calls · '+dealStats.rejections+' rejection'+(dealStats.rejections===1?'':'s')+' · <b>THROW</b> raw <span class="v">'+hex(hit.raw)+'</span> mod 25 → <span class="v">'+label(hit.idx)+'</span> · rejected <span class="v">'+hit.rejections+'</span> · <b>TOTAL</b> '+rngTotal.calls+' RNG calls / '+rngTotal.rejections+' rejections'}
function csvText(){var head='throw,cell,ticker,company_or_fund,type,exchange,sector,cluster,regime_fit,portfolio_count,verified',q=function(v){v=String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v},rows=ledger.slice().reverse().map(function(e){var d=e.d;return[e.no,e.cell,d.t,d.n,d.ty,d.x,d.s,d.c,d.r,d.p,d.v].map(q).join(',')});return head+'\n'+rows.join('\n')}
function copyCsv(){if(!ledger.length){notify('The ledger is empty');return}var text=csvText(),done=function(){notify('Copied '+ledger.length+' rows to clipboard')};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,function(){fallbackCopy(text,done)});else fallbackCopy(text,done)}
function fallbackCopy(text,done){var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){notify('Clipboard access was blocked')}ta.remove()}
function downloadCsv(){if(!ledger.length){notify('The ledger is empty');return}var blob=new Blob([csvText()],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='blindfolded-monkey-ledger-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);notify('CSV downloaded')}
document.getElementById('throw').addEventListener('click',single);document.getElementById('throw10').addEventListener('click',function(){batch(10)});document.getElementById('throw100').addEventListener('click',function(){batch(100)});document.getElementById('audit').addEventListener('click',toggleAudit);document.getElementById('reset').addEventListener('click',reset);document.getElementById('copy').addEventListener('click',copyCsv);document.getElementById('download').addEventListener('click',downloadCsv);
document.addEventListener('keydown',function(e){if(e.code==='Space'&&!e.repeat&&!/INPUT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)){e.preventDefault();single()}});
dealCards();renderAll();
})();
