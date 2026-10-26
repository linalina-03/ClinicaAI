import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync('src/app/page.tsx','utf8');
const hybrid=readFileSync('src/app/ClinicalDecisionHybrid.tsx','utf8');
test('all three sections use Gemini automatic grading when submitted',()=>{
 assert.match(hybrid,/if\(finished&&locked&&!gradedAutomatically.current\)/);
 assert.match(page,/if\(diagnosticLocked\)void correctDiagnostic\(true\)/);
});
test('English examination choices and observations translated',()=>{
 assert.match(page,/diagnosisLabel\(id,language\)/);
 assert.match(page,/englishVital\(v\)/);
 assert.match(hybrid,/extraEnglish\[id\]/);
 assert.match(hybrid,/language==='en'\?\(extraEnglish\[id\]/);
});
