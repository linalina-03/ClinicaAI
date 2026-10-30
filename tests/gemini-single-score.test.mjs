import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const page=readFileSync('src/app/page.tsx','utf8');const endpoint=readFileSync('src/app/api/gemini-case-parts/route.ts','utf8');
test('rapport final ne rend plus les scores hybrides',()=>{assert.match(page,/const result=null/);assert.match(page,/Gemini uniquement/);assert.match(page,/allGeminiReady/);assert.match(page,/Note finale en attente/)});
test('Gemini corrige l’interrogatoire et les examens, sans inventer les validations',()=>{assert.match(endpoint,/historyValidated/);assert.match(endpoint,/examsValidated/);assert.match(endpoint,/total:valid\?n:null/)});
test('export PDF conserve les 5 notes et les attentes',()=>{assert.match(page,/geminiParts\.map/);assert.match(page,/Correction en attente/);assert.match(page,/geminiTotal===null/)});
