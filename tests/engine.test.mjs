import assert from 'node:assert/strict';
import fs from 'node:fs';
import {patientAnswer,evaluate} from '../src/lib/patientEngine.js';
const load=id=>JSON.parse(fs.readFileSync(new URL('../src/data/cases/'+id+'.json',import.meta.url)));
const choc=load('ep-choc'),postop=load('ep-postop'),complexe=load('ep-complexe');
assert.equal(patientAnswer(choc,'Est-ce que votre mollet est gonflé ?').id,'jambe');
assert.equal(patientAnswer(choc,'Depuis quand vous sentez-vous mal ?').id,'debut');
assert.equal(patientAnswer(postop,'Avez-vous été opérée ?').id,'chirurgie');
assert.equal(patientAnswer(complexe,'Quels médicaments prenez-vous ?').id,'traitement');
assert.equal(patientAnswer(choc,'Parlez-moi des dinosaures').status,'unknown');
let full=evaluate(choc,choc.qa.map(q=>q.id),choc.exams.map(e=>e.id),choc.rule.triage,'Embolie pulmonaire','reperfusion');
assert.equal(full.total,95);
let unsafe=evaluate(choc,[],['ddimer'],[],'Pneumopathie','surveillance');
assert(unsafe.penalty>=20);assert(unsafe.total<50);
let stable=evaluate(postop,[],[] ,[],'Embolie pulmonaire','reperfusion');
assert.equal(stable.management,0);assert(stable.penalty>=15);
for (const c of [choc,postop,complexe]) {const e=evaluate(c,[],[],[],'','');assert(e.total>=0&&e.total<=100)}
console.log('Tests moteur et barème : OK');

const safe=evaluate(choc,choc.qa.map(q=>q.id),choc.exams.filter(e=>e.points>0).map(e=>e.id),choc.rule.triage,'Embolie pulmonaire','reperfusion');
assert.equal(safe.total,100);
