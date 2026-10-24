import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { patientAnswer, evaluate } from '../src/lib/patientEngine.js';
const read=(id)=>JSON.parse(fs.readFileSync(new URL('../src/data/cases/'+id+'.json',import.meta.url)));
const postop=read('ep-postop'), choc=read('ep-choc'),complexe=read('ep-complexe');
test('questions sur jambe vs chirurgie: intents distincts',()=>{
 assert.equal(patientAnswer(postop,'Avez-vous été opérée de la jambe ?').id,'chirurgie');
 assert.equal(patientAnswer(choc,'Avez-vous mal au mollet ?').id,'jambe');
});
test('traitement vs antécédents',()=>{
 assert.equal(patientAnswer(complexe,'Quels médicaments prenez-vous ?').id,'traitement');
 assert.equal(patientAnswer(complexe,'Avez-vous une maladie cardiaque ?').id,'antecedents');
});
test('aucune hallucination si sujet absent',()=>{
 const a=patientAnswer(postop,'Parlez-moi des dinosaures');
 assert.equal(a.status,'unknown'); assert.equal(a.id,null);
});
test('score borné et vérification des erreurs graves',()=>{
 for(const c of [postop,choc,complexe]){
  const s=evaluate(c,[],[],[],'','');assert(s.total>=0&&s.total<=100);
 }
 const unsafe=evaluate(choc,[],['ddimer'],[],'Pneumopathie','surveillance');
 assert(unsafe.penalty>=20);
});
