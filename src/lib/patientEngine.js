// ClinicaAI V1.2 — dialogue local sans API, fondé uniquement sur les fiches JSON.
export function normalize(text = '') {
  return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// Les expressions ont une intention précise : une intervention sur la jambe
// ne doit pas être confondue avec une douleur de jambe.
const INTENTS = {
  debut: ['depuis quand', 'quand cela a commence', 'quand avez vous commence', 'apparition des symptomes', 'debut des symptomes', 'depuis combien de temps', 'depuis quand essouffle', 'depuis quand mal'],
  jambe: ['douleur au mollet', 'mal au mollet', 'mollet douloureux', 'mollet gonfle', 'jambe gonflee', 'jambe enflee', 'douleur dans la jambe', 'mal a la jambe', 'signes de phlebite', 'thrombose veineuse', 'phlebite', 'oedeme jambe'],
  chirurgie: ['operation', 'operee', 'opere', 'chirurgie', 'intervention chirurgicale', 'fracture', 'platre', 'operation de la jambe', 'chirurgie du genou'],
  immobilisation: ['alitement', 'immobilise', 'immobilisation', 'reste au lit', 'mobilite reduite', 'pouvez vous marcher', 'avez vous marche'],
  antecedents: ['antecedents', 'atcd', 'maladies chroniques', 'maladie cardiaque', 'maladies connues', 'hypertension', 'diabete', 'insuffisance cardiaque', 'dyslipidemie'],
  douleur: ['douleur thoracique', 'douleur poitrine', 'douleur dans la poitrine', 'mal a la poitrine', 'mal au thorax', 'oppression thoracique', 'point de cote', 'douleur en respirant', 'gene thoracique'],
  tabac: ['fumez', 'fumeur', 'tabac', 'cigarette', 'paquet par jour'],
  traitement: ['medicaments', 'medicament', 'traitement habituel', 'quels traitements', 'ordonnance', 'quels comprimes', 'que prenez vous']
};
const KEYWORD = {
  debut: ['debut', 'commence', 'apparu', 'duree', 'evolue'],
  jambe: ['mollet', 'phlebite', 'oedeme'],
  chirurgie: ['chirurgie', 'operation', 'opere', 'fracture', 'platre'],
  immobilisation: ['alitement', 'immobilise', 'immobilisation', 'mobilite'],
  antecedents: ['antecedent', 'diabete', 'hypertension', 'dyslipidemie'],
  douleur: ['thorax', 'thoracique', 'poitrine', 'oppression'],
  tabac: ['tabac', 'cigarette', 'fumeur', 'fumez'],
  traitement: ['medicament', 'traitement', 'ordonnance', 'comprimes']
};
const STOP = new Set(['avez','vous','une','des','est','elle','quel','quelle','quels','sont','etes','pour','dans','votre','sur','avec','depuis','quand','comment','ce','que','les','aux','une','ete','avez','subi','fait']);
function words(text) {return normalize(text).split(' ').filter(x=>x.length>2 && !STOP.has(x));}
function editDistanceOne(a,b) {
  if(Math.abs(a.length-b.length)>1) return false;
  let i=0,j=0,d=0;
  while(i<a.length && j<b.length) {
    if(a[i]===b[j]) {i++;j++;continue;}
    if(++d>1)return false;
    if(a.length>b.length)i++;else if(a.length<b.length)j++;else{i++;j++;}
  }
  return d+(a.length-i)+(b.length-j)<=1;
}
function matchesWord(token, pattern) {
  return token===pattern || (pattern.length>=6 && (token.startsWith(pattern) || editDistanceOne(token,pattern)));
}
function hitsPhrase(q,phrase) {return (' '+q+' ').includes(' '+normalize(phrase)+' ');}
function intentScore(q, id, patterns) {
  const tokens=words(q);
  let score=0;
  for(const phrase of [...(INTENTS[id]||[]),...patterns]) {
    const p=normalize(phrase);
    if(!p)continue;
    if(p.includes(' ')) {if(hitsPhrase(q,p))score=Math.max(score,10+p.split(' ').length);}
    else if(tokens.some(t=>matchesWord(t,p)))score=Math.max(score,4);
  }
  for(const word of KEYWORD[id]||[]) {
    if(tokens.some(t=>matchesWord(t,word)))score=Math.max(score,3);
  }
  // Les formulations sur une hospitalisation/intervention ne désignent pas une phlébite.
  const surgicalContext = /\b(oper\w*|operation\w*|chirurg\w*|fractur\w*|platr\w*|intervention\w*|bloc operatoire|hospitalis\w* pour|hospitalis\w* en vue)\b/.test(q);
  if(id==='jambe' && surgicalContext)score=0;
  if(id==='chirurgie' && surgicalContext)score+=12;
  // L'indice 'intervention' seul ne prouve rien, il est pris dans le contexte de chirurgie.
  if(id==='chirurgie' && /\b(intervention|hospitalis\w*)\b/.test(q) && /\b(jambe|genou|operation|bloc|chirurg|fracture)\b/.test(q))score=Math.max(score,14);
  // « prenez-vous un traitement pour le diabète ? » : traitement, pas antécédents.
  if(id==='antecedents' && /\b(medicament|traitement|comprime|prenez)\b/.test(q))score=0;
  if(id==='traitement' && /\b(medicament|traitement|comprime|prenez)\b/.test(q))score+=6;
  // Une question sur la douleur au mollet n'est pas une douleur thoracique.
  if(id==='douleur' && /\b(mollet|jambe|genou)\b/.test(q) && !/\b(thorax|thoracique|poitrine)\b/.test(q))score=0;
  // « depuis quand » associé à un autre thème correspond surtout à la durée.
  if(id!=='debut' && /\bdepuis quand\b/.test(q))score=Math.max(0,score-2);
  return score;
}
export function patientAnswer(clinicalCase, question) {
  const raw=String(question||'').trim().slice(0,350);
  if(!raw)return {answer:'Pouvez-vous reformuler votre question ?',id:null,status:'empty'};
  const q=normalize(raw);
  // Le cas confirme une opération, mais pas nécessairement le mode d'anesthésie.
  // Ne pas prétendre savoir si la patiente a été endormie.
  if(/\b(anesthes\w*|endormi\w*|endormie\w*|sedation)\b/.test(q)) {
    return {answer:'Le dossier ne précise pas les modalités de l’anesthésie.',id:null,status:'not_documented'};
  }
  const results=clinicalCase.qa.map(item=>({item,score:intentScore(q,item.id,item.patterns||[])}))
    .filter(x=>x.score>=3).sort((a,b)=>b.score-a.score);
  if(!results.length)return {answer:'Cette information n’est pas documentée dans ce cas. Pouvez-vous poser une autre question ?',id:null,status:'unknown'};
  if(results.length>1 && results[0].score===results[1].score)
    return {answer:'Pouvez-vous préciser votre question ? Je ne suis pas sûr de ce que vous voulez savoir.',id:null,status:'ambiguous'};
  return {answer:results[0].item.answer,id:results[0].item.id,status:'matched',ruleScore:results[0].score,ruleMargin:results[0].score-(results[1]?.score??0)};
}

export function evaluate(clinicalCase,visited=[],tests=[],checks=[],diagnosis='',action=''){
  const ids=new Set(visited), ordered=new Set(tests), marked=new Set(checks);
  const cap=(v,max)=>Math.min(max,Math.max(0,v));
  const history=cap(clinicalCase.qa.reduce((s,q)=>s+(ids.has(q.id)?q.points:0),0),20);
  const eligible=clinicalCase.exams.filter(e=>e.points>0);
  const possible=eligible.reduce((s,e)=>s+e.points,0);
  const earned=eligible.reduce((s,e)=>s+(ordered.has(e.id)?e.points:0),0);
  const investigations=possible?Math.round(25*earned/possible):0;
  const triage=cap(clinicalCase.rule.triage.reduce((s,k)=>s+(marked.has(k)?10:0),0),20);
  const dx=normalize(diagnosis),correctDx=clinicalCase.id==='ep-complexe'?
    ['embolie pulmonaire','pathologies intriquees ep ic sca'].includes(dx):dx==='embolie pulmonaire';
  const diagnostic=correctDx?15:0;
  const risk=clinicalCase.id==='ep-choc';
  const management=risk?(action==='reperfusion'?20:action==='anticoagulation'?8:0):
    (action==='anticoagulation'?20:action==='surveillance'?8:0);
  const notes=[];let penalty=0;
  for(const key of clinicalCase.rule.triage){if(!marked.has(key))notes.push('Priorité non cochée : '+key.replaceAll('_',' ')+'.');}
  if(risk&&action!=='reperfusion'){
    notes.push('Situation de choc : prioriser réanimation, anticoagulation si indiquée et évaluation urgente pour reperfusion.');
    penalty+=action==='surveillance'?15:0;
  }
  if(risk&&ordered.has('ddimer')){
    notes.push('D-dimères demandés malgré un choc : cet examen ne doit pas retarder la prise en charge.');
    penalty+=5;
  }
  if(!risk&&action==='reperfusion'){
    notes.push('Reperfusion proposée sans instabilité documentée : ne pas thrombolyser systématiquement les EP stables.');
    penalty+=15;
  }
  if(risk&&!marked.has('reconnaitre_choc'))penalty+=5;
  if(clinicalCase.id==='ep-complexe')notes.push('Cas complexe : rechercher aussi une décompensation cardiaque ou une pathologie associée.');
  if(!correctDx)notes.push('Diagnostic attendu : '+clinicalCase.diagnosis+'.');
  const subtotal=history+investigations+triage+diagnostic+management;
  const total=cap(subtotal-penalty,100);
  return {history,investigations,triage,diagnosis:diagnostic,management,subtotal,penalty,total,notes,
    limits:'Score de simulation fondé sur les actions enregistrées et des cases cochées par l’étudiant ; ne prouve pas la compétence clinique.'};
}
