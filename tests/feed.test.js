'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {endpointFor,normalizeRecords,mergeRecords,readFeed}=require('../market-feed');
const website={id:'w1',name:'Example'};
test('feed is opt-in HTTPS per website',()=>{assert.equal(endpointFor('Example',JSON.stringify({Example:'https://results.example.org/markets.json'})),'https://results.example.org/markets.json');assert.equal(endpointFor('Missing','{}'),null);assert.throws(()=>endpointFor('Example',JSON.stringify({Example:'http://localhost:9000/x'})));assert.throws(()=>endpointFor('Example',JSON.stringify({Example:'https://127.0.0.1/a'})));});
test('validate published results and market status',()=>{const r=normalizeRecords({markets:[{name:'Andorra',marketId:'p6593',period:'2310',date:'2026-10-10',status:'SELESAI',result:'1234'}]},website);assert.equal(r[0].market,'ANDORRA');assert.equal(r[0].source,'published_feed');assert.throws(()=>normalizeRecords([{name:'Andorra',marketId:'p6593',period:'2310',date:'2026-10-10',status:'BUKA',result:'1234'}],website));});
test('prevent overwrite of recorded official result without mutating old data',()=>{const original=normalizeRecords([{name:'Andorra',marketId:'p6593',period:'2310',date:'2026-10-10',status:'SELESAI',result:'1234'}],website);const next=normalizeRecords([{name:'Andorra',marketId:'p6593',period:'2310',date:'2026-10-10',status:'SELESAI',result:'9999'}],website);assert.throws(()=>mergeRecords(original,next));assert.equal(original[0].result,'1234');});
test('HTTPS read-only JSON feed, no session headers',async()=>{const result=await readFeed('https://results.example.org/markets.json',async(u,opts)=>{assert.equal(opts.method,'GET');assert.deepEqual(opts.headers,{accept:'application/json'});return {ok:true,headers:{get:()=> 'application/json'},text:async()=>'{"markets":[]}'}},{skipDnsPreflight:true});assert.deepEqual(result,{markets:[]});});
const {publicAddress,verifyPublicDns}=require('../market-feed');
test('feed rejects private and reserved DNS addresses',async()=>{
 assert.equal(publicAddress('100.64.0.1'),false);
 assert.equal(publicAddress('127.0.0.1'),false);
 assert.equal(publicAddress('10.8.0.2'),false);
 assert.equal(publicAddress('8.8.8.8'),true);
 await assert.rejects(()=>verifyPublicDns('https://results.example.org/a',async()=>[{address:'127.0.0.1'}]),/restricted/);
 await assert.doesNotReject(()=>verifyPublicDns('https://results.example.org/a',async()=>[{address:'8.8.8.8'}]));
});
test('feed rejects duplicate records and malformed feed config',()=>{
 const x={name:'Andorra',marketId:'p6593',period:'2310',date:'2026-10-10',status:'BUKA'};
 assert.throws(()=>normalizeRecords([x,x],website),/Duplicate/);
 assert.throws(()=>endpointFor('Example','{"Example":12}'),/string/);
 assert.throws(()=>endpointFor('Example','{notjson'),/JSON/);
});
