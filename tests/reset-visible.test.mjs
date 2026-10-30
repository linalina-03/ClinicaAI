import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/app/page.tsx',import.meta.url),'utf8');
test('button for new blank attempt is permanently visible and requests confirmation',()=>{
 assert.match(src,/Nouveau cas — Recommencer à zéro/);
 assert.match(src,/onClick=\{\(\)=>\{if\(window\.confirm\(/);
 assert.match(src,/\)\)reset\(\)\}\}/);
});
test('reset clears current draft and section state while preserving archived attempts',()=>{
 const code=src.match(/function reset\(i=caseIndex\)\{[^\n]+/ )?.[0]||'';
 assert.match(code,/localStorage\.removeItem\(DRAFT_KEY\)/);
 assert.match(code,/clinicaai-v46-section-/);
 assert.match(code,/setChat\(\[\]\)/);
 assert.match(code,/setHypothesisText\(''\)/);
 assert.match(code,/setClinicalAnswers\(\{triage:'',diagnosis:'',management:''\}\)/);
 assert.doesNotMatch(code,/removeItem\(ARCHIVE_KEY\)/);
});
