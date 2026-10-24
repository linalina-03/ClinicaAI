// Offline English patient replies. Uses the same case IDs and facts as French.
// No translation API and no generated clinical facts.
import enriched from '../data/enrichment/ep-postop-enriched.json';
const terms = {
 debut:/since when|how long.*(breath|symptom|pain)|when.*(symptom|breath).*start|onset|duration of symptoms|symptoms.*start/i,
 chirurgie:/surger|operat|fractur|knee surgery/i,
 jambe:/leg|thigh|calf|phlebitis|deep vein thrombosis|dvt/i,
 immobilisation:/immobil|bed rest|bedridden|walk.*after/i,
 antecedents:/medical history|past medical|chronic illness|heart condition|hypertension/i,
 douleur:/chest pain|chest discomfort|pleuritic|thorax|tightness in.*chest/i,
 traitement:/medication|medicine|prescription|medicines|tablets/i,
 motif:/bring.*(today|hospital|emergency)|reason.*(visit|coming)|what.*wrong|main complaint/i,
 dyspnee_evolution:/breath.*(wors|progress)|gotten worse/i,
 dyspnee_repos:/breath.*(rest|sitting|lying still)/i,
 dyspnee_effort:/breath.*(exercise|walking|exertion)|walking.*breath/i,
 sommeil:/sleep|insomnia|at night/i,
 orthopnee:/lie flat|lying down|orthopnea/i,
 douleur_dorsale:/upper back|back pain/i,
 douleur_bas_dos:/lower back|low back/i,
 douleur_cou:/neck pain|pain.*neck/i,
 douleur_nuque:/nape|back of.*neck/i,
 douleur_epaule:/shoulder/i,
 douleur_abdominale:/abdom|stomach ache|belly pain/i,
 douleur_thoracique:/chest pain|chest discomfort|pain.*chest|thorax/i,
 douleur_pleuretique:/pain.*(deep breath|inhal|cough)|breath.*pain/i,
 douleur_bassin:/pelvis|pelvic pain/i,
 douleur_duree:/how long.*pain|pain.*last/i,
 toux:/cough/i,
 hemoptysie:/cough.*blood|haemoptysis|hemoptysis/i,
 fievre:/fever|chill/i,
 syncope:/faint|pass out|loss of consciousness|syncope/i,
 palpitations:/palpitation|heart racing|heart beat/i,
 mollet_douleur:/calf pain|pain.*calf/i,
 mollet_oedeme:/swollen calf|calf.*swoll/i,
 pied_douleur:/foot pain|feet hurt|pain.*feet|pain.*foot/i,
 pied_oedeme:/swollen (feet|foot)|feet.*swoll/i,
 genou_douleur:/knee pain|pain.*knee/i,
 mobilite:/mobil|crutch|walk.*(after|surgery)|immobil/i,
 anticoagulant:/blood thinner|anticoagul/i,
 medicaments:/medication|medicine|drug|prescription/i,
 allergies:/allerg/i,
 antecedent_thrombose:/ever.*(clot|thrombo|dvt|pulmonary embol)|previous.*(clot|thrombo|dvt|pulmonary embol)/i,
 famille_thrombose:/family.*(clot|dvt|thrombo|pulmonary embol)/i,
 famille_heredite:/heredit|inherited.*family|genetic.*family/i,
 famille_antecedents:/family history|disease.*family|relatives.*ill/i,
 famille_deces_soudain:/sudden death.*family/i,
 grossesse:/pregnan/i,
 contraception:/contracept|birth control|pill/i,
 postpartum:/recently given birth|postpartum/i,
 voyage:/travel|long flight|long drive|journey/i,
 tabac:/smok|cigarette/i,
 alcool:/alcohol|drink/i,
 cancer:/cancer/i,
 maladie_coeur:/heart disease|cardiac disease/i,
 asthme_bpco:/asthma|copd|chronic lung/i,
 diabete:/diabet/i,
 activite_physique:/sport|physical activity|exercise regularly/i,
 enfants:/children|kids|sons|daughters/i,
 stress_recent:/emotional shock|recent stress/i,
 fatigue_effort:/fatigue|tired.*(walk|quick)|exhaust/i,
 antecedents_generaux:/medical history|chronic illness|previous disease|other conditions/i,
 douleur_localisation:/where.*(pain|hurt)|location.*pain/i,
 accueil:/hello|how are you|are you okay/i
};
const aliases={start:'debut',antecedents:'antecedents_generaux',douleur:'douleur_localisation',jambe:'mollet_douleur',grossesse:'grossesse'};
export function englishPatientAnswer(clinicalCase, question){
 const q=(question||'').trim();
 if(!q)return {answer:'Could you repeat your question?',id:null,engine:'offline-en'};
 const enrich=clinicalCase.id==='ep-postop';
 if(enrich){
  // Prioritize anatomical specificity before generic pain and cough.
  const priority=['douleur_bas_dos','douleur_cou','douleur_nuque','douleur_epaule','douleur_abdominale','pied_douleur','pied_oedeme','mollet_douleur','mollet_oedeme','douleur_pleuretique','antecedent_thrombose','famille_thrombose','famille_heredite','famille_antecedents','famille_deces_soudain'];
  const match=priority.find(id=>terms[id]?.test(q))||Object.keys(terms).find(id=>terms[id].test(q));
  const fact=enriched.entries.find(f=>f.id===match);
  if(fact)return {answer:fact.answer_en,id:fact.scoringId||fact.id,engine:'offline-en',intent:fact.id,tutor:{label:'Relevant question · enriched scenario',explanation:fact.teaching_en,documented:true}};
 }
 for(const item of clinicalCase.qa||[]){
  const id=aliases[item.id]||item.id;
  if(terms[item.id]?.test(q)||terms[id]?.test(q))return {answer:item.answer_en||'This detail is not specified in the case.',id:item.id,engine:'offline-en',tutor:{label:'Clinical question',explanation:'This answer is based on the documented teaching case.',documented:true}};
 }
 return {answer:'I do not have precise information about that in this case. Could you ask a more specific question?',id:null,engine:'offline-en',undocumented:true};
}
