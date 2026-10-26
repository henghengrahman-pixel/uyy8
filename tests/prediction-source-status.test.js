'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
test('predictions distinguish catalog sync from available results',()=>{
 assert.match(source,/Status Sumber Data/);
 assert.match(source,/HANYA KATALOG/);
 assert.match(source,/Katalog Agent Terbaca/);
 assert.match(source,/count\?'DATA TERSEDIA'/);
 assert.doesNotMatch(source,/card\('Koneksi Agent'/);
});
