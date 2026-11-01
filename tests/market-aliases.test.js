'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {canonicalMarketName,globalMarketNames,resolveWebsiteMarket}=require('../market-aliases');
test('POOL and POOLS terminal aliases collapse (case/whitespace)',()=>{
 for(const name of ['vegas','Vegas pool','VEGAS POOLS',' VEGAS   POOLS '])assert.equal(canonicalMarketName(name),'VEGAS');
 assert.equal(canonicalMarketName('VEGAS POOL WEST'),'VEGAS POOL WEST');
 assert.equal(canonicalMarketName('LIVERPOOL'),'LIVERPOOL');
});
test('global choices only once and independent market IDs per website',()=>{
 const web=[{name:'A',markets:[{name:'VEGAS',id:'p1'},{name:'ANDORRA POOLS',id:'p2'}]},{name:'B',markets:[{name:'VEGAS POOL',id:'p9'},{name:'ANDORRA',id:'p20'}]}];
 assert.deepEqual(globalMarketNames(web),['ANDORRA','VEGAS']);
 assert.equal(resolveWebsiteMarket(web[0],'vegas pools').market.id,'p1');
 assert.equal(resolveWebsiteMarket(web[1],'vegas').market.id,'p9');
});
test('missing websites are skipped and ambiguous ID mappings rejected',()=>{
 assert.equal(resolveWebsiteMarket({markets:[]},'VEGAS').status,'NOT_FOUND');
 assert.equal(resolveWebsiteMarket({markets:[{name:'VEGAS',id:'p1'},{name:'VEGAS POOL',id:'p2'}]},'VEGAS').status,'AMBIGUOUS');
 assert.equal(resolveWebsiteMarket({markets:[{name:'VEGAS',id:'p1'},{name:'VEGAS POOLS',id:'p1'}]},'VEGAS').status,'FOUND');
});
test('live PT selects global catalog and sync does not overwrite manual mappings',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
 assert.match(source,/const marketOptions=markets\.map\(/);
 assert.match(source,/const selected=resolveWebsiteMarket\(w,market\)/);
 assert.match(source,/current\.markets=catalog\.mergeAgentCatalog\(old,incomingCatalog,current\.deletedMarketKeys\|\|\[\],at\)/);
});
test('agent PT parser matches POOL aliases without selecting conflicting IDs',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','agent-pt.js'),'utf8');
 assert.match(source,/canonicalMarketName\(m\.name\)===normalized/);
 assert.match(source,/matchingIds\.size!==1/);
});
test('published report recap merges POOL variants across websites but keeps individual IDs',()=>{
 const {recap}=require('../pt-reports');
 const data=[{websiteId:'w1',marketId:'p1',market:'VEGAS',period:'1',number:'8000',value:10},{websiteId:'w2',marketId:'p9',market:'VEGAS POOLS',period:'1',number:'8000',value:20}];
 const values=recap(data,[{id:'w1',name:'A'},{id:'w2',name:'B'}],'VEGAS POOL','1');
 assert.equal(values[0].all,30);
 assert.deepEqual(values[0].values,[10,20]);
 assert.throws(()=>recap([...data,{websiteId:'w2',marketId:'p10',market:'VEGAS POOL',period:'1',number:'8000',value:40}],[{id:'w2',name:'B'}],'VEGAS','1'),/AMBIGUOUS_MARKET_IDS/);
});
