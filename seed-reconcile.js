'use strict';
const {marketName,marketCode}=require('./market-catalog');
const MIGRATION='website-catalog-seed-v3';
function reconcileSeed(store,seed){
 if(!Array.isArray(seed?.websites))throw Error('Seed websites invalid');
 if(!Array.isArray(store?.websites))throw Error('Store websites invalid');
 if(store.seedMigrations?.includes(MIGRATION))return {changed:false,websitesAdded:0,marketsAdded:0};
 const archived=new Set((store.archivedWebsites||[]).map(w=>String(w.name||'').trim().toUpperCase()));
 const byName=new Map(store.websites.map(w=>[String(w.name||'').trim().toUpperCase(),w]));
 let websitesAdded=0,marketsAdded=0;
 for(const template of seed.websites){
  const name=String(template.name||'').trim().toUpperCase();
  if(!name||archived.has(name))continue;
  const found=byName.get(name);
  if(!found){
   if(store.websites.some(w=>w.id===template.id))throw Error('Seed ID collision: '+name);
   const fresh={...template,markets:(template.markets||[]).map(m=>({...m}))};
   store.websites.push(fresh);byName.set(name,fresh);websitesAdded++;marketsAdded+=fresh.markets.length;
   continue;
  }
  if(!Array.isArray(found.markets))found.markets=[];
  const blocked=new Set(found.deletedMarketKeys||[]);
  const names=new Set(found.markets.map(m=>marketName(m.name)));
  const codes=new Set(found.markets.map(m=>marketCode(m.id||m.code)));
  for(const m of template.markets||[]){
   const n=marketName(m.name),c=marketCode(m.id||m.code);
   if(blocked.has(n)||blocked.has(c)||names.has(n)||codes.has(c))continue;
   found.markets.push({...m,catalogSource:'seed'});names.add(n);codes.add(c);marketsAdded++;
  }
 }
 store.seedMigrations=[...(store.seedMigrations||[]),MIGRATION];
 return {changed:true,websitesAdded,marketsAdded};
}
module.exports={reconcileSeed,MIGRATION};
