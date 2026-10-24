// V2.2 : tuteur pédagogique déterministe, autonome et explicable.
// La similarité sémantique reste gérée par semanticEngine.js (V1.7).
// Ne jamais assimiler « non reconnu » à « inutile ».
const norm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9'\s]/g,' ').replace(/\s+/g,' ').trim();
const has = (s, re) => re.test(s);

export function assessQuestion(question, clinicalCase={}) {
  const q=norm(question);
  // Dans les scénarios actuels, le sommeil/orthopnée ne dispose pas d'une réponse vérifiée.
  // Même lorsqu'une règle clinique infère une réponse, ne pas la présenter comme un fait.
  if (has(q, /\b(dormir|dormez|dors|sommeil|nuits?|reveill|allong|couch|oreiller|orthopn|nocturn)\w*\b/)) {
    return {
      type:'relevant_undocumented',label:'Question pertinente · donnée absente',
      documented:false,undocumented:true,
      explanation:'Explorer le sommeil et les symptômes en position couchée aide à caractériser une dyspnée. Le scénario ne documente pas cette information : elle ne doit pas être inventée.',
      followUp:'La gêne augmente-t-elle quand vous êtes allongée ? Vous réveille-t-elle la nuit ?'
    };
  }
  if (has(q, /\b(immobilis\w*|alite\w*|lit|mobilite|marche\w*|deplacement)\b/)) {
    return {type:'relevant_undocumented',label:'Question pertinente · donnée à vérifier',documented:false,undocumented:false,
      explanation:'L’immobilisation et la réduction de mobilité peuvent modifier le risque thromboembolique. Ne déduis pas la durée d’alitement d’une intervention chirurgicale.',
      followUp:'Depuis votre opération, pouviez-vous marcher ?'};
  }
  if (has(q, /\b(douleur\w*|gonfl\w*|mollet|jambe|phlebite|thrombose)\b/)) {
    return {type:'relevant',label:'Question clinique pertinente',documented:true,undocumented:false,
      explanation:'Recherche de signes évoquant une thrombose veineuse profonde associée à l’embolie pulmonaire.',
      followUp:'Avez-vous remarqué une douleur ou un gonflement d’un seul mollet ?'};
  }
  if (has(q, /\b(operation|opere\w*|chirurg\w*|fracture|hospitalis\w*)\b/)) {
    return {type:'relevant',label:'Question clinique pertinente',documented:true,undocumented:false,
      explanation:'Les interventions récentes peuvent être des facteurs de risque thromboembolique.',followUp:'À quelle date l’intervention a-t-elle eu lieu ?'};
  }
  if (has(q, /\b(essouffl\w*|dyspnee|respir\w*|souffle|debut|commenc\w*)\b/)) {
    return {type:'relevant',label:'Question clinique pertinente',documented:true,undocumented:false,
      explanation:'La chronologie, l’intensité et les circonstances de la dyspnée orientent le raisonnement clinique.',followUp:'Les symptômes sont-ils apparus brutalement ou progressivement ?'};
  }
  if (has(q, /\b(anticoagul\w*|traitement\w*|medicament\w*|pilule)\b/)) {
    return {type:'relevant',label:'Question clinique pertinente',documented:true,undocumented:false,
      explanation:'Les traitements en cours aident à évaluer les risques, les interactions et les contre-indications.',followUp:null};
  }
  if (has(q, /\b(fievre|temperature|toux|hemoptysie|sang|syncope|malaise)\b/)) {
    return {type:'relevant',label:'Question clinique pertinente',documented:true,undocumented:false,
      explanation:'Cette question recherche des signes associés, des diagnostics différentiels ou des critères de gravité.',followUp:null};
  }
  return {type:'unassessed',label:'Pertinence non déterminée',documented:false,undocumented:false,
    explanation:'Le système ne reconnaît pas encore assez bien cette question pour juger de sa pertinence. Cela ne veut pas dire qu’elle est inutile ou médicalement incorrecte.',
    followUp:'Reformulez si nécessaire, ou discutez de cette question avec un enseignant.'};
}
