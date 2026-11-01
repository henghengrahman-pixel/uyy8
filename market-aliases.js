'use strict';
// POOL/POOLS are aliases only when they occur as a final, separate word.
function canonicalMarketName(value){
 return String(value||'').trim().replace(/\s+/g,' ').toUpperCase().replace(/\s+POOLS?$/,'').trim();
}
function globalMarketNames(websites){
 return [...new Set((websites||[]).flatMap(w=>(w.markets||[]).map(m=>canonicalMarketName(m.name)).filter(Boolean)))].sort();
}
function resolveWebsiteMarket(website, marketName){
 const key=canonicalMarketName(marketName);
 if(!key)return {status:'NOT_FOUND'};
 const matches=(website?.markets||[]).filter(m=>canonicalMarketName(m.name)===key);
 if(!matches.length)return {status:'NOT_FOUND'};
 const ids=new Set(matches.map(m=>String(m.id||m.code||'')));
 if(ids.size!==1 || ids.has(''))return {status:'AMBIGUOUS',matches};
 return {status:'FOUND',market:matches[0]};
}
module.exports={canonicalMarketName,globalMarketNames,resolveWebsiteMarket};
