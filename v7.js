(function(){
'use strict';
var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var style=document.createElement('link');style.rel='stylesheet';style.href='v7.css';document.head.appendChild(style);

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
