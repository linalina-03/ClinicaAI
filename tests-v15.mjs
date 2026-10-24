import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {patientAnswer}=await import('./src/lib/patientEngine.js');
const {gradeCase}=await import('./src/lib/examinerEngine.js');
const ids=['ep-postop','ep-choc','ep-complexe','ep-grossesse','ep-intermediaire'];
for(const id of ids){
 const c=JSON.parse(fs.readFileSync(`./src/data/cases/${id}.json`));
 const r=JSON.parse(fs.readFileSync(`./src/data/rubrics/${id}.json`));
 assert.equal(c.id,id);assert.equal(r.id,id);
 assert.equal(r.triage.reduce((a,x)=>a+x.points,0),20);
 assert.equal(r.diagnosis.reduce((a,x)=>a+x.points,0),15);
 assert.equal(r.management.reduce((a,x)=>a+x.points,0),20);
 assert.ok(c.qa.length>=5 && c.exams.length>=4);
 const answer=patientAnswer(c,'Depuis quand avez-vous ces symptômes ?');
 assert.ok(typeof answer.answer==='string');
 const score=gradeCase(c,r,c.qa.map(x=>x.id),c.exams.map(x=>x.id),{triage:'Je vérifie la pression artérielle et les signes de choc ; surveillance et biomarqueurs',diagnosis:'Embolie pulmonaire à risque intermédiaire ou haut risque selon l’hémodynamique',management:'Anticoagulation et surveillance, après vérification du risque hémorragique.'});
 assert.ok(score.total>=0 && score.total<=100);
 console.log('PASS',id,score.total);
}
const c=JSON.parse(fs.readFileSync('./src/data/cases/ep-intermediaire.json'));const r=JSON.parse(fs.readFileSync('./src/data/rubrics/ep-intermediaire.json'));
const e=gradeCase(c,r,[],[],{triage:'stable avec dysfonction VD',diagnosis:'embolie pulmonaire, categorie C3',management:'Je propose thrombolyse systématique'});
assert.ok(e.penalty>=15);
console.log('PASS pénalité de thrombolyse non justifiée');
