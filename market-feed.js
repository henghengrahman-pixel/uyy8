'use strict';
// Read-only importer for independently published market data. Agent credentials are never sent.
const net=require('node:net');
const dns=require('node:dns').promises;

function safeHost(host){
 const value=String(host||'').toLowerCase().replace(/\.$/,'');
 return Boolean(value)&&!net.isIP(value)&&value!=='localhost'&&!value.endsWith('.localhost')&&!value.endsWith('.local')&&!value.endsWith('.internal')&&!value.endsWith('.test')&&!value.endsWith('.invalid');
}
function endpointFor(name, config){
 let mapping;
 try{mapping=JSON.parse(config||'{}')}catch{throw Error('MARKET_FEEDS_JSON must contain valid JSON')}
 if(!mapping||typeof mapping!=='object'||Array.isArray(mapping)){
  if(Array.isArray(mapping)&&mapping.length===0)return null; // Legacy default
  throw Error('MARKET_FEEDS_JSON must map website names to HTTPS URLs');
 }
 const value=mapping[name];
 if(value==null||value==='')return null;
 if(typeof value!=='string')throw Error('Feed URL must be a string');
 let u;try{u=new URL(value)}catch{throw Error('Invalid feed URL')}
 if(u.protocol!=='https:'||u.username||u.password||u.hash||u.port&&u.port!=='443'||!safeHost(u.hostname))throw Error('Feed URL must use a public HTTPS hostname');
 return u.href;
}
function publicAddress(address){
 const type=net.isIP(address);
 if(type===4){
  const a=address.split('.').map(Number);
  return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||(a[0]===100&&a[1]>=64&&a[1]<=127)||(a[0]===169&&a[1]===254)||(a[0]===172&&a[1]>=16&&a[1]<=31)||(a[0]===192&&a[1]===168)||(a[0]===192&&a[1]===0)||(a[0]===198&&a[1]>=18&&a[1]<=19)||(a[0]===192&&a[1]===0&&a[2]===2)||(a[0]===198&&a[1]===51&&a[2]===100)||(a[0]===203&&a[1]===0&&a[2]===113));
 }
 if(type===6){const s=address.toLowerCase();return !(s==='::'||s==='::1'||s.startsWith('fc')||s.startsWith('fd')||s.startsWith('fe8')||s.startsWith('fe9')||s.startsWith('fea')||s.startsWith('feb')||s.startsWith('2001:db8:')||s.startsWith('::ffff:'));}
 return false;
}
async function verifyPublicDns(url, lookup=dns.lookup){
 const u=new URL(url);
 if(u.protocol!=='https:'||!safeHost(u.hostname))throw Error('Invalid feed hostname');
 const addresses=await lookup(u.hostname,{all:true,verbatim:true});
 if(!Array.isArray(addresses)||addresses.length===0||addresses.some(x=>!publicAddress(x.address)))throw Error('Feed hostname resolves to a restricted address');
 return true;
}
function normalizeRecords(payload, website){
 const rows=Array.isArray(payload)?payload:payload?.markets;
 if(!Array.isArray(rows)||rows.length>400||rows.length===0)throw Error('Expected 1–400 markets');
 const now=new Date().toISOString();
 const seen=new Set();
 return rows.map(x=>{
  if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Invalid market feed record');
  const market=String(x.name||'').trim().toUpperCase(),marketId=String(x.marketId||'').trim(),period=String(x.period||'').trim(),date=String(x.date||'').trim(),status=String(x.status||'UNKNOWN').trim().toUpperCase(),result=x.result==null?'':String(x.result).trim();
  if(!/^[A-Z0-9 _.-]{2,80}$/.test(market)||!/^[A-Za-z0-9_-]{1,40}$/.test(marketId)||!/^[A-Za-z0-9_-]{1,32}$/.test(period)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||!['BUKA','TUTUP','SELESAI','UNKNOWN'].includes(status)||!(status==='SELESAI'?/^\d{4}$/.test(result):result===''))throw Error('Invalid market feed record');
  const id=[marketId,period,date].join(':');if(seen.has(id))throw Error('Duplicate market/period/date in feed');seen.add(id);
  return {websiteId:website.id,websiteName:website.name,market,marketId,period,date,status,result,at:now,source:'published_feed'};
 });
}
function mergeRecords(existing,incoming){
 const next=existing.slice();
 for(const r of incoming){const i=next.findIndex(x=>x.websiteId===r.websiteId&&x.marketId===r.marketId&&x.period===r.period&&x.date===r.date);
  if(i>=0){if(next[i].status==='SELESAI'&&(r.status!=='SELESAI'||r.result!==next[i].result))throw Error('Published result conflict');next[i]=r}else next.push(r);
 }
 return next;
}
async function readFeed(url,fetcher=fetch,options={}){
 // DNS preflight is only an additional defense; production operators should enforce
 // outbound egress policy to prevent DNS rebinding/connection-time address changes.
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 const bounded=p=>new Promise((resolve,reject)=>{if(controller.signal.aborted)return reject(Error('FEED_TIMEOUT'));const abort=()=>reject(Error('FEED_TIMEOUT'));controller.signal.addEventListener('abort',abort,{once:true});Promise.resolve(p).then(resolve,reject).finally(()=>controller.signal.removeEventListener('abort',abort))});
 try{
  if(!options.skipDnsPreflight)await bounded(verifyPublicDns(url,options.lookup||dns.lookup));
  const response=await bounded(fetcher(url,{method:'GET',redirect:'error',headers:{accept:'application/json'},signal:controller.signal}));
  if(!response.ok)throw Error('Feed HTTP '+response.status);
  if(!(response.headers.get('content-type')||'').toLowerCase().includes('application/json'))throw Error('Feed did not return JSON');
  const announced=Number(response.headers.get('content-length'));
  if(Number.isFinite(announced)&&announced>250000)throw Error('Feed too large');
  if(!response.body||typeof response.body.getReader!=='function'){
   const str=await bounded(response.text());if(Buffer.byteLength(str,'utf8')>250000)throw Error('Feed too large');return JSON.parse(str);
  }
  const reader=response.body.getReader();let bytes=0;const chunks=[];
  try{while(true){const {value,done}=await bounded(reader.read());if(done)break;bytes+=value.byteLength;if(bytes>250000)throw Error('Feed too large');chunks.push(Buffer.from(value));}}finally{reader.releaseLock()}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
 }finally{clearTimeout(timer)}
}
module.exports={endpointFor,normalizeRecords,mergeRecords,readFeed,publicAddress,verifyPublicDns};
