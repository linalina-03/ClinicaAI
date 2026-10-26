import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path => readFileSync(new URL(path,import.meta.url),'utf8');
const rich = JSON.parse(read('../src/data/enrichment/ep-postop-enriched.json'));
const chest=rich.entries.find(e=>e.id==='douleur_thoracique');
test('scénario commun conserve le fait pédagogique de douleur inspiratoire',()=>{
 assert.match(chest.answer,/inspire profondément/);
 assert.ok(chest.variants.includes('quand vous inspirez profondément'));
 assert.equal(chest.provenance,'fiction_pedagogique');
});
test('Gemini reçoit la même source enrichie sur les deux pages',()=>{
 const helper=read('../src/lib/commonPostopGemini.js');
 const home=read('../src/app/api/history-gemini/route.ts');
 const lab=read('../src/app/api/lab/generate/route.ts');
 assert.match(helper,/ep-postop-enriched.json/);
 assert.match(helper,/commonPostopFacts/);
 assert.match(home,/commonPostopInstructions/);
 assert.match(lab,/commonPostopInstructions/);
});
test('règles et sémantique de la première page partagent les moteurs du Lab',()=>{
 const home=read('../src/app/page.tsx');
 const lab=read('../src/app/lab/page.tsx');
 for(const method of ['rulesLabAnswer','semanticLabAnswer']){
  assert.ok(home.includes(method));
  assert.ok(lab.includes(method));
 }
});
