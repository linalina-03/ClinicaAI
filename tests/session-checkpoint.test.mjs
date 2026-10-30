import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync('src/app/page.tsx','utf8');
const hybrid=readFileSync('src/app/ClinicalDecisionHybrid.tsx','utf8');
test('unfinished parent session is saved and restored locally',()=>{
 assert.match(page,/clinicaai-v46-current-session/);
 assert.match(page,/localStorage.getItem\(DRAFT_KEY\)/);
 assert.match(page,/localStorage.setItem\(DRAFT_KEY/);
 assert.match(page,/!d.finished/);
});
test('validated sections preserve Gemini grading and allow retry before final submission',()=>{
 assert.match(hybrid,/clinicaai-v46-section-/);
 assert.match(hybrid,/grade,?\}/);
 assert.match(hybrid,/if\(loading\|\|!locked\)return/);
 assert.match(hybrid,/\{locked&&<div className="border-t/);
});
