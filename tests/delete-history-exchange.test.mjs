import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/app/page.tsx', import.meta.url),'utf8');
test('question deletion removes paired response, not just text',()=>{
 assert.match(src,/function deleteHistoryExchange\(index:number\)/);
 assert.match(src,/i!==index&&i!==index\+1/);
 assert.match(src,/entry\.role==='student'&&updated\[i\+1\]\?\.role==='patient'/);
 assert.match(src,/setVisited\(nextVisited\)/);
 assert.match(src,/setHistoryValidated\(false\)/);
 assert.match(src,/onClick=\{\(\)=>deleteHistoryExchange\(i\)\}/);
});
