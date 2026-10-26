'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('predictions has actual submit loading and no fabricated loading on absent data',()=>{
 const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
 const client=fs.readFileSync(path.join(root,'public/predictions.js'),'utf8');
 assert.match(server,/const rows=valid&&matches\.length\?/);
 assert.match(server,/Tidak ada hasil resmi historis tersimpan/);
 assert.match(server,/data-prediction-loading/);
 assert.match(client,/form\.addEventListener\('submit'/);
 assert.match(client,/loading\.hidden=false;results\.hidden=true/);
 assert.match(client,/loading\.hidden=true;results\.hidden=false/);
});
