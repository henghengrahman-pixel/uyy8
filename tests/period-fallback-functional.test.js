'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parsePeriod}=require('../agent-readonly');
test('period extraction supports legacy HTML with id but without name',()=>{
 assert.equal(parsePeriod('<form><input type=text id="periode" value="002308"></form>'),'002308');
});
test('period extraction accepts name and rejects malformed values',()=>{
 assert.equal(parsePeriod('<input name="periode" id="x" value="2308">'),'2308');
 assert.equal(parsePeriod('<input name="periode" value="2x08">'),'');
 assert.equal(parsePeriod('<input name="something" value="2308">'),'');
});
test('period fallback path is present in agent worker',()=>{
 const fs=require('node:fs');
 const source=fs.readFileSync(require.resolve('../agent-readonly'),'utf8');
 assert.match(source,/for\(const page of \['admin_angka13\.php','admin_prediksifullbb\.php'\]\)/);
 assert.match(source,/periodSource,periodCheck:/);
});
