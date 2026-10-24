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
test('suivis Q48 et Q49 directement après Q43',()=>{
 const ids=data.items.map(x=>x.id);
 const i=ids.indexOf('Q43');
 assert.deepEqual(ids.slice(i,i+4),['Q43','Q48','Q49','Q50']);
});
test('séparation développement / évaluation inchangée',()=>{
 assert.ok(data.items.slice(0,50).every(x=>Number(x.id.slice(1))<=50));
 assert.ok(data.items.slice(50).every(x=>Number(x.id.slice(1))>=51));
});
