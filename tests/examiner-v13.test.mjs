import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assessFreeResponse,gradeCase} from '../src/lib/examinerEngine.js';
const load=(id)=>JSON.parse(fs.readFileSync(new URL('../src/data/rubrics/'+id+'.json',import.meta.url)));
const caseLoad=(id)=>JSON.parse(fs.readFileSync(new URL('../src/data/cases/'+id+'.json',import.meta.url)));
test('choc: reconnaissance et traitement structurés',()=>{
 const r=assessFreeResponse(load('ep-choc'),{triage:'Choc et réanimation en soins intensifs',diagnosis:'Embolie pulmonaire à haut risque',management:'Anticoagulation par héparine et évaluation urgente de thrombolyse'});
 assert.equal(r.subtotal,55);assert.equal(r.penalty,0);
});
test('négation explicite ne rapporte pas le diagnostic',()=>{
 const r=assessFreeResponse(load('ep-postop'),{triage:'',diagnosis:'Ce n’est pas une embolie pulmonaire',management:''});
 assert.equal(r.report.diagnosis.score,0);
});
test('thrombolyse injustifiée entraîne pénalité',()=>{
 const r=assessFreeResponse(load('ep-postop'),{triage:'',diagnosis:'Embolie pulmonaire',management:'Thrombolyse immédiatement'});
 assert.equal(r.penalty,15);
});
test('note finale reste bornée et cohérente',()=>{
 const out=gradeCase(caseLoad('ep-choc'),load('ep-choc'),[],[],{triage:'choc réanimation',diagnosis:'embolie pulmonaire haut risque',management:'héparine thrombolyse'});
 assert.ok(out.total<=100&&out.total>=0);assert.equal(out.total,55);
});
