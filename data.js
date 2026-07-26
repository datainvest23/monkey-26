import { data } from './shared-data.js';

data.load = async function() {
  var parts = await Promise.all(data.sources.map(async function(path){
    var r = await fetch(path,{cache:'no-store'});
    if(!r.ok) throw new Error('Unable to load '+path+' ('+r.status+')');
    return data.parse(path, await r.json());
  }));
  var rows = [].concat.apply([], parts), seen = new Set();
  rows.forEach(function(d){
    if(seen.has(d.id)) throw new Error('Duplicate security: '+d.id);
    seen.add(d.id);
  });
  if(rows.length !== data.meta.count) throw new Error('Expected '+data.meta.count+' securities; found '+rows.length);
  return rows;
};

export { data };
