// Correction pédagogique déterministe : pas un modèle d'IA, pas une certification clinique.
export function normalise(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
const containsTerm = (text, term) => (' ' + normalise(text) + ' ').includes(' ' + normalise(term) + ' ');
const deny = /\b(?:ne\s+\w+\s+pas|pas|sans|aucun|jamais|eviter|contre indiquee?)\b/;
function matchesGroup(text, words) { return words.every(word => containsTerm(text, word)); }
function negated(text, group) {
  // Détecte les négations immédiates devant le premier mot de l'expression.
  const tokens = normalise(text).split(' ');
  const start = normalise(group[0]);
  return tokens.some((t,i) => t === start && tokens.slice(Math.max(0,i-6),i).some((p,j,a) =>
    (p === 'pas' && (a.includes('ne') || a.includes('n'))) || p === 'sans' || p === 'aucun' || p === 'jamais' || p === 'exclure'));
}
function matched(text, rule) {
  return rule.groups.some(group => matchesGroup(text,group) && !negated(text,group));
}
export function assessFreeResponse(rubric, sections) {
  const report={}; let subtotal=0;
  for (const section of ['triage','diagnosis','management']) {
    const answer=String(sections[section]||'').slice(0,1600);
    const items=rubric[section].map(rule=>({
      id:rule.id,label:rule.label,points:matched(answer,rule)?rule.points:0,max:rule.points,
      found:matched(answer,rule)
    }));
    const score=items.reduce((s,x)=>s+x.points,0);
    report[section]={items,score,max:items.reduce((s,x)=>s+x.max,0)};
    subtotal+=score;
  }
  const management=normalise(sections.management||'');
  const penalties=[];
  if(rubric.warnings?.unjustified_lysis && rubric.warnings.unjustified_lysis.patterns.some(x=>containsTerm(management,x))) {
    const w=rubric.warnings.unjustified_lysis;
    if(!['pas de thrombolyse','ne pas thrombolyser','sans thrombolyse','pas de reperfusion','eviter la thrombolyse','thrombolyse non indiquee','pas de fibrinolyse','ne pas fibrinolyser'].some(p=>management.includes(p))) penalties.push({points:w.points,message:w.message});
  }
  if(rubric.warnings?.delay && rubric.warnings.delay.patterns.some(x=>management.includes(normalise(x)))) {
    const w=rubric.warnings.delay;penalties.push({points:w.points,message:w.message});
  }
  return {report,subtotal,penalty:penalties.reduce((s,x)=>s+x.points,0),penalties,
    limitation:'Repérage d’expressions dans trois réponses structurées : ne juge pas réellement l’ensemble du raisonnement ; formulations inattendues et négations complexes peuvent être mal notées.'};
}
export function gradeCase(clinicalCase,rubric,visited=[],tests=[],sections={}) {
  const qa=new Set(visited), ordered=new Set(tests);
  const history=Math.min(20,clinicalCase.qa.reduce((s,q)=>s+(qa.has(q.id)?q.points:0),0));
  const eligible=clinicalCase.exams.filter(x=>x.points>0);
  const possible=eligible.reduce((s,x)=>s+x.points,0);
  const earned=eligible.reduce((s,x)=>s+(ordered.has(x.id)?x.points:0),0);
  const investigations=possible?Math.round(25*earned/possible):0;
  const free=assessFreeResponse(rubric,sections);
  const total=Math.max(0,Math.min(100,history+investigations+free.subtotal-free.penalty));
  return {history,investigations,...free,total};
}
