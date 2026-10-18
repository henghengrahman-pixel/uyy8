'use strict';
const test=require('node:test'); const assert=require('node:assert/strict');
const {parseCatalog,parsePeriod,cleanCookie}=require('../agent-readonly');
test('parses market links and choices, rejects unrelated links',()=>{const html='<a href="admin_angka13.php?psr=p6593">ANDORRA</a><a href="admin_prediksifullbb.php?psr=p6596">JAIPUR</a><select><option value="?psr=p6593">ANDORRA</option></select><a href="/x.php?psr=p10">IGNORE</a>';assert.deepEqual(parseCatalog(html).map(x=>[x.name,x.id]),[['ANDORRA','p6593'],['JAIPUR','p6596']])});
test('extracts period and preserves leading zeroes',()=>{assert.equal(parsePeriod('<input name="periode" value="02310" readonly>'),'02310')});
test('cookie rejects empty, malformed and newline injection',()=>{assert.equal(cleanCookie('PHPSESSID=abc123; theme=light'),'PHPSESSID=abc123; theme=light');assert.throws(()=>cleanCookie('PHPSESSID=x\r\nInjected: ok'));assert.throws(()=>cleanCookie(''))});

test('menu frame market catalog supports multiple distinct pasaran IDs',()=>{const html='<div><a href="admin_angka13.php?psr=p6593">ANDORRA</a><a href="admin_angka13.php?psr=p6596">JAIPUR</a></div>';assert.deepEqual(parseCatalog(html).map(x=>x.id),['p6593','p6596'])});
