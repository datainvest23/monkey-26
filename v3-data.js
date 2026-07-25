(function(global){
'use strict';
var M=global.M26=global.M26||{};
M.meta={name:'Monkey 26 Global 360',version:'G360-2026Q3-v0.1',asOf:'2026-07-25',count:360};
M.sources=[
'data/global360/source-north-america.json','data/global360/source-europe.json',
'data/global360/source-asia-pacific.json','data/global360/source-emerging-markets.json','data/global360/source-etfs.json'
];
M.groups={
us:['United States','North America','US Exchanges','USD'],canada:['Canada','North America','Toronto Stock Exchange','CAD'],
uk:['United Kingdom','Europe','London Stock Exchange','GBP'],germany:['Germany','Europe','Xetra','EUR'],france:['France','Europe','Euronext Paris','EUR'],switzerland:['Switzerland','Europe','SIX Swiss Exchange','CHF'],netherlands:['Netherlands','Europe','Euronext Amsterdam','EUR'],spain:['Spain','Europe','BME Spanish Exchanges','EUR'],italy:['Italy','Europe','Borsa Italiana','EUR'],nordics:['Nordic markets','Europe','Nordic Exchanges','Local'],other_europe:['Other Europe','Europe','European Exchanges','EUR'],
japan:['Japan','Asia-Pacific','Tokyo Stock Exchange','JPY'],australia:['Australia','Asia-Pacific','Australian Securities Exchange','AUD'],korea:['South Korea','Asia-Pacific','Korea Exchange','KRW'],hongkong:['Hong Kong','Asia-Pacific','Hong Kong Stock Exchange','HKD'],singapore:['Singapore','Asia-Pacific','Singapore Exchange','SGD'],newzealand:['New Zealand','Asia-Pacific','New Zealand Exchange','NZD'],israel:['Israel','Asia-Pacific','Israel / US Listings','USD'],
india:['India','Emerging Markets','National Stock Exchange of India','INR'],china:['China','Emerging Markets','Hong Kong Stock Exchange','HKD'],taiwan:['Taiwan','Emerging Markets','Taiwan Stock Exchange','TWD'],brazil:['Brazil','Emerging Markets','B3','BRL'],mexico:['Mexico','Emerging Markets','Bolsa Mexicana de Valores','MXN'],southafrica:['South Africa','Emerging Markets','Johannesburg Stock Exchange','ZAR'],middleeast:['Middle East','Emerging Markets','Regional Exchanges','Local'],
etfs:['Global / US listed','Global ETF','US Exchanges','USD','ETF']
};
M.capOrder=['Mega','Large','Mid','Small','Micro'];
M.capClass={Mega:'mega',Large:'large',Mid:'mid',Small:'small',Micro:'micro'};
M.presets={
global:['Global 360',function(){return true}],stocks:['Stocks only',function(d){return d.assetType==='Stock'}],
'north-america':['North America',function(d){return d.region==='North America'}],europe:['Europe',function(d){return d.region==='Europe'}],
'asia-pacific':['Asia-Pacific',function(d){return d.region==='Asia-Pacific'}],emerging:['Emerging markets',function(d){return d.region==='Emerging Markets'}],
etf:['ETF laboratory',function(d){return d.assetType==='ETF'}],innovation:['Innovation sleeve',function(d){return /(technology|semiconductor|software|cyber|robot|digital|biotech|automation|aerospace)/i.test(d.sector+' '+d.industry+' '+d.name)}]
};
M.parse=function(path,groups){
var out=[];
Object.keys(groups).forEach(function(group){
var meta=M.groups[group];if(!meta)throw new Error('Unknown source group: '+group);
String(groups[group]).split(/\r?\n/).filter(Boolean).forEach(function(line,i){
var f=line.split('|').map(function(v){return v.trim()});if(f.length!==5||f.some(function(v){return !v}))throw new Error(path+' / '+group+' row '+(i+1)+' is malformed');
out.push({id:group.toUpperCase()+':'+f[0],ticker:f[0],name:f[1],sector:f[2],industry:f[3],size:f[4],group:group,country:meta[0],region:meta[1],exchange:meta[2],currency:meta[3],assetType:meta[4]||'Stock',source:path});
});});return out;
};
M.load=async function(){
var parts=await Promise.all(M.sources.map(async function(path){var r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error('Unable to load '+path+' ('+r.status+')');return M.parse(path,await r.json());}));
var rows=[].concat.apply([],parts),seen=new Set();rows.forEach(function(d){if(seen.has(d.id))throw new Error('Duplicate security: '+d.id);seen.add(d.id);});
if(rows.length!==M.meta.count)throw new Error('Expected '+M.meta.count+' securities; found '+rows.length);return rows;
};
M.unique=function(a){return Array.from(new Set(a.filter(Boolean))).sort(function(x,y){return String(x).localeCompare(String(y))});};
M.countBy=function(a,key){return a.reduce(function(o,d){var v=d[key]||'Unclassified';o[v]=(o[v]||0)+1;return o;},{});};
})(window);
