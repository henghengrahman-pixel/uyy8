'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('connection reports market sync only when at least one market was parsed',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
 assert.match(source,/status:result\.markets\.length\?'CONNECTED':'AUTH_OK_NO_MARKETS'/);
 assert.match(source,/return result\.markets\.length>0/);
 assert.match(source,/Login valid, katalog kosong/);
});
