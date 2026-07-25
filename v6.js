(function(){
'use strict';
var link=document.createElement('link');link.rel='stylesheet';link.href='v6.css';document.head.appendChild(link);
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
