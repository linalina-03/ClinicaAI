import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {patientAnswer} from '../src/lib/patientEngine.js';
import {misleadingFeverPEAnswer} from '../src/lib/leadingQuestion.js';
const postop=JSON.parse(readFileSync(new URL('../src/data/cases/ep-postop.json',import.meta.url)));
const q='Si vous n’avez pas de fièvre, cela exclut une embolie pulmonaire, n’est-ce pas ?';
test('Q100: réponse contrôlée, sans fausse exclusion',()=>{
 const a=patientAnswer(postop,q);
 const b=misleadingFeverPEAnswer('ep-postop',q);
 assert.equal(a.answer,b.answer);
 assert.match(a.answer,/ne sais pas si cela suffit à exclure/);
 assert.equal(a.id,'fievre');
});
test('Q100 in English and other scenarios',()=>{
 const en=misleadingFeverPEAnswer('ep-postop','If there is no fever, that rules out a pulmonary embolism, right?','en');
 assert.match(en.answer,/do not know whether/);
 assert.equal(misleadingFeverPEAnswer('ep-choc',q),null);
 assert.equal(misleadingFeverPEAnswer('ep-postop','Avez-vous de la fièvre ?'),null);
});
