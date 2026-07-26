/**
 * Shared data parser for both the browser and the validator.
 */
export const data = {
  meta: {name:'Monkey 26 Global 360',version:'G360-2026Q3-v0.1',asOf:'2026-07-25',count:360},
  sources: [
    'data/global360/source-north-america.json','data/global360/source-europe.json',
    'data/global360/source-asia-pacific.json','data/global360/source-emerging-markets.json','data/global360/source-etfs.json'
  ],
  groups: {
    us:['United States','North America','US Exchanges','USD'],canada:['Canada','North America','Toronto Stock Exchange','CAD'],
    uk:['United Kingdom','Europe','London Stock Exchange','GBP'],germany:['Germany','Europe','Xetra','EUR'],france:['France','Europe','Euronext Paris','EUR'],switzerland:['Switzerland','Europe','SIX Swiss Exchange','CHF'],netherlands:['Netherlands','Europe','Euronext Amsterdam','EUR'],spain:['Spain','Europe','BME Spanish Exchanges','EUR'],italy:['Italy','Europe','Borsa Italiana','EUR'],nordics:['Nordic markets','Europe','Nordic Exchanges','Local'],other_europe:['Other Europe','Europe','European Exchanges','EUR'],
    japan:['Japan','Asia-Pacific','Tokyo Stock Exchange','JPY'],australia:['Australia','Asia-Pacific','Australian Securities Exchange','AUD'],korea:['South Korea','Asia-Pacific','Korea Exchange','KRW'],hongkong:['Hong Kong','Asia-Pacific','Hong Kong Stock Exchange','HKD'],singapore:['Singapore','Asia-Pacific','Singapore Exchange','SGD'],newzealand:['New Zealand','Asia-Pacific','New Zealand Exchange','NZD'],israel:['Israel','Asia-Pacific','Israel / US Listings','USD'],
    india:['India','Emerging Markets','National Stock Exchange of India','INR'],china:['China','Emerging Markets','Hong Kong Stock Exchange','HKD'],taiwan:['Taiwan','Emerging Markets','Taiwan Stock Exchange','TWD'],brazil:['Brazil','Emerging Markets','B3','BRL'],mexico:['Mexico','Emerging Markets','Bolsa Mexicana de Valores','MXN'],southafrica:['South Africa','Emerging Markets','Johannesburg Stock Exchange','ZAR'],middleeast:['Middle East','Emerging Markets','Regional Exchanges','Local'],
    etfs:['Global / US listed','Global ETF','US Exchanges','USD','ETF']
  },
  capOrder: ['Mega','Large','Mid','Small','Micro'],
  capClass: {Mega:'mega',Large:'large',Mid:'mid',Small:'small',Micro:'micro'},
  presets: {
    global:['Global 360',function(){return true}],stocks:['Stocks only',function(d){return d.assetType==='Stock'}],
    'north-america':['North America',function(d){return d.region==='North America'}],europe:['Europe',function(d){return d.region==='Europe'}],
    'asia-pacific':['Asia-Pacific',function(d){return d.region==='Asia-Pacific'}],emerging:['Emerging markets',function(d){return d.region==='Emerging Markets'}],
    etf:['ETF laboratory',function(d){return d.assetType==='ETF'}],innovation:['Innovation sleeve',function(d){return /(technology|semiconductor|software|cyber|robot|digital|biotech|automation|aerospace)/i.test(d.sector+' '+d.industry+' '+d.name)}]
  },
  parse(path, groups) {
    let out = [];
    for (const group of Object.keys(groups)) {
      const meta = data.groups[group];
      if (!meta) throw new Error('Unknown source group: ' + group);

      const records = groups[group];
      if (!Array.isArray(records)) throw new Error(path + ' / ' + group + ' is not an array of records');

      for (const [i, record] of records.entries()) {
        if (!record.ticker || !record.name || !record.sector || !record.industry || !record.size_band) {
          throw new Error(path + ' / ' + group + ' row ' + (i + 1) + ' is missing fields');
        }

        out.push({
          id: group.toUpperCase() + ':' + record.ticker,
          ticker: record.ticker,
          name: record.name,
          sector: record.sector,
          industry: record.industry,
          size: record.size_band,
          price: 'Needs verification',
          returnPct: 'Needs verification',
          group: group,
          country: meta[0],
          region: meta[1],
          exchange: meta[2],
          currency: meta[3],
          assetType: meta[4] || 'Stock',
          source: path
        });
      }
    }
    return out;
  },
  unique(a) {
    return Array.from(new Set(a.filter(Boolean))).sort(function(x,y){return String(x).localeCompare(String(y))});
  },
  countBy(a, key) {
    return a.reduce(function(o,d){
      var v=d[key]||'Unclassified';
      o[v]=(o[v]||0)+1;
      return o;
    },{});
  }
};
