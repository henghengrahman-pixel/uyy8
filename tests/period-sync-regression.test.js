'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('period sync has bounded concurrency and separates catalog count from period count',()=>{
 const src=fs.readFileSync(path.join(__dirname,'..','agent-readonly.js'),'utf8');
 assert.match(src,/Math\.min\(4,entries\.length\)/);
 assert.match(src,/periodsRead:periods/);
 assert.match(src,/if\(fatal\)throw fatal/);
 const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
 assert.match(server,/periodsRead:result\.periodsRead\|\|0/);
});
