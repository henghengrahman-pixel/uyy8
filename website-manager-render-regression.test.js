const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('Website Manager market rows stay an array compatible with table()',()=>{
 const src=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
 const panel=src.split('function marketManagerPanel(w,s){')[1].split('\nfunction validateMarket(')[0];
 assert.match(panel,/const rows=markets\.map\(/);
 assert.doesNotMatch(panel,/const rows=markets\.map\([\s\S]*?\)\.join\(''\)/);
 assert.match(panel,/table\(\['Nama','Kode','Edit \/ Hapus'\],rows\)/);
 const table=(head,rows)=>`${head.join(' ')}|${rows.length?rows.join(''):'empty'}`;
 assert.match(table(['Nama'],['<tr><td>ANDORRA</td></tr>']),/ANDORRA/);
});
