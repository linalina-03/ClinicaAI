// ClinicaAI V1.6 — embeddings exécutés côté navigateur, sans API commerciale.
// Les réponses sont extraites des JSON, jamais générées par le modèle.
import { normalize, patientAnswer } from './patientEngine';
import { misleadingFeverPEAnswer } from './leadingQuestion.js';
import { arbitrateAnswer } from './arbitrationEngine';

export const MODEL_ID = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
const EXAMPLES = {
  debut: ['A quel moment les symptomes ont ils commence ?', 'Depuis combien de jours etes vous essouffle ?', 'Quand cette gene est elle apparue ?'],
  jambe: ['Avez vous ressenti une douleur au mollet ?', 'Votre jambe est elle gonflee ?', 'Votre cuisse vous fait elle mal ?'],
  chirurgie: ['Avez vous ete opere recemment ?', 'Avez vous subi une intervention chirurgicale ?', 'Une fracture a t elle necessite une operation ?'],
  immobilisation: ['Avez vous ete alite plusieurs jours ?', 'Avez vous pu marcher normalement ?', 'Avez vous ete immobilise ?'],
  antecedents: ['Souffrez vous de maladies chroniques ?', 'Quels sont vos antecedents medicaux ?', 'Avez vous une maladie du coeur ?'],
  douleur: ['Avez vous mal a la poitrine ?', 'Comment est votre douleur thoracique ?', 'Avez vous une oppression dans le thorax ?'],
  traitement: ['Quels medicaments prenez vous ?', 'Quel est votre traitement habituel ?', 'Prenez vous des comprimes ?'],
  tabac: ['Fumez vous des cigarettes ?', 'Consommez vous du tabac ?'],
  grossesse: ['A combien de semaines de grossesse etes vous ?', 'Etes vous enceinte ?', 'Quel est le terme de votre grossesse ?'],
  syncope: ['Avez vous perdu connaissance ?', 'Vous etes vous evanouie ?', 'Avez vous fait un malaise avec perte de connaissance ?'],
};


// Bilingual intent examples. Both languages use the same multilingual embedding model.
const EN_EXAMPLES = {
  debut: ['When did your symptoms start?', 'How long have you been short of breath?'],
  jambe: ['Does your calf hurt?', 'Is your leg swollen?'],
  chirurgie: ['Have you had surgery recently?', 'Were you operated on after your fracture?'],
  immobilisation: ['Have you been immobilized?', 'Have you been able to walk since surgery?'],
  antecedents: ['Do you have any past medical history?', 'Do you suffer from chronic diseases?'],
  douleur: ['Do you have chest pain?', 'Is your chest painful when breathing?'],
  traitement: ['What medication do you take?', 'Are you taking any prescribed drugs?'],
  tabac: ['Do you smoke?', 'Have you smoked cigarettes?'],
  grossesse: ['Are you pregnant?', 'How many weeks pregnant are you?'],
  syncope: ['Have you fainted?', 'Did you lose consciousness?']
};
const EN_UNKNOWN = 'This information is not specified in the case.';
const EN_CLARIFY = 'Could you clarify your question?';

let extractorPromise = null;
const vectorsByCase = new Map();

export async function loadSemanticModel() {
  if (typeof window === 'undefined') throw new Error('Ce modèle doit être chargé dans le navigateur.');
  if (!extractorPromise) {
    extractorPromise = import('@huggingface/transformers').then(async ({ pipeline, env }) => {
      env.allowLocalModels = false;
      const extractor = await pipeline('feature-extraction', MODEL_ID, { dtype: 'q8' });
      return extractor;
    }).catch(error => { extractorPromise = null; throw error; });
  }
  return extractorPromise;
}

async function embed(extractor, texts) {
  const result = await extractor(texts, { pooling: 'mean', normalize: true });
  return Array.from({ length: texts.length }, (_, i) => Array.from(result.data.slice(i * result.dims.at(-1), (i + 1) * result.dims.at(-1))));
}
function cosine(a, b) { return a.reduce((s, x, i) => s + x * b[i], 0); }
function guard(question, intent) {
  const q = normalize(question);
  // Les embeddings ne font pas une détection sûre des négations.
  if (/\b(ne|pas|jamais|aucun|sans)\b/.test(q)) return false;
  if (intent === 'jambe' && /\b(oper|opere|operation|chirurg|fracture|platre)\w*/.test(q)) return false;
  if (intent === 'chirurgie' && /\b(douleur|mal|gonfle|oedeme|mollet)\b/.test(q) && !/\b(oper|opere|operation|chirurg)\w*/.test(q)) return false;
  if (intent === 'antecedents' && /\b(medicament|traitement|comprime|prenez)\b/.test(q)) return false;
  if (intent === 'traitement' && /\b(antecedent|maladie chronique)\b/.test(q)) return false;
  return true;
}
export async function prepareSemanticCase(clinicalCase) {
  const key = clinicalCase.id;
  if (vectorsByCase.has(key)) return;
  const extractor = await loadSemanticModel();
  const list = [...clinicalCase.qa, ...Object.keys(EXAMPLES).filter(id => !clinicalCase.qa.some(item => item.id === id)).map(id => ({ id, patterns: [] }))].flatMap(item => {
    // Éviter d'indexer uniquement des mots isolés quand on peut indexer des questions naturelles.
    const sentences = [...(EXAMPLES[item.id] || []), ...(EN_EXAMPLES[item.id] || []), ...(item.patterns || []).filter(p => p.split(' ').length >= 3).map(p => `Est ce que ${p} ?`)];
    return (sentences.length ? sentences : [`Pouvez vous me parler de ${item.id} ?`]).map(text => ({ id: item.id, text }));
  });
  const vectors = await embed(extractor, list.map(entry => entry.text));
  vectorsByCase.set(key, list.map((entry, i) => ({ ...entry, vector: vectors[i] })));
}
export async function semanticPatientAnswer(clinicalCase, question, language = 'fr') {
  const isEnglish = language === 'en';
  const special=misleadingFeverPEAnswer(clinicalCase.id,question,language);
  if(special)return {...special,semanticIntent:'fievre',confidence:1};
  const rule = isEnglish ? null : patientAnswer(clinicalCase, question);
  const q = String(question || '').trim();
  if (!q || q.length > 350) return isEnglish ? {answer:EN_CLARIFY,id:null,engine:'semantique',decision:'invalid input'} : { ...rule, engine: 'regles', decision: 'question vide ou trop longue' };
  if (isEnglish && /\b(not|never|without|no|neither|nor|don't|doesn't|didn't)\b/i.test(q)) return {answer:EN_CLARIFY,id:null,engine:'semantique',decision:'negation requires clarification'};
  // L'arbitrage voit dorénavant les deux candidats, même si une règle répond.
  await prepareSemanticCase(clinicalCase);
  const extractor = await loadSemanticModel();
  const [vector] = await embed(extractor, [q]);
  const bestById = new Map();
  for (const candidate of vectorsByCase.get(clinicalCase.id)) {
    if (!guard(q, candidate.id)) continue;
    const score = cosine(vector, candidate.vector);
    bestById.set(candidate.id, Math.max(score, bestById.get(candidate.id) ?? -1));
  }
  const ranks = [...bestById.entries()].map(([id, score]) => ({ id, score })).sort((a,b) => b.score-a.score);
  if (isEnglish) {
    const best = ranks[0], second = ranks.find(x => x.id !== best?.id);
    const gap = best ? best.score - (second?.score ?? 0) : 0;
    const fact = clinicalCase.qa.find(x => x.id === best?.id);
    if (!best || best.score < .70 || (second && gap < .08)) return {answer:EN_CLARIFY,id:null,semanticIntent:best?.id||null,confidence:best?.score??null,engine:'semantique',decision:'low confidence'};
    return {answer:fact?.answer_en || EN_UNKNOWN,id:fact?.id||null,semanticIntent:best.id,confidence:best.score,engine:'semantique',decision:fact?'matched bilingual intent':'fact not documented'};
  }
  return arbitrateAnswer(clinicalCase, q, rule, ranks);
}
