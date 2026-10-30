import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync('src/app/page.tsx','utf8');
const hybrid=readFileSync('src/app/ClinicalDecisionHybrid.tsx','utf8');
test('all three sections support staged Gemini grading and automatic fallback at case end',()=>{
 assert.match(hybrid,/if\(finished&&locked&&!grade&&!gradedAutomatically.current\)/);
 assert.match(page,/if\(diagnosticLocked&&!aiDiagnosticGrade\)void correctDiagnostic\(true\)/);
});
test('English examination choices and observations translated',()=>{
 assert.match(page,/diagnosisLabel\(id,language\)/);
 assert.match(page,/englishVital\(v\)/);
 assert.match(hybrid,/extraEnglish\[id\]/);
 assert.match(hybrid,/language==='en'\?\(extraEnglish\[id\]/);
});
