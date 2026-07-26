(function(){
'use strict';
var style=document.createElement('link');style.rel='stylesheet';style.href='v9.css';document.head.appendChild(style);
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
  strip.innerHTML='<div class="hero-proof-item primary"><span>Equal single-pick odds</span><strong id="hero-inline-odds">1 in —</strong><small id="hero-inline-percent">Waiting for the active universe</small></div><div class="hero-proof-item"><span>Selection</span><strong>Direct cryptographic draw</strong></div><div class="hero-proof-item"><span>Publication</span><strong>Freshly shuffled market edition</strong></div><div class="hero-proof-item"><span>Audit trail</span><strong>Every outcome exportable</strong></div>';
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
