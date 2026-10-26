import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../src/app/page.tsx',import.meta.url),'utf8');
test('one generative patient answer, without comparison controls',()=>{
 const form=code.indexOf('<form className="flex flex-wrap gap-2" onSubmit={send}>');
 const log=code.indexOf('<div ref={chatScrollRef}');
 assert.ok(form>0 && form<log);
 assert.doesNotMatch(code,/Optional engines to compare \(below\)/);
 assert.doesNotMatch(code,/selectedHistoryEngines|historyCompare/);
 assert.match(code,/fetch\('\/api\/history-gemini'/);
 assert.match(code,/role:'patient',text:data.answer.trim\(\)/);
});
test('initial clinical case statement is distinguished from patient dialogue',()=>{
  assert.match(code,/Énoncé initial du cas clinique/);
  assert.match(code,/data-testid="initial-case-statement"/);
  const css=readFileSync(new URL('../src/app/globals.css',import.meta.url),'utf8');
  assert.match(css,/background: linear-gradient\(125deg/);
  assert.match(code,/Conversation avec le patient virtuel/);
  assert.doesNotMatch(code,/Patient \(Gemini\)/);
  assert.doesNotMatch(code,/Gemini répond toujours en tant que patient/);
});

test('technical semantic engine panel and comparative outputs are absent',()=>{
 assert.doesNotMatch(code,/In-browser semantic AI|IA sémantique dans le navigateur/);
 assert.doesNotMatch(code,/Comparaison indicative — méthodes sélectionnées/);
 assert.doesNotMatch(code,/semanticLabAnswer\(q,chat\)/);
});

test('teaching tips absent from conversation and visible at end of test',()=>{
 assert.doesNotMatch(code,/m\.tutor|Afficher le conseil pédagogique|assessQuestion\(question,current\)/);
 assert.match(code,/Conseils de révision et retour aux cours/);
 assert.match(code,/feedback\.advice\.map/);
});
test('patient introduction is a click-controlled button with honest validation language',()=>{
 assert.match(code,/Je suis le patient virtuel/);
 assert.match(code,/aria-expanded=\{showPatientIntro\}/);
 assert.match(code,/onClick=\{\(\)=>setShowPatientIntro/);
 assert.match(code,/ne démontrent pas, à eux seuls, la supériorité validée/);
});
