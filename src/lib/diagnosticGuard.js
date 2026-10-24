// ClinicaAI V1.8.1 — règles pédagogiques locales et conservatrices.
// Les formulations ambiguës restent non reconnues ; aucune validation clinique autonome.
export const normalizeClinical = (text='') => String(text).normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

const splitClauses = text => String(text).split(/[.;!?\n]+|\bmais\b|\bcependant\b|\btoutefois\b/i).map(normalizeClinical).filter(Boolean);
const explicitPE = /\b(?:embolie(?:s)? pulmonaire(?:s)?|thrombo ?embolie pulmonaire|ep)\b/;
const vascularPE = /\b(?:caillot(?:s)?|thrombus|thrombose|obstruction|obstruant|bouche(?:es)?|bouchant)\b.*\b(?:arteres? pulmonaires?|vaisseaux? pulmonaires?)\b|\b(?:arteres? pulmonaires?|vaisseaux? pulmonaires?)\b.*\b(?:caillot(?:s)?|thrombus|thrombose|obstruction|obstruant|bouche(?:es)?|bouchant)\b/;
const excluded = /\b(?:n? ?exclu(?:s|e|es)?|ecarte(?:e|s|es)?|elimine(?:e|s|es)?|improbable|absence de|pas d|pas de|sans|ne .* pas|n est pas|ne serait pas|non retenu(?:e)?)\b/;
const uncertainNeg = /\b(?:n exclu(?:s|t)? pas|ne peut pas exclure|pas impossible|non exclu(?:e)?)\b/;
const affirmative = /\b(?:suspect\w*|suspicion|evoqu\w*|hypothese|probable|possible|envisag\w*|diagnostic\w*|pens\w*|compatible|pourrait|crain\w*|retrouv\w*|identifi\w*|presence|cause|obstruant)\b/;

/** Returns validated/negative/ambiguous/absent for a suspected pulmonary embolism. */
export function classifyPEDiagnosis(text) {
  for (const clause of splitClauses(text)) {
    const mentions = explicitPE.test(clause) || vascularPE.test(clause);
    if (!mentions) continue;
    if (uncertainNeg.test(clause)) return 'ambiguous';
    if (excluded.test(clause)) return 'negative';
    if (affirmative.test(clause) || vascularPE.test(clause)) return 'validated';
    return 'ambiguous';
  }
  return 'absent';
}
