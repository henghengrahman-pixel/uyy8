'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {mergeAgentCatalog,applyImport,marketName,marketCode}=require('../market-catalog');
test('manual mapping survives an agent ID mismatch',()=>{const a=[{name:'ANDORRA',id:'p6593',catalogSource:'manual'}];const out=mergeAgentCatalog(a,[{name:'ANDORRA',id:'p9999'}],[],new Date().toISOString());assert.equal(out.length,1);assert.equal(out[0].id,'p6593')});
test('partial agent response does not erase older catalog',()=>{const a=[{name:'ANDORRA',id:'p6593',catalogSource:'agent'},{name:'BALI',id:'p2000',catalogSource:'agent'}];const out=mergeAgentCatalog(a,[{name:'ANDORRA',id:'p6593'}],[],new Date().toISOString());assert.equal(out.length,2)});
test('deleted market tombstone blocks agent re-creation',()=>{const out=mergeAgentCatalog([],[{name:'ANDORRA',id:'p6593'}],[marketName('ANDORRA'),marketCode('p6593')],new Date().toISOString());assert.equal(out.length,0)});
test('import preserves website-local catalog and rejects conflicting codes',()=>{const a=[{name:'ANDORRA',id:'p6593'}];assert.throws(()=>applyImport(a,[{name:'BALI',id:'p6593'}],'skip'),/duplikat/);assert.equal(a.length,1)});
test('import updates code with original array unchanged',()=>{const a=[{name:'ANDORRA',id:'p6593'}];const out=applyImport(a,[{name:'ANDORRA',id:'p9999'}],'update');assert.equal(out.markets[0].id,'p9999');assert.equal(a[0].id,'p6593')});
