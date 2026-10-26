import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../src/data/benchmark/ep-postop-100.json',import.meta.url),'utf8'));
const en=JSON.parse(readFileSync(new URL('../src/data/i18n/benchmark-en.json',import.meta.url),'utf8'));
const ref=JSON.parse(readFileSync(new URL('../src/data/i18n/benchmark-references-en.json',import.meta.url),'utf8'));
test('100 questions distinctes et traductions alignées',()=>{
 assert.equal(data.items.length,100);
 assert.equal(new Set(data.items.map(x=>x.id)).size,100);
 for(const item of data.items){assert.ok(en[item.id],`Traduction manquante ${item.id}`);assert.ok(ref[item.id],`Référence manquante ${item.id}`);}
});
test('les 100 questions sont autonomes et réparties dans leurs lots',()=>{
 const ids=data.items.map(x=>x.id);
 assert.equal(ids.length,100);
 assert.ok(data.items.slice(0,50).every(x=>Number(x.id.slice(1))<=50));
 assert.ok(data.items.slice(50).every(x=>Number(x.id.slice(1))>=51));
 for(const item of data.items){
   assert.equal(item.preQuestion,undefined,`pré-question inutile ${item.id}`);
   assert.ok(!/^(Et |Depuis quand exactement|Où est-elle|Elle augmente|A-t-elle|Vous connaissez son nom|Est-ce plus fort)/i.test(item.question),item.id);
 }
});
test('les identifiants suivent sans rupture la numérotation affichée',()=>{
 for(let i=0;i<100;i++){
  const id=`Q${String(i+1).padStart(2,'0')}`;
  assert.equal(data.items[i].id,id);
  assert.ok(data.items[i].question.length>10);
  assert.ok(en[id].length>10);
 }
});
test('le gris dépend exclusivement des réponses explicitement sauvegardées',()=>{
 const page=readFileSync(new URL('../src/app/lab/page.tsx',import.meta.url),'utf8');
 assert.match(page,/const doneIds = new Set\(records\.filter\(/);
 assert.match(page,/function saveTrial\(\)/);
 assert.match(page,/persist\(next\)/);
 assert.doesNotMatch(page,/markTested\(/);
 assert.doesNotMatch(page,/setTested\(/);
 assert.match(page,/function resetEntireLab\(/);
 assert.match(page,/localStorage.removeItem\('clinicaai-v32-benchmark'\)/);
});
