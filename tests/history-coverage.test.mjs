import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/lib/historyCoverage.js',import.meta.url),'utf8');
const {historyTopicsForQuestion}=await import('data:text/javascript,'+encodeURIComponent(src));
const clinicalCase=JSON.parse(fs.readFileSync(new URL('../src/data/cases/ep-postop.json',import.meta.url)));
test('tracks postoperative interview questions in French',()=>{
 assert.deepEqual(historyTopicsForQuestion(clinicalCase,'Depuis quand avez-vous du mal à respirer ?'),['debut']);
 assert.ok(historyTopicsForQuestion(clinicalCase,'Avez-vous une douleur dans la poitrine ?').includes('douleur'));
 assert.ok(historyTopicsForQuestion(clinicalCase,'Avez-vous été opérée récemment ?').includes('chirurgie'));
 assert.ok(historyTopicsForQuestion(clinicalCase,'Avez-vous remarqué un gonflement dans la jambe ?').includes('jambe'));
});
test('recognises English question intents while keeping patient content independent',()=>{
 assert.ok(historyTopicsForQuestion(clinicalCase,'When did the shortness of breath start?','en').includes('debut'));
 assert.ok(historyTopicsForQuestion(clinicalCase,'Did you have surgery recently?','en').includes('chirurgie'));
 assert.deepEqual(historyTopicsForQuestion(clinicalCase,'What is your favourite colour?','en'),[]);
});
test('the main page saves topic coverage only after successful generative response',()=>{
 const page=fs.readFileSync(new URL('../src/app/page.tsx',import.meta.url),'utf8');
 assert.match(page,/setChat\(v=>\[\.\.\.v,\{role:'student',text:question\},\{role:'patient',text:data\.answer\.trim\(\)\}\]\);\s*const covered=historyTopicsForQuestion/);
});
