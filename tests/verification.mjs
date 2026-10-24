import fs from 'node:fs'; import assert from 'node:assert/strict'; import test from 'node:test';
const load=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
test('schema case grossesse',()=>{const c=load('../src/data/cases/ep-grossesse.json');assert.equal(c.id,'ep-grossesse');assert.equal(c.exams.length,8);assert.ok(c.qa.reduce((s,x)=>s+x.points,0)<=20)});
test('rubrique sur 55 pts',()=>{const r=load('../src/data/rubrics/ep-grossesse.json');assert.equal(['triage','diagnosis','management'].flatMap(x=>r[x]).reduce((s,x)=>s+x.points,0),55)});
test('cas importe par page',()=>{const p=fs.readFileSync(new URL('../src/app/page.tsx',import.meta.url),'utf8');assert.match(p,/ep-grossesse.json/);assert.match(p,/r4/)});
