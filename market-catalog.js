'use strict';
const marketName=name=>'name:'+String(name||'').trim().replace(/\s+/g,' ').toUpperCase();
const marketCode=code=>'code:'+String(code||'').trim();
function mergeAgentCatalog(existing, incoming, tombstones, stamp){
 const next=(existing||[]).map(x=>({...x}));
 const blocked=new Set(tombstones||[]);
 for(const remote of incoming||[]){
  const name=marketName(remote.name),code=marketCode(remote.id||remote.code);
  if(blocked.has(name)||blocked.has(code))continue;
  const idx=next.findIndex(x=>marketName(x.name)===name||marketCode(x.id||x.code)===code);
  if(idx<0){next.push({...remote,syncedAt:stamp,catalogSource:'agent'});continue}
  // Admin entries own their code. An agent cannot silently override it.
  if(next[idx].catalogSource==='manual')continue;
  // Same market identity: refresh metadata only, never remap an existing ID by name.
  if(marketName(next[idx].name)===name&&marketCode(next[idx].id||next[idx].code)===code){next[idx]={...next[idx],...remote,syncedAt:stamp,catalogSource:next[idx].catalogSource||'agent'}}
 }
 return next;
}
function applyImport(current, imported,mode){const next=[...(current||[])];let added=0,updated=0;for(const m of imported){const idx=next.findIndex(x=>marketName(x.name)===marketName(m.name));if(idx>=0){if(mode==='update'){next[idx]={...next[idx],...m,catalogSource:'manual'};updated++}}else{next.push({...m,catalogSource:'manual'});added++}}
const names=new Set(),codes=new Set();for(const m of next){const n=marketName(m.name),c=marketCode(m.id||m.code);if(names.has(n)||codes.has(c))throw Error('Nama atau kode duplikat pada website ini');names.add(n);codes.add(c)}return {markets:next,added,updated};}
module.exports={marketName,marketCode,mergeAgentCatalog,applyImport};
