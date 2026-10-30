// Trace only clinically explicit topics the learner actually asked about.
// The patient answer remains generated independently by Gemini.
const normalize=(value)=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const FR={
 debut:/\b(depuis quand|depuis combien|commenc|debut|duree|apparu|apparue)\b/,
 chirurgie:/\b(oper|chirurg|fractur|platr|immobil|intervention)\w*/,
 douleur:/\b(douleur|thorax|poitrine|mal au|mal a la)\b/,
 antecedents:/\b(antecedent|traitement|medicament|maladie|deja eu|avez vous deja)\b/,
 jambe:/\b(jambe|mollet|phlebite|thrombose|gonflement|gonfle)\b/,
 fievre:/\b(fievre|frisson|temperature)\b/
};
const EN={
 debut:/\b(when|how long|since when|started|onset|duration)\b/,
 chirurgie:/\b(surger(?:y|ies)|operat(?:ion|ed)|fracture|cast|immobiliz|immobilis|recent procedure)\b/,
 douleur:/\b(pain|chest|thorax|pleurit|hurts)\b/,
 antecedents:/\b(history|previous|before|medicat|treatment|disease|illness|condition|blood clot)\b/,
 jambe:/\b(leg|calf|swelling|thrombosis|dvt|phlebitis)\b/,
 fievre:/\b(fever|chills|temperature)\b/
};
export function historyTopicsForQuestion(clinicalCase,question,language='fr'){
 const q=normalize(question);if(!q)return [];
 const candidates=(clinicalCase.qa||[]).filter(item=>{
  if(language==='en')return EN[item.id]?.test(q)||false;
  return (FR[item.id]?.test(q)||false)||(item.patterns||[]).some(pattern=>{
   const p=normalize(pattern);return p.length>2&&q.includes(p);
  });
 });
 // Avoid broad 'treatment' matching a specific anticoagulation question as the only history concept.
 return [...new Set(candidates.map(item=>item.id))];
}
