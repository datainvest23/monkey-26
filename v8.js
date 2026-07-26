(function(){
'use strict';
var style=document.createElement('link');style.rel='stylesheet';style.href='v8.css';document.head.appendChild(style);
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
if(auditList)auditList.innerHTML='<li>Direct unbiased draw from the full active universe</li><li>Freshly shuffled newspaper edition for every throw</li><li>Every outcome retained in an exportable ledger</li>';
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
