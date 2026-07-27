import { data as M } from "./data.js";
import { engine as E } from "./engine.js";

'use strict';
var $=function(id){return document.getElementById(id);};
var all=[],preset='global',busy=false,audit=false;

var grid=$('grid'),plaque=$('plaque'),toast=$('toast'),live=$('live');
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function notify(t){toast.textContent=t;toast.classList.add('show');clearTimeout(notify.t);notify.t=setTimeout(function(){toast.classList.remove('show');},1700);}
function status(t,kind){$('top-status').textContent=t;var n=document.querySelector('.live-state');n.classList.remove('ready','error');if(kind)n.classList.add(kind);}
function option(select,values,label){select.innerHTML='<option value="">'+label+'</option>'+values.map(function(v){return '<option>'+esc(v)+'</option>';}).join('');}
function buildNewspaper(){grid.className='grid newspaper-grid';grid.innerHTML='<div class="paper-stack" aria-hidden="true"></div><div class="newspaper-spread"><section class="paper-page left"><header class="paper-masthead"><span class="paper-brand">THE MARKET LEDGER</span><small>STOCKS & MARKETS</small></header><div class="paper-dateline"><span>Global edition</span><span class="page-number left-page">Page —</span></div><div class="stock-list left-list"></div></section><section class="paper-page right"><header class="paper-masthead compact"><span>MARKET TABLES</span><small>PRICES · SECTORS · FUNDS</small></header><div class="paper-dateline"><span class="edition-count">Full universe</span><span class="page-number right-page">Page —</span></div><div class="stock-list right-list"></div></section></div><div class="edition-index"><span class="edition-status">Edition ready</span><span class="edition-pages">— pages</span></div>';}
function pageRows(rows,start,selectedId){var html='';for(var i=0;i<12;i++){var d=rows[start+i],line=i+1;if(!d){html+='<div class="stock-line blank"><span></span></div>';continue;}var selected=d.id===selectedId;html+='<div class="stock-line'+(selected?' current-pick':'')+'" data-security-id="'+esc(d.id)+'" data-line="'+line+'"><span class="stock-line-no">'+String(line).padStart(2,'0')+'</span><span class="stock-ticker">'+esc(d.ticker)+'</span><span class="stock-name">'+esc(d.name)+'</span><span class="stock-market">'+esc(d.country)+'</span><span class="stock-sector">'+esc(d.sector)+'</span><span class="news-pins"></span></div>';}
return html;}
function paintEdition(result){if(!E.edition.length)return;var page=result?result.spread:1,total=Math.max(1,Math.ceil(E.edition.length/E.pageSize)),start=(page-1)*E.pageSize,rows=E.edition.slice(start,start+E.pageSize),selectedId=result&&result.security.id;grid.classList.add('turning');grid.classList.toggle('page-side-right',!!result&&result.side==='right');grid.classList.toggle('page-side-left',!result||result.side!=='right');grid.querySelector('.left-list').innerHTML=pageRows(rows,0,selectedId);grid.querySelector('.right-list').innerHTML=pageRows(rows,12,selectedId);grid.querySelector('.left-page').textContent='Page '+((page-1)*2+1);grid.querySelector('.right-page').textContent='Page '+((page-1)*2+2);grid.querySelector('.edition-count').textContent=E.active.length+' eligible securities';grid.querySelector('.edition-status').textContent=result?'Selected spread '+page+' of '+total:'Edition shuffled · spread 1 of '+total;grid.querySelector('.edition-pages').textContent=total+' spreads · '+E.pageSize+' listings each';setTimeout(function(){grid.classList.remove('turning');},480);}
function filters(){var base=M.presets[preset][1],r=$('filter-region').value,s=$('filter-sector').value,c=$('filter-cap').value,a=$('filter-asset').value,q=$('filter-search').value.trim().toLowerCase();return all.filter(function(d){if(!base(d)||r&&d.region!==r||s&&d.sector!==s||c&&d.size!==c||a&&d.assetType!==a)return false;if(q&&[d.id,d.ticker,d.name,d.country,d.region,d.sector,d.industry,d.group].join(' ').toLowerCase().indexOf(q)<0)return false;return true;});}
function apply(announce){var rows=filters(),label=M.presets[preset][0];E.setUniverse(rows,label);clearVisual();if(rows.length)paintEdition();renderUniverse();render();if(announce)notify(rows.length+' securities eligible');}
function clearVisual(){grid.classList.remove('audit','turning');var current=grid.querySelectorAll('.current-pick,.has-pin');current.forEach(function(el){el.classList.remove('current-pick','has-pin');});grid.querySelectorAll('.news-pins').forEach(function(el){el.innerHTML='';});}
function renderUniverse(){var n=E.active.length,markets=M.unique(E.active.map(function(d){return d.country;})),sectors=M.unique(E.active.map(function(d){return d.sector;})),assets=M.countBy(E.active,'assetType'),regions=M.countBy(E.active,'region'),largest=Object.keys(regions).sort(function(a,b){return regions[b]-regions[a];})[0]||'—';$('active-count').textContent=n;$('diag-countries').textContent=markets.length;$('diag-sectors').textContent=sectors.length;$('diag-assets').textContent=(assets.Stock||0)+' / '+(assets.ETF||0);$('diag-region').textContent=largest==='—'?'—':largest+' ('+regions[largest]+')';$('diag-odds').textContent=n?'1 in '+n:'—';$('diag-status').textContent=n?'Validated beta':'Insufficient';$('hero-kicker').textContent=n+' securities · full-market newspaper · zero conviction';$('meta-count').textContent=n+' active / '+all.length+' total';$('k-universe').textContent=n||'—';$('k-probability').textContent=n?'1 / '+n+' per security':'probability pending';if(n){$('probability-equation').innerHTML='P(pick) = <strong>1/'+n+'</strong>';$('probability-copy').textContent='One unbiased cryptographic draw gives every eligible security exactly '+(100/n).toFixed(n>200?3:2)+'% per throw.';$('eligibility-warning').hidden=true;$('stage-verdict').textContent='—';$('stage-sub').textContent=M.presets[preset][0]+' · full edition ready.';plaque.innerHTML='<span class="plaque-label">Edition ready</span><span class="plaque-name">'+n+' eligible securities · '+Math.ceil(n/E.pageSize)+' newspaper spreads</span>';}else{$('probability-equation').textContent='P(pick) = unavailable';$('probability-copy').textContent='At least one eligible security is required.';$('eligibility-warning').hidden=false;$('eligibility-warning').textContent='No securities match. Broaden the filters to continue.';$('stage-verdict').textContent='Universe empty.';}window.dispatchEvent(new window.CustomEvent('m26:universe',{detail:{count:n,label:M.presets[preset][0]}}));sync();}
function sync(){var ok=E.active.length>0;['throw','throw10','throw100','throw1000','audit'].forEach(function(id){$(id).disabled=busy||!ok;});$('copy').disabled=busy||!E.ledger.length;$('download').disabled=busy||!E.ledger.length;$('reset').disabled=busy||!all.length;}
function comparison(el,field,order,limit){var base=M.countBy(E.active,field),obs={};E.ledger.forEach(function(r){var v=r.security[field];obs[v]=(obs[v]||0)+1;});var names=order||M.unique(Object.keys(base).concat(Object.keys(obs)));names=names.filter(function(n){return base[n]||obs[n];}).sort(function(a,b){return (obs[b]||0)-(obs[a]||0)||(base[b]||0)-(base[a]||0);});if(limit)names=names.slice(0,limit);el.innerHTML=names.map(function(n){var bp=E.active.length?(base[n]||0)/E.active.length*100:0,op=E.throws?(obs[n]||0)/E.throws*100:0;return '<div class="compare-row"><div class="compare-head"><span>'+esc(n)+'</span><span>'+(E.throws?op.toFixed(1)+'%':'—')+' / '+bp.toFixed(1)+'%</span></div><div class="compare-track"><div class="compare-base" style="width:'+bp+'%"></div><div class="compare-observed" style="width:'+op+'%"></div></div></div>';}).join('');}
function render(){var n=E.active.length,distinct=Object.keys(E.counts).length,ent=E.entropy(),p=E.pValue();$('k-throws').textContent=E.throws.toLocaleString('en-US');$('k-distinct').innerHTML=distinct+' <small>/ '+n+'</small>';$('k-distinct-note').textContent='expected '+E.expectedDistinct().toFixed(1);$('k-repeat').textContent=(E.throws?(E.throws-distinct)/E.throws*100:0).toFixed(1)+'%';$('k-entropy').textContent=ent==null?'—':ent.toFixed(3);var fair=$('k-fair'),note=$('k-fair-note');fair.className='kpi-value';if(p==null){fair.textContent='—';note.textContent=n?'exploratory after '+n+' throws':'awaiting universe';}else{if(E.throws<5*n){fair.textContent='provisional';fair.classList.add('warn');note.textContent='needs '+(5*n).toLocaleString('en-US')+' throws';}else{fair.textContent='p '+p.toFixed(3);if(p>=.05){fair.classList.add('ok');note.textContent='consistent with equal 1/'+n;}else{fair.classList.add('bad');note.textContent='unusually uneven sample';}}}
var ranked=Object.keys(E.counts).map(function(id){return {d:E.active.find(function(x){return x.id===id;}),c:E.counts[id]};}).filter(function(x){return x.d;}).sort(function(a,b){return b.c-a.c;}).slice(0,12);$('distribution').innerHTML=ranked.length?ranked.map(function(x){return '<div class="rank-row"><div class="rank-name">'+esc(x.d.ticker)+'</div><div class="rank-track"><div class="rank-fill" style="width:'+(x.c/ranked[0].c*100)+'%"></div></div><div class="rank-value">'+x.c+'</div></div>';}).join(''):'<div class="empty-chart">No selections yet.<br>Throw the first dart.</div>';$('dist-meta').textContent=E.throws?E.throws.toLocaleString('en-US')+' observations · top 12':'No observations';comparison($('regions-chart'),'region',null,8);comparison($('sectors-chart'),'sector',null,10);comparison($('caps-chart'),'size',M.capOrder);comparison($('assets-chart'),'assetType',['Stock','ETF']);
  var portList = $('portfolio-list');
  if (E.throws > 0) {
    var picks = E.ledger.slice(0, 25).map(function(r) { return r.security; });
    portList.innerHTML = picks.map(function(d) {
      return '<div class="compare-row"><div class="compare-head"><span>' + esc(d.ticker) + ' (' + esc(d.name) + ')</span><span>' + esc(d.returnPct) + '</span></div></div>';
    }).join('');
  } else {
    portList.innerHTML = 'No picks yet. Throw some darts.';
  }

renderLedger();sync();}
function renderLedger(){var b=$('ledger');if(!E.ledger.length){b.innerHTML='<tr><td class="empty" colspan="12">Throw a dart to mark the first newspaper listing.</td></tr>';return;}b.innerHTML=E.ledger.slice(-500).reverse().map(function(r){var d=r.security,cl=M.capClass[d.size]||'large';return '<tr><td>'+r.no+'</td><td>'+r.page+' / '+r.line+'</td><td class="ticker-cell">'+esc(d.ticker)+'</td><td class="company-cell">'+esc(d.name)+'</td><td>'+esc(d.country)+'</td><td>'+esc(d.region)+'</td><td>'+esc(d.sector)+'</td><td>'+esc(d.industry)+'</td><td><span class="chip '+cl+'">'+esc(d.size)+'</span></td><td>'+esc(d.assetType)+'</td><td>'+esc(d.exchange)+'</td><td>'+esc(d.group)+'</td></tr>';}).join('');}
function showResult(r){paintEdition(r);var p=M.capClass[r.security.size]||'large';plaque.innerHTML='<span class="plaque-label">Page '+r.page+' · line '+r.line+'</span><span class="plaque-ticker">'+esc(r.security.ticker)+'</span><span class="plaque-name">'+esc(r.security.name+' · '+r.security.country+' · '+r.security.sector)+'</span><span class="chip '+p+'">'+r.security.size+'</span>';$('stage-verdict').textContent=r.security.ticker;$('stage-sub').textContent=r.security.name+' · '+r.security.country+' · '+r.security.size;var cryptoWarn = r.rng.crypto ? '' : ' <strong style="color:#e15242;">WARNING: Math.random() Fallback</strong>';$('entropy').innerHTML='<b>DIRECT DRAW</b> '+E.active.length+' eligible securities · raw <span class="v">'+(r.rng.raw<0?'n/a':'0x'+r.rng.raw.toString(16).toUpperCase().padStart(8,'0'))+'</span> → index <span class="v">'+r.selectionIndex+'</span> · <b>EDITION</b> page <span class="v">'+r.page+'</span>, line <span class="v">'+r.line+'</span> · cumulative RNG calls <span class="v">'+E.rng.calls.toLocaleString('en-US')+'</span>' + cryptoWarn;render();live.textContent='Picked '+r.security.ticker+', '+r.security.name+', page '+r.page+', line '+r.line;window.dispatchEvent(new window.CustomEvent('m26:result',{detail:r}));}
async function run(n) {
  if(busy)return;
  busy=true;
  sync();
  status('Simulation running');
  try {
    let r;
    if (n === 1) {
      document.getElementById('monkey').classList.add('winding');
      await new Promise(x => setTimeout(x, 260));
      document.getElementById('monkey').classList.remove('winding');
      r = E.throw();
      showResult(r);
      await new Promise(x => setTimeout(x, 720));
    } else {
      // Chunk batch runs using requestAnimationFrame
      const chunkSize = Math.max(100, Math.floor(n / 10)); // target ~10 chunks
      let done = 0;

      const processChunk = () => new Promise(resolve => {
        const doChunk = () => {
          let batchSize = Math.min(chunkSize, n - done);
          r = E.batch(batchSize);
          done += batchSize;

          if (done < n) {
            // Give progress feedback visually without heavy DOM updates
            document.getElementById('k-throws').textContent = (E.throws - n + done).toLocaleString('en-US') + '...';
            requestAnimationFrame(doChunk);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(doChunk);
      });

      await processChunk();
      showResult(r);
      notify(n.toLocaleString('en-US') + ' fair throws completed');
    }
  } catch(e) {
    notify(e.message);
  } finally {
    busy = false;
    status('Global 360 validated', 'ready');
    sync();
  }
}
function download(){var blob=new Blob([E.csv()],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='monkey26-ledger-'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(u);}
function bind(){document.querySelectorAll('.preset').forEach(function(b){b.onclick=function(){preset=b.dataset.preset;document.querySelectorAll('.preset').forEach(function(x){x.classList.toggle('active',x===b);});['filter-region','filter-sector','filter-cap','filter-asset','filter-search'].forEach(function(id){$(id).value='';});apply(true);};});['filter-region','filter-sector','filter-cap','filter-asset'].forEach(function(id){$(id).onchange=function(){apply(true);};});var t;$('filter-search').oninput=function(){clearTimeout(t);t=setTimeout(function(){apply(false);},180);};$('clear-filters').onclick=function(){['filter-region','filter-sector','filter-cap','filter-asset','filter-search'].forEach(function(id){$(id).value='';});apply(true);};$('throw').onclick=function(){run(1);};$('throw10').onclick=function(){run(10);};$('throw100').onclick=function(){run(100);};$('throw1000').onclick=function(){run(1000);};$('audit').onclick=function(){audit=!audit;grid.classList.toggle('audit',audit);$('audit').textContent=audit?'Close audit':'Audit edition';};$('reset').onclick=function(){E.reset();clearVisual();if(E.active.length){E.newEdition();paintEdition();}render();window.dispatchEvent(new window.CustomEvent('m26:universe',{detail:{count:E.active.length,label:E.label}}));notify('Experiment reset');};$('copy').onclick=function(){navigator.clipboard?navigator.clipboard.writeText(E.csv()).then(function(){notify('Ledger copied');}):notify('Clipboard unavailable');};$('download').onclick=download;document.addEventListener('keydown',function(e){if(e.code==='Space'&&!e.repeat&&!/INPUT|SELECT|BUTTON/.test(document.activeElement.tagName)){e.preventDefault();run(1);}});}
async function init(){buildNewspaper();bind();status('Loading Global 360');try{all=await M.load();option($('filter-region'),M.unique(all.map(function(d){return d.region;})),'All regions');option($('filter-sector'),M.unique(all.map(function(d){return d.sector;})),'All sectors');option($('filter-cap'),M.capOrder,'All size bands');option($('filter-asset'),M.unique(all.map(function(d){return d.assetType;})),'All instruments');$('meta-version').textContent=M.meta.version;$('meta-date').textContent='Snapshot 25 Jul 2026';$('footer-data').textContent=M.meta.name+' · '+M.meta.version;apply(false);status('Global 360 validated','ready');notify('Global 360 universe loaded');}catch(e){status('Universe load failed','error');$('eligibility-warning').hidden=false;$('eligibility-warning').textContent=e.message;console.error(e);}}
init();


// v6.js layout adjustments
(function(){
  var hero=document.querySelector('.hero');
  var consoleSection=document.querySelector('.universe-console');
  var stage=document.querySelector('.stage-shell');
  if(!hero||!consoleSection||!stage)return;

  hero.classList.add('hero-full');
  consoleSection.classList.add('console-full');
  consoleSection.id='experiment-design';
  stage.id='live-range';

  var meta=hero.querySelector('.hero-meta');
  if(meta&&!hero.querySelector('.hero-actions')){
    var actions=document.createElement('div');
    actions.className='hero-actions';
    actions.innerHTML='<a class="hero-action primary" href="#experiment-design">Design the experiment <span class="arrow">↓</span></a><a class="hero-action" href="#live-range">Open the live range <span class="arrow">→</span></a>';
    meta.insertAdjacentElement('afterend',actions);
  }
  if(!hero.querySelector('.hero-scroll-cue')){
    var cue=document.createElement('a');
    cue.className='hero-scroll-cue';
    cue.href='#experiment-design';
    cue.textContent='Build the investable universe';
    hero.appendChild(cue);
  }

  var headCopy=consoleSection.querySelector('.console-head>div:first-child');
  if(headCopy&&!headCopy.querySelector('.console-copy')){
    var copy=document.createElement('p');
    copy.className='console-copy';
    copy.textContent='Start with a curated preset, then refine the eligible securities by geography, sector, size, instrument type or company. Every change recalculates the universe and single-pick odds instantly.';
    headCopy.appendChild(copy);
  }

  var presets=consoleSection.querySelector('.presets');
  var presetCopy={
    'global':['Global 360','Full curated cross-market universe'],
    'stocks':['Stocks only','Exclude all exchange-traded funds'],
    'north-america':['North America','United States and Canada'],
    'europe':['Europe','Major European markets and sectors'],
    'asia-pacific':['Asia-Pacific','Japan and developed Asia-Pacific'],
    'emerging':['Emerging markets','India, Brazil and other growth markets'],
    'etf':['ETF laboratory','Broad, sector and thematic funds'],
    'innovation':['Innovation sleeve','Technology, artificial intelligence and frontier themes']
  };
  if(presets&&!presets.previousElementSibling?.classList.contains('console-step')){
    var stepOne=document.createElement('div');
    stepOne.className='console-step';
    stepOne.innerHTML='<b>1</b><span>Choose a starting universe</span>';
    presets.parentNode.insertBefore(stepOne,presets);
  }
  if(presets){
    presets.querySelectorAll('.preset').forEach(function(button){
      var item=presetCopy[button.dataset.preset];
      if(item)button.innerHTML='<b>'+item[0]+'</b><small>'+item[1]+'</small>';
    });
  }

  var filters=consoleSection.querySelector('.filters');
  if(filters&&!filters.parentElement.classList.contains('filter-zone')){
    var stepTwo=document.createElement('div');
    stepTwo.className='console-step';
    stepTwo.innerHTML='<b>2</b><span>Refine the eligible securities</span>';
    filters.parentNode.insertBefore(stepTwo,filters);

    var zone=document.createElement('div');
    zone.className='filter-zone';
    var zoneHead=document.createElement('div');
    zoneHead.className='filter-zone-head';
    zoneHead.innerHTML='<div><h3>Build a focused universe.</h3><p>Combine filters freely. Results update live, and the experiment remains disabled until at least 25 securities are eligible.</p></div><span class="filter-live-note">Live universe update</span>';
    filters.parentNode.insertBefore(zone,filters);
    zone.appendChild(zoneHead);
    zone.appendChild(filters);
  }

  var warning=document.getElementById('eligibility-warning');
  if(!consoleSection.querySelector('.console-actions')){
    var consoleActions=document.createElement('div');
    consoleActions.className='console-actions';
    consoleActions.innerHTML='<div class="console-actions-copy">Your filters are already reflected in the diagnostics above. Confirm the active universe to continue directly to the live range.</div><button class="apply-universe" id="apply-universe" type="button">Use this universe</button>';
    (warning||consoleSection.lastElementChild).insertAdjacentElement('afterend',consoleActions);
  }

  var applyButton=document.getElementById('apply-universe');
  var activeCount=document.getElementById('active-count');
  function updateApply(){
    var count=parseInt((activeCount&&activeCount.textContent)||'0',10)||0;
    applyButton.disabled=count<25;
    applyButton.textContent=count>=25?'Use '+count.toLocaleString('en-US')+' securities →':'At least 25 securities required';
  }
  updateApply();
  if(activeCount)new MutationObserver(updateApply).observe(activeCount,{childList:true,characterData:true,subtree:true});
  applyButton.addEventListener('click',function(){
    if(applyButton.disabled)return;
    stage.scrollIntoView({behavior:'smooth',block:'start'});
    window.setTimeout(function(){var primary=document.getElementById('throw');if(primary)primary.focus({preventScroll:true});},650);
  });

  [...document.querySelectorAll('a[href^="#"]')].forEach(function(anchor){
    anchor.addEventListener('click',function(event){
      var target=document.querySelector(anchor.getAttribute('href'));
      if(!target)return;
      event.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
})();

// v7.js logic
(function(){
  var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function prepareTitle(){
    var title=document.querySelector('.hero h1');
    if(!title||title.classList.contains('hero-title-reveal'))return;
    title.classList.add('hero-title-reveal');
    title.setAttribute('aria-label','Any monkey can beat the market');
    title.innerHTML='<span class="title-line"><span class="title-word" style="--word-index:0">Any</span> <em class="title-word" style="--word-index:1">Monkey</em></span><span class="title-line"><span class="title-word" style="--word-index:2">Can</span> <span class="title-word" style="--word-index:3">Beat</span> <span class="title-word" style="--word-index:4">The</span> <span class="title-word" style="--word-index:5">Market</span><span class="title-caret" aria-hidden="true"></span></span>';
    var hero=document.querySelector('.hero');
    if(!hero)return;
    var copy=hero.querySelector('.hero-copy');
    if(copy)copy.innerHTML='A global random-pick <a class="malkiel-link" href="https://www.forbes.com/sites/rickferri/2012/12/20/any-monkey-can-beat-the-market/" target="_blank" rel="noopener noreferrer">experiment inspired by Burton Malkiel</a>. Choose the investable universe, reshuffle the financial newspaper before every throw, and test what unbiased selection actually looks like across markets, sectors and company sizes.';
    ['.kicker','.hero-copy','.hero-meta','.hero-actions','.fairness-card'].forEach(function(selector){
      var element=hero.querySelector(selector);
      if(element)element.classList.add('hero-intro-item');
    });
  }

  function labelScene(element,id,label){
    if(!element)return null;
    element.id=element.id||id;
    element.classList.add('scroll-scene');
    element.dataset.sceneLabel=label;
    return element;
  }

  function prepareScenes(){
    var hero=labelScene(document.querySelector('.hero'),'top','Introduction');
    var design=labelScene(document.querySelector('.universe-console'),'experiment-design','Universe builder');
    var stage=labelScene(document.querySelector('.stage-shell'),'live-range','Market pages');
    var regularSections=[].slice.call(document.querySelectorAll('main > section.section:not(.methodology)'));
    var results=labelScene(regularSections[0],'experiment-results','Results');
    var ledger=labelScene(document.querySelector('.ledger-panel'),'draw-ledger','Draw ledger');
    var method=labelScene(document.querySelector('.methodology'),'methodology','Method');
    var scenes=[hero,design,stage,results,ledger,method].filter(Boolean);

    [hero,design].forEach(function(scene){
      if(scene&&!scene.querySelector(':scope > .scene-transition')){
        var marker=document.createElement('span');
        marker.className='scene-transition';
        marker.setAttribute('aria-hidden','true');
        marker.textContent='↓';
        scene.appendChild(marker);
      }
    });

    var rail=document.createElement('nav');
    rail.className='scene-rail';
    rail.setAttribute('aria-label','Page sections');
    var dots=[];
    scenes.forEach(function(scene){
      var button=document.createElement('button');
      button.className='scene-dot';
      button.type='button';
      button.setAttribute('aria-label',scene.dataset.sceneLabel);
      button.addEventListener('click',function(){scene.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});});
      rail.appendChild(button);
      dots.push(button);
    });
    document.body.appendChild(rail);

    if(!('IntersectionObserver' in window)){
      scenes.forEach(function(scene){scene.classList.add('is-scene-visible');});
      if(dots[0])dots[0].classList.add('active');
      return;
    }

    var visibilityObserver=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting)entry.target.classList.add('is-scene-visible');
      });
    },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    scenes.forEach(function(scene){visibilityObserver.observe(scene);});

    var ratios=new Map();
    var activeObserver=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ratios.set(entry.target,entry.intersectionRatio);});
      var activeIndex=0,max=-1;
      scenes.forEach(function(scene,index){var ratio=ratios.get(scene)||0;if(ratio>max){max=ratio;activeIndex=index;}});
      dots.forEach(function(dot,index){
        dot.classList.toggle('active',index===activeIndex);
        if(index<=activeIndex)dot.classList.add('visited');
      });
    },{threshold:[0,.1,.2,.35,.5,.7,.9],rootMargin:'-12% 0px -18% 0px'});
    scenes.forEach(function(scene){activeObserver.observe(scene);});

    requestAnimationFrame(function(){document.documentElement.classList.add('motion-ready');hero&&hero.classList.add('is-scene-visible');});
  }

  function addKeyboardNavigation(){
    document.addEventListener('keydown',function(event){
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      if(/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement&&document.activeElement.tagName))return;
      if(event.key!=='PageDown'&&event.key!=='PageUp')return;
      var scenes=[].slice.call(document.querySelectorAll('.scroll-scene'));
      if(!scenes.length)return;
      var viewportCenter=window.scrollY+window.innerHeight*.45,current=0,distance=Infinity;
      scenes.forEach(function(scene,index){var d=Math.abs(scene.offsetTop-viewportCenter);if(d<distance){distance=d;current=index;}});
      var next=Math.max(0,Math.min(scenes.length-1,current+(event.key==='PageDown'?1:-1)));
      if(next===current)return;
      event.preventDefault();
      scenes[next].scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
    });
  }

  prepareTitle();
  prepareScenes();
  addKeyboardNavigation();
})();

// v8 logic
(function(){
  var stage=document.querySelector('.stage-shell'),grid=document.getElementById('grid');
  if(stage){
    stage.setAttribute('aria-label','Blindfolded monkey selecting a security from the stocks section of a financial newspaper');
    var title=stage.querySelector('.stage-title'),hint=stage.querySelector('.stage-hint');
    if(title)title.textContent='Live pressroom / stocks & markets edition';
    if(hint)hint.textContent='Press space to throw · every eligible listing can be hit';
  }
  var heroActions=document.querySelectorAll('.hero-action');
  heroActions.forEach(function(action){if(action.getAttribute('href')==='#live-range')action.innerHTML='Open the market pages <span class="arrow">→</span>';});
  var auditList=document.querySelector('.audit-list');
  if(auditList)auditList.innerHTML='<li>Direct unbiased draw from the full active universe</li><li>Newspaper edition shuffled whenever the active universe changes</li><li>Every outcome retained in an exportable ledger</li>';
  var fairnessLabel=document.querySelector('.fairness-label');if(fairnessLabel)fairnessLabel.textContent='Direct selection proof';
  var consoleCopy=document.querySelector('.console-copy');
  if(consoleCopy)consoleCopy.textContent='Start with a curated preset, then refine the eligible listings by geography, sector, size, instrument type or company. Every change recalculates the full newspaper edition and exact single-pick odds instantly.';
  var zoneCopy=document.querySelector('.filter-zone-head p');
  if(zoneCopy)zoneCopy.textContent='Combine filters freely. Results update live, and every remaining security is eligible for the next direct cryptographic draw.';
  var consoleActionsCopy=document.querySelector('.console-actions-copy');
  if(consoleActionsCopy)consoleActionsCopy.textContent='Your filters already define the full Stocks & Markets edition. Confirm the active universe to continue to the pressroom.';
  var apply=document.getElementById('apply-universe'),active=document.getElementById('active-count');
  function updateApply(){if(!apply)return;var count=parseInt((active&&active.textContent)||'0',10)||0;apply.disabled=count<1;apply.textContent=count?'Use '+count.toLocaleString('en-US')+' listings →':'At least one security required';}
  updateApply();if(active)new MutationObserver(updateApply).observe(active,{childList:true,characterData:true,subtree:true});
  function setControl(id,label,copy){var button=document.getElementById(id);if(!button)return;var b=button.querySelector('.control-copy b'),small=button.querySelector('.control-copy small');if(b)b.textContent=label;if(small)small.textContent=copy;}
  setControl('throw','Draw + throw','Pick from the full edition');
  setControl('throw10','Run 10','10 direct market draws');
  setControl('throw100','Run 100','100 direct market draws');
  setControl('throw1000','Run 1,000','1,000 direct market draws');
  setControl('audit','Audit edition','Show page and line data');
  var command=document.querySelector('.command-note');if(command)command.innerHTML='Direct selection uses <code>crypto.getRandomValues</code> with rejection sampling · Newspaper pagination is visual only · Changing the active universe starts a fresh edition';
  var ledgerHead=document.querySelector('#ledger-title');if(ledgerHead)ledgerHead.textContent='Selection ledger';
  var headers=document.querySelectorAll('.ledger-panel thead th');if(headers[1])headers[1].textContent='Page / line';
  var method=document.querySelector('.methodology');
  if(method){
    var title=method.querySelector('h2');if(title)title.textContent='One fair draw across the full newspaper.';
    var cards=method.querySelectorAll('.method-card');
    var content=[
      ['01 / DEFINE','Set the eligible universe','Presets and filters create a transparent list of eligible securities. Every remaining listing participates in the next draw.'],
      ['02 / DRAW','Select directly from all N','Rejection sampling generates one unbiased integer from the complete active universe. No 25-card intermediate layer is required.'],
      ['03 / PRINT','Shuffle the market edition','A fresh Fisher–Yates shuffle lays every eligible security across the pages of a new Stocks & Markets edition.'],
      ['04 / MARK','Hit the selected listing','The page turns to the selected spread, the dart marks its newspaper line, and the outcome enters the permanent ledger.']
    ];
    cards.forEach(function(card,index){var c=content[index];if(!c)return;var no=card.querySelector('.method-no'),h=card.querySelector('h3'),p=card.querySelector('p');if(no)no.textContent=c[0];if(h)h.textContent=c[1];if(p)p.textContent=c[2];});
    var foot=method.querySelector('.footnote');if(foot)foot.innerHTML='<strong>Statistical interpretation.</strong> Every eligible security has probability 1/N on each throw. The newspaper pagination is a visual representation created after the direct selection and cannot change the result. The chi-square approximation becomes more informative as the sample grows. This is an educational experiment, not investment advice.';
  }
  if(grid)grid.setAttribute('aria-label','Current financial newspaper spread containing the selected stock listing');
})();

// v9 logic
(function(){
  var hero=document.querySelector('.hero');
  if(!hero)return;
  var fairness=hero.querySelector('.fairness-card');
  if(fairness)fairness.setAttribute('aria-hidden','true');
  var actions=hero.querySelector('.hero-actions');
  var meta=hero.querySelector('.hero-meta');
  if(!hero.querySelector('.hero-proof-strip')){
    var strip=document.createElement('div');
    strip.className='hero-proof-strip';
    strip.setAttribute('aria-label','Fairness and audit summary');
    strip.innerHTML='<div class="hero-proof-item primary"><span>Equal single-pick odds</span><strong id="hero-inline-odds">1 in —</strong><small id="hero-inline-percent">Waiting for the active universe</small></div><div class="hero-proof-item"><span>Selection</span><strong>Direct cryptographic draw</strong></div><div class="hero-proof-item"><span>Publication</span><strong>Shuffled market edition</strong></div><div class="hero-proof-item"><span>Audit trail</span><strong>Every outcome exportable</strong></div>';
    (actions||meta||hero.querySelector('.hero-main')).insertAdjacentElement('afterend',strip);
  }
  var count=document.getElementById('active-count');
  var odds=document.getElementById('hero-inline-odds');
  var percent=document.getElementById('hero-inline-percent');
  function updateProof(){
    var n=parseInt((count&&count.textContent)||'0',10)||0;
    odds.textContent=n?'1 in '+n:'Unavailable';
    percent.textContent=n?'Each eligible security receives '+(100/n).toFixed(n>200?3:2)+'% per throw':'Choose at least one eligible security';
  }
  updateProof();
  if(count)new MutationObserver(updateProof).observe(count,{childList:true,characterData:true,subtree:true});
})();
