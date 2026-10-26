// ClinicaAI V1.7 — décision hybride explicable, jamais de réponse inventée.
import { normalize } from './patientEngine';

export const INTENT_LABELS = {
  debut: 'Début des symptômes', jambe: 'Symptômes de TVP', chirurgie: 'Chirurgie récente',
  immobilisation: 'Immobilisation / mobilité', antecedents: 'Antécédents médicaux',
  douleur: 'Douleur thoracique', traitement: 'Traitements', tabac: 'Tabac',
  grossesse: 'Grossesse', syncope: 'Syncope'
};
export const NOT_DOCUMENTED = 'Cette information n’est pas précisée dans mon dossier.';

export function questionGuard(question) {
  const q = normalize(question);
  if (!q) return 'Question vide.';
  if (/\b(anesthes\w*|endormi\w*|endormie\w*|sedation)\b/.test(q)) return 'Les modalités de l’anesthésie ne sont pas précisées dans le dossier.';
  // Les interrogations négatives sont admises à condition que les moteurs soient sûrs ; ici clarification.
  // Do not reject every negative question: clinical negation is often legitimate.
  if (/\bet\b/.test(q) && q.includes('?')) return 'Pouvez-vous poser une seule question à la fois ?';
  return null;
}

export function arbitrateAnswer(clinicalCase, question, rule, rankings, thresholds = {}) {
  const { minimum = 0.70, margin = 0.08, override = 0.82, overrideMargin = 0.12 } = thresholds;
  const guard = questionGuard(question);
  if (guard) return { answer: guard, id: null, status: 'clarification', engine: 'protection', decision: 'garde-fou', ruleIntent: rule.id || null, semanticIntent: null, confidence: null, margin: null };

  const q = normalize(question);
  // Les questions sur l'immobilisation ne prouvent pas qu'une immobilisation a eu lieu.
  // C'est une intention médicale distincte du geste opératoire.
  const immobilityQuestion = /\b(mobilite|immobilis\w*|alit\w*|marche\w*|marcher|deplac\w*|bouger|bouge\w*)\b/.test(q);
  const items = new Map(clinicalCase.qa.map(item => [item.id, item]));
  const sorted = [...(rankings || [])].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const runnerUp = sorted[1];
  const gap = best ? best.score - (runnerUp?.score ?? 0) : 0;
  const confident = best && best.score >= minimum && (!runnerUp || gap >= margin);
  const diagnostic = { ruleIntent: rule.id || null, semanticIntent: best?.id || null, confidence: best?.score ?? null, margin: best ? gap : null };

  if (immobilityQuestion && !items.has('immobilisation')) {
    return { answer: NOT_DOCUMENTED, id: null, status: 'not_documented', engine: 'protection', decision: 'immobilisation non documentée', ...diagnostic };
  }
  if (immobilityQuestion && items.has('immobilisation')) {
    const item = items.get('immobilisation');
    return { answer: item.answer, id: item.id, status: 'matched', engine: 'regles', decision: 'intention mobilité explicite', ...diagnostic };
  }

  if (rule.status === 'not_documented') return { ...rule, engine: 'protection', decision: 'fait non documenté', ...diagnostic };
  if (rule.status === 'matched') {
    if (confident && best.id !== rule.id && items.has(best.id) && best.score >= override && gap >= overrideMargin && (rule.ruleScore ?? 20) <= 4) {
      const item = items.get(best.id);
      return { answer: item.answer, id: item.id, status: 'matched', engine: 'semantique', decision: 'règle faible corrigée par IA', ...diagnostic };
    }
    return { ...rule, engine: 'regles', decision: confident && best?.id === rule.id ? 'accord règles / IA' : 'règle privilégiée', ...diagnostic };
  }
  if (!confident) {
    return { answer: 'Je ne suis pas sûr de comprendre. Pouvez-vous préciser votre question ?', id: null, status: 'uncertain', engine: 'semantique', decision: best ? 'confiance ou marge insuffisante' : 'aucune intention compatible', ...diagnostic };
  }
  const item = items.get(best.id);
  if (!item) return { answer: NOT_DOCUMENTED, id: null, status: 'not_documented', engine: 'semantique', decision: 'intention identifiée sans donnée dans ce cas', ...diagnostic };
  return { answer: item.answer, id: item.id, status: 'matched', engine: 'semantique', decision: 'intention sémantique suffisamment sûre', ...diagnostic };
}
