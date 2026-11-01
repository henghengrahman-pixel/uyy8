'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
test('history panel is removed from live agent page but history data is not destroyed',()=>{
 const src=read('server.js');
 const panel=src.slice(src.indexOf('function livePanel(s)'),src.indexOf('let activePtJob=null'));
 assert.doesNotMatch(panel,/Riwayat pemeriksaan|agent-pt-history|data-agent-pt-open/);
 assert.match(panel,/data-agent-pt-results/);
 assert.match(src,/agentPtJobs/);
});
test('live results no longer render timestamps and per-cell simulation text',()=>{
 const src=read('public/agent-pt.js');
 assert.doesNotMatch(src,/c\.readAt\s*\+\s*' · SIMULATION'/);
 assert.match(src,/agent-pt-table/);
 assert.match(src,/if\(c\.value===null\)/);
 assert.match(src,/const value=v=>v===null\?'BELUM TERSEDIA'/);
});
test('global market POOL/POOLS aliases keep per-website code identities',()=>{
 const {globalMarketNames,resolveWebsiteMarket}=require('../market-aliases');
 const websites=[{markets:[{name:'CAMBODIA POOLS',id:'p1'}]},{markets:[{name:'CAMBODIA',id:'p2'}]}];
 assert.deepEqual(globalMarketNames(websites),['CAMBODIA']);
 assert.equal(resolveWebsiteMarket(websites[0],'CAMBODIA').market.id,'p1');
 assert.equal(resolveWebsiteMarket(websites[1],'CAMBODIA POOL').market.id,'p2');
});
