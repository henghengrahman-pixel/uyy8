'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {reconcileSeed}=require('../seed-reconcile');
const seed=require('../data/store.json');
const copy=v=>JSON.parse(JSON.stringify(v));
test('adds all nine websites on empty persistent store',()=>{const store={websites:[]};const r=reconcileSeed(store,seed);assert.equal(r.websitesAdded,9);assert.equal(store.websites.length,9);assert.equal(store.websites.reduce((n,w)=>n+w.markets.length,0),923)});
test('existing agent URL, session and edited code remain untouched',()=>{const w=copy(seed.websites[1]);w.url='https://custom.example';w.encryptedSession={ciphertext:'secret'};w.markets=[{name:'ANDORRA',id:'pCUSTOM',catalogSource:'manual'}];const store={websites:[w]};reconcileSeed(store,seed);assert.equal(store.websites.length,9);const current=store.websites.find(x=>x.name===w.name);assert.equal(current.url,w.url);assert.deepEqual(current.encryptedSession,w.encryptedSession);assert.equal(current.markets.find(m=>m.name==='ANDORRA').id,'pCUSTOM')});
test('archived websites and deleted markets are not restored',()=>{const w=copy(seed.websites[1]);w.markets=[];w.deletedMarketKeys=['name:ANDORRA'];const store={websites:[w],archivedWebsites:[{name:'DENTOTO'}]};reconcileSeed(store,seed);assert.equal(store.websites.some(x=>x.name==='DENTOTO'),false);assert.equal(w.markets.some(x=>x.name==='ANDORRA'),false)});
test('migration is idempotent and respects renamed code on subsequent start',()=>{const store={websites:[]};reconcileSeed(store,seed);store.websites[0].markets[0].id='local-change';const a=JSON.stringify(store);assert.equal(reconcileSeed(store,seed).changed,false);assert.equal(JSON.stringify(store),a)});
