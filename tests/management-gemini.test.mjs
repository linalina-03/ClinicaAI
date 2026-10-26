import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync('src/app/ClinicalDecisionHybrid.tsx','utf8');
const api=readFileSync('src/app/api/clinical-sections-grade/route.ts','utf8');
test('Conduite : correction Gemini automatiquement après verrouillage et fin du test',()=>{assert.match(ui,/if\(finished&&locked&&!gradedAutomatically.current\)/);assert.match(ui,/void gradeAI\(\)/)});
test('Conduite : notes séparées libre sur 7 et propositions sur 13',()=>{assert.match(ui,/grade.scores.spontane}\/7/);assert.match(ui,/grade.scores.choix \+ grade.scores.priorites \+ grade.scores.justification}\/13/)});
test('Conduite : retours séparés du correcteur',()=>{assert.match(api,/commentaireSpontane/);assert.match(api,/commentaireChoix/)});
