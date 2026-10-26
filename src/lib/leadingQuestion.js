// Shared, scenario-specific response to a misleading diagnostic inference.
// Patient facts are sourced from the same educational case in both modules.
const normalize = (text = '') => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const FR = 'Non, je n’ai pas eu de fièvre ni de frissons. Mais je ne sais pas si cela suffit à exclure une embolie pulmonaire : c’est au médecin de l’évaluer.';
const EN = 'No, I have not had fever or chills. But I do not know whether that rules out a pulmonary embolism. The doctor needs to assess that.';

export function misleadingFeverPEAnswer(caseId, question, language = 'fr') {
  if (caseId !== 'ep-postop') return null;
  const q = normalize(question);
  const fever = /\b(fievre|febrile|fever|temperature)\b/.test(q);
  const pe = /\b(embolie pulmonaire|pulmonary embolism|pulmonary embolus|ep|pe)\b/.test(q);
  const exclusion = /\b(exclu\w*|ecart\w*|elimin\w*|impossib\w*|rules? out|rule out|exclude\w*|excluded|cannot be|cant be|not possible)\b/.test(q);
  if (!fever || !pe || !exclusion) return null;
  return { answer: language === 'en' ? EN : FR, id: 'fievre', status: 'matched', engine: 'clinical-safety', decision: 'clinical inference not validated by absent fever' };
}
