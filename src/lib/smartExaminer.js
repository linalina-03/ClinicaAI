// V1.8 : correction assistée par embeddings locaux, SANS génération de texte ni jugement médical autonome.
import { gradeCase, normalise } from './examinerEngine';
import { loadSemanticModel } from './semanticEngine';
import { classifyPEDiagnosis } from './diagnosticGuard';

const ALIASES = {
 stability: ['controle des constantes vitales', 'mesurer la tension et le pouls', 'evaluer l etat circulatoire'],
 risk: ['score de wells', 'score de geneve', 'estimation du risque pre test'],
 shock: ['etat de choc circulatoire', 'patient hemodynamiquement instable'],
 critical: ['admission en soins intensifs', 'prevenir le reanimateur', 'monitorage continu'],
 pe: ['suspicion de thromboembolie pulmonaire', 'caillot dans les arteres pulmonaires', 'embolie des poumons'],
 high: ['embolie pulmonaire a haut risque', 'embolie massive avec choc'],
 anticoag: ['traitement par heparine', 'debuter une anticoagulation curative'],
 anti: ['traitement par heparine', 'debuter une anticoagulation curative'],
 contra: ['rechercher des saignements et contre indications', 'evaluer le risque de saignement'],
 reperf: ['discuter une fibrinolyse en urgence', 'traitement de reperfusion pour choc'],
 reperfusion: ['discuter une fibrinolyse en urgence', 'traitement de reperfusion pour choc'],
 stratify: ['evaluation du ventricule droit et biomarqueurs', 'stratification du risque intermediaire'],
 monitor: ['surveillance rapprochee et reevaluation', 'monitorage clinique continu'],
 ic: ['decompensation de l insuffisance cardiaque', 'insuffisance ventriculaire gauche'],
 multiple: ['diagnostics multiples possibles', 'penser aussi a une insuffisance cardiaque'],
 reassess: ['reevaluer regulierement le patient', 'adapter la conduite selon l evolution'],
 pregnancy: ['prise en charge adaptee a la grossesse', 'avis obstetrical urgent']
};
const CRITICAL = new Set(['anticoag','anti','reperf','reperfusion','contra','shock','critical','pregnancy']);
const NEG = /\b(pas|sans|jamais|aucun|aucune|refuse|eviter|contre indique|ne|ni|exclure)\b/;
const clauses = value => normalise(value).split(/\b(?:mais|cependant|toutefois|par contre)\b|[.;!?\n]+/).filter(Boolean);
const cosine=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
let cachePromise;
async function vectorsFor(rubric){
 const key=JSON.stringify(rubric);
 if (!cachePromise) cachePromise=new Map();
 if(cachePromise.has(key)) return cachePromise.get(key);
 const p=(async()=>{
  const model=await loadSemanticModel();
  const list=['triage','diagnosis','management'].flatMap(section=>rubric[section].flatMap(rule=>{
   const texts=[...(ALIASES[rule.id]||[]),...rule.groups.map(g=>g.join(' '))].filter(s=>s.length>9);
   return texts.map(text=>({section,id:rule.id,text}));
  }));
  if(!list.length)return {model,list};
  const out=await model(list.map(x=>x.text),{pooling:'mean',normalize:true});
  const dim=out.dims.at(-1);
  return {model,list:list.map((x,i)=>({...x,vec:Array.from(out.data.slice(i*dim,(i+1)*dim))}))};
 })();
 cachePromise.set(key,p);return p;
}

export async function gradeCaseSmart(clinicalCase,rubric,visited,tests,sections,enabled=false){
 const base=gradeCase(clinicalCase,rubric,visited,tests,sections);
 const diagnostics={};
 // Repérage sûr de synonymes EP, sans dépendre du seuil vectoriel.
 // Contrôle également une négation explicite que l'ancien moteur pouvait mal classer.
 const peStatus=classifyPEDiagnosis(sections.diagnosis||'');
 const peRule=rubric.diagnosis?.find(x=>x.id==='pe');
 const peItem=base.report.diagnosis.items.find(x=>x.id==='pe');
 if(peRule&&peItem){
  const was=peItem.points;
  peItem.found=peStatus==='validated';
  peItem.points=peItem.found?peItem.max:0;
  base.report.diagnosis.score+=peItem.points-was;
  base.subtotal+=peItem.points-was;
  base.total=Math.max(0,Math.min(100,base.total+peItem.points-was));
  peItem.method=peStatus==='validated'?'synonyme medical valide':peStatus==='negative'?'negation detectee':peStatus==='ambiguous'?'formulation ambiguë':'non reconnu';
 }
 for(const key of ['triage','diagnosis','management'])for(const item of base.report[key].items){
  if(!item.method)item.method=item.found?'regle':'non reconnu';item.confidence=null;
 }
 if(!enabled)return {...base,examinerMode:'regles',diagnostics};
 try{
  const {model,list}=await vectorsFor(rubric);
  const result={...base,report:structuredClone(base.report),penalties:[...base.penalties]};
  let awarded=0;
  for(const section of ['triage','diagnosis','management']){
   const answer=String(sections[section]||'');
   for(const item of result.report[section].items){
    if(item.found)continue;
    // Les décisions thérapeutiques critiques ne sont PAS validées sur seule proximité vectorielle.
    if(item.id==='pe'){continue;} // Diagnostic EP attribué uniquement via formulation explicite/synonyme validé.
    if(CRITICAL.has(item.id)){item.method='verification manuelle necessaire';continue;}
    const available=list.filter(x=>x.section===section&&x.id===item.id);
    if(!available.length)continue;
    let best=-1;
    for(const clause of clauses(answer)){
     if(NEG.test(clause)||clause.length<16)continue;
     const tensor=await model([clause],{pooling:'mean',normalize:true});
     const v=Array.from(tensor.data); for(const example of available)best=Math.max(best,cosine(v,example.vec));
    }
    item.confidence=best<0?null:best;
    if(best>=0.81){item.found=true;item.points=item.max;item.method='semantique (a verifier)';awarded+=item.max}
    else item.method='non reconnu (seuil 0,81)';
   }
   result.report[section].score=result.report[section].items.reduce((n,x)=>n+x.points,0);
  }
  result.subtotal=base.subtotal+awarded;
  result.total=Math.max(0,Math.min(100,base.total+awarded));
  result.examinerMode='hybride';
  result.limitation='Note expérimentale. Les décisions critiques sont contrôlées par les règles; les correspondances sémantiques peuvent produire des faux positifs. Le résultat ne remplace pas une correction par un enseignant.';
  return result;
 }catch(error){return {...base,examinerMode:'regles (secours)',limitation:'IA indisponible : barème déterministe appliqué. '+base.limitation}}
}
