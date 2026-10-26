// ClinicaAI V2.3.1 : banque de réponses CLINIQUES SYNTHÉTIQUES pour Mme N.
// Aucun fait clinique n'est généré par le modèle IA ; les réponses sont prédéfinies.
import bank from '../data/enrichment/ep-postop-enriched.json';
import { misleadingFeverPEAnswer } from './leadingQuestion.js';

export function normalizeClinical(text) {
  return String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9'\s]/g,' ')
    .replace(/\b(d\s+|l\s+)(?=[a-z])/g, '$1').replace(/\s+/g,' ').trim();
}
const normalizedBank = bank.entries.map(e=>({...e, aliases:e.variants.map(normalizeClinical)}));
const anatomy = {
 dos: /\b(dos|dorsal\w*|lombair\w*|omoplat\w*)\b/,
 ventre: /\b(ventre|abdom\w*|bide|estomac)\b/,
 pied: /\b(pied\w*|chevill\w*)\b/,
 mollet: /\b(mollet\w*|phlebit\w*|thrombose veineuse)\b/,
 thorax: /\b(thorax|thorac\w*|poitrin\w*|cote\s+(gauche|droit))\b/,
 genou: /\b(genou\w*|plateau tibial|cicatrice)\b/
};
const locations = Object.keys(anatomy);
const specificPain = {dos:'douleur_dorsale',ventre:'douleur_abdominale',pied:'pied_douleur',mollet:'mollet_douleur',thorax:'douleur_thoracique',genou:'genou_douleur'};
const lookup = id => normalizedBank.find(e=>e.id===id);
function classify(q){
 // Context clinique prioritaire : famille != antécédents personnels.
 if(/\b(famille|familial\w*|parents|pere|mere|proches|heredit\w*|genetiq\w*)\b/.test(q)){
  if(/\b(deces|morts?|decede|soudain)\b/.test(q))return lookup('famille_deces_soudain');
  if(/\b(phlebit\w*|thrombos\w*|embol\w*)\b/.test(q))return lookup('famille_thrombose');
  if(/\b(heredit\w*|genetiq\w*)\b/.test(q))return lookup('famille_heredite');
  if(/\b(maladi\w*|antecedent\w*|parents|proches)\b/.test(q))return lookup('famille_antecedents');
 }
 if(/\b(insomn\w*|difficultes? a dormir|mal a dormir)\b/.test(q))return lookup('sommeil_insomnie');
 if(/\b(bas du dos|bas de mon dos|bas de votre dos|lombair\w*|lombalg\w*)\b/.test(q))return lookup('douleur_bas_dos');
 if(/\b(nuque)\b/.test(q))return lookup('douleur_nuque');
 if(/\b(cou|cervical\w*)\b/.test(q) && /\b(douleur\w*|mal|fait mal|souffr\w*)\b/.test(q))return lookup('douleur_cou');
 if(/\b(bassin|hanche\w*)\b/.test(q) && /\b(douleur\w*|mal|fait mal|souffr\w*)\b/.test(q))return lookup('douleur_bassin');
 // Language-first guard for the important spontaneous phrases observed in student testing.
 if (/\b(deces|morts?|mort\s+subite|decede|deces\s+soudain)\b/.test(q) && /\b(famille|familial\w*|proches|parents|pere|mere|frere|soeur)\b/.test(q)) return lookup('famille_deces_soudain');
 if (/\b(ca va|vous allez bien|voua allez bien|comment allez vous|comment vous sentez vous|comment ca va)\b/.test(q) && !/\b(douleur|dos|mollet|ventre|pied|traitement)\b/.test(q)) return lookup('accueil');
 if (/\b(fatig\w*|epuis\w*)\b/.test(q) && /\b(march\w*|effort|deplac\w*|rapidement|vite)\b/.test(q)) return lookup('fatigue_effort');
 if(/\b(epaul\w*)\b/.test(q) && /\b(douleur\w*|mal|fait mal)\b/.test(q))return lookup('douleur_epaule');
 if(/\b(diabete|diabetique|glycemie)\b/.test(q))return lookup('diabete');
 if(/\b(enfants?|maman|mere)\b/.test(q) && /\b(avez|etes|combien|vous)\b/.test(q))return lookup('enfants');
 if(/\b(sport|sportive|activite physique)\b/.test(q))return lookup('activite_physique');
 if(/\b(choc emotionnel|chocs emotionnels|evenement stressant|stressee|frayeur)\b/.test(q))return lookup('stress_recent');
 if(/\b(antecedents|maladies|maladie chronique|deja ete malade)\b/.test(q))return lookup('antecedents_generaux');
 const hasPain=/\b(mal|douleur\w*|doulour\w*|fait mal|souffr\w*)\b/.test(q);
 if(hasPain){
  const hits=locations.filter(k=>anatomy[k].test(q));
  if(hits.length===1)return lookup(specificPain[hits[0]]);
  if(hits.length>1)return {id:'clarification_localisation',answer:'Vous voulez parler de quelle partie du corps exactement ?',teaching:'Plusieurs localisations sont mentionnées : préciser celle à explorer.',provenance:'clarification',scoringId:null};
  // Never silently turn a generic pain question into calf pain.
  return {id:'clarification_douleur',answer:'Vous voulez savoir si j’ai mal où exactement ?',teaching:'Préciser la localisation et les caractéristiques de la douleur avant de conclure.',provenance:'clarification',scoringId:null};
 }
 if(anatomy.pied.test(q)){
  if(/\b(gonfl\w*|oedem\w*|enfl\w*)\b/.test(q))return lookup('pied_oedeme');
  if(/\b(couleur|bleu\w*|rouge\w*|pale\w*)\b/.test(q))return lookup('pied_couleur');
  if(/\b(chang\w*|modif\w*|anormal\w*)\b/.test(q))return lookup('pied_modification');
 }
 return null;
}
function compatible(intent,q){
 const loc=Object.fromEntries(Object.entries(anatomy).map(([k,re])=>[k,re.test(q)]));
 // Block any fallback which maps one anatomical site to another.
 const painMap = Object.fromEntries(Object.entries(specificPain).map(([k,v])=>[v,k]));
 if(painMap[intent])return loc[painMap[intent]] || (!Object.values(loc).some(Boolean) && intent==='douleur_thoracique');
 if(intent.startsWith('pied_'))return loc.pied;
 if(intent.startsWith('mollet_'))return loc.mollet || (!Object.values(loc).some(Boolean) && /\bjambe\w*\b/.test(q));
 if(intent === 'douleur_localisation'||intent === 'douleur_duree'||intent === 'douleur_intensite')return !Object.values(loc).some(Boolean);
 return true;
}
const boundary=(q,phrase)=>(' '+q+' ').includes(' '+phrase+' ');
function candidates(q){
 const found=[];
 for(const item of normalizedBank){
  if(!compatible(item.id,q))continue;
  for(const alias of item.aliases){
   if(alias && boundary(q,alias)){
    const tokens=alias.split(' ').length;
    found.push({item,alias,score:tokens*10+alias.length/100});
   }
  }
 }
 return found.sort((a,b)=>b.score-a.score);
}
const followupRe=/^(et |mais |alors |cela |ca |c'est |est ce |depuis quand|combien de temps|ou exactement|a quel endroit|de quel cote|est ce douloureux|et la nuit|et au repos)/;
function contextual(question,previous){
 if(!previous || !followupRe.test(question))return null;
 if(/\b(depuis quand|combien de temps|quand cela|quand ca)\b/.test(question) && previous.startsWith('douleur_'))return lookup('douleur_duree');
 if(/\b(ou exactement|quel endroit|quel cote|localis)/.test(question) && previous.startsWith('douleur_'))return lookup('douleur_localisation');
 if(/\b(au repos|sans bouger)\b/.test(question) && previous.startsWith('dyspnee_'))return lookup('dyspnee_repos');
 return null;
}
// Mémoire conversationnelle courte et éphémère : calculée à partir du chat affiché,
// jamais persistée dans localStorage ni envoyée sur un serveur.
export function dialogueContext(chat=[]){
 const last=chat.slice().reverse().find(m=>m.role==='patient' && m.debug?.intent);
 return {previousIntent:last?.debug?.intent??null, lastQuestion: [...chat].reverse().find(m=>m.role==='student')?.text??'', lastResponse:last?.text??''};
}
function localContinuation(q,context){
 q=q.replace(/'/g,' ').replace(/\s+/g,' ').trim();
 const previous=String(context?.previousIntent||'');
 const lastQ=normalizeClinical(context?.lastQuestion||'');
 const painContext=/douleur|clarification_douleur|jambe|mollet|pied/.test(previous)||/mal|douleur|jambes|cou|bassin/.test(lastQ);
 // La patiente a demandé une localisation ; la clarification reste active.
 const pendingLocation=/clarification_douleur|clarification_localisation/.test(previous)||/ou exactement|ou|partie du corps/.test(normalizeClinical(context?.lastResponse||''))&&/douleur|mal/.test(lastQ);
 if((painContext||pendingLocation) && /^(aux?|dans|sur|les|a la|a l) (pieds?|mollets?|dos|ventre|epaules?|genoux?|thorax|poitrine|nuque|cou|bassin|bas du dos|haut du dos)( |$)/.test(q)){
  if(/pied/.test(q))return lookup('pied_douleur_suivi')||lookup('pied_douleur');
  if(/mollet/.test(q))return lookup('mollet_douleur_suivi')||lookup('mollet_douleur');
  if(/epaule/.test(q))return lookup('douleur_epaule');
  if(/nuque/.test(q))return lookup('douleur_nuque');
  if(/\bcou\b/.test(q))return lookup('douleur_cou');
  if(/bassin/.test(q))return lookup('douleur_bassin');
  if(/bas du dos/.test(q))return lookup('douleur_bas_dos');
  const names={dos:'douleur_dorsale',ventre:'douleur_abdominale',genou:'genou_douleur',thorax:'douleur_thoracique',poitrine:'douleur_thoracique'};
  for(const [k,id] of Object.entries(names)){if(q.includes(k))return lookup(id)}
 }
 if(/^(depuis quand|combien de temps|ca a commence quand|cela a commence quand)\??$/.test(q)){
  if(/dyspnee|essouff/.test(previous))return lookup('dyspnee_debut')||null;
  if(/douleur_dorsale|douleur_thoracique/.test(previous))return lookup('douleur_duree_precision');
  // No duration inference for a generic or unspecified symptom.
 }
 return null;
}
export function enrichedAnswer(clinicalCase,question,previousIntent=null){
 const context=previousIntent&&typeof previousIntent==='object'?previousIntent:{previousIntent};
 if(clinicalCase?.id!=='ep-postop')return null;
 const special=misleadingFeverPEAnswer(clinicalCase.id,question);
 if(special)return {...special,teaching:'Une absence de fièvre ne permet pas d’éliminer une embolie pulmonaire.',provenance:'fiction_pedagogique',intent:'fievre'};
 const q=normalizeClinical(question);
 if(!q)return null;
 let hit=localContinuation(q,context),how='mémoire conversationnelle';
 if(!hit){hit=classify(q);how='désambiguïsation clinique';}
 if(!hit){hit=contextual(q,context.previousIntent);how='suivi contextuel';}
 if(!hit){hit=candidates(q)[0]?.item;how='banque clinique';}
 if(!hit)return null;
 return {answer:hit.answer,id:hit.scoringId??null,engine:'scenario_enrichi',status:'matched',decision:how,
  teaching:hit.teaching,provenance:hit.provenance,intent:hit.id,
  candidates:candidates(q).slice(0,3).map(x=>x.item.id)};
}
export function enrichedTutor(ans){
 if(!ans)return null;
 return {type:'enriched',label:ans.provenance==='clarification' || ans.intent==='pied_modification'?'Question à préciser':ans.intent==='accueil'?'Accueil de consultation':'Question pertinente · scénario clinique',
   documented:ans.provenance!=='clarification',undocumented:ans.provenance==='clarification',
   explanation:ans.teaching + (ans.provenance==='fiction_pedagogique'?' (Donnée de simulation à vérifier par rapport à la source initiale.)':''),
   followUp:ans.intent==='pied_modification'?'Parlez-vous d’un gonflement, d’une douleur ou d’une couleur anormale ?':null};
}
export const enrichmentStatistics = {intents:bank.entries.length,formulations:bank.entries.reduce((n,x)=>n+x.variants.length,0)};
