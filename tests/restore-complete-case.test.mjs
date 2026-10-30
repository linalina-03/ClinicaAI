import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/app/page.tsx',import.meta.url),'utf8');
test('diagnosis can be reopened as a section for editing',()=>{
 assert.match(source,/Modifier cette partie/);
 assert.match(source,/setDiagnosticLocked\(false\);setDiagnosticStep\(0\);setAiDiagnosticGrade\(null\)/);
});
test('completed case can be reopened with existing answers',()=>{
 assert.match(source,/Restaurer ce cas complet pour le modifier/);
 assert.match(source,/setFinished\(false\);setSmartResult\(null\);setGrading\(false\)/);
 assert.match(source,/Restaurer l’essai complet \/ modifier/);
});
