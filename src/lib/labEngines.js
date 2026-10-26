// V3.1: les deux méthodes locales utilisent exactement la même banque de faits que Gemini.
import dossier from '../data/enrichment/ep-postop-enriched.json';
import { normalize } from './patientEngine';
import { misleadingFeverPEAnswer } from './leadingQuestion.js';
import { loadSemanticModel } from './semanticEngine';
export const labFacts = dossier.entries.filter(e => e && typeof e.answer === 'string' && e.provenance !== 'clarification' && e.id !== 'question_inconnue');
const variants = labFacts.flatMap(e => (e.variants || []).filter(v => typeof v === 'string' && v.trim()).map(v => ({id:e.id, text:v, norm:normalize(v)})));
const BAD = 'Je ne dispose pas d’information précise sur ce point.';
const stop = new Set(['vous','avez','est','elle','des','une','dans','quel','quelle','votre','pour','depuis','les','pas','sur','est ce','aux','avec','sans','fait','faites','votre','etes','est','que','qui','comment','quelque','avez vous','de','du','la','le','un','et','ou']);
const tokens = q => normalize(q).split(' ').filter(t => t.length > 2 && !stop.has(t));
const overlap = (a,b)=> {const x=new Set(tokens(a)),y=new Set(tokens(b));if(!x.size||!y.size)return 0;const common=[...x].filter(v=>y.has(v)).length;return common/Math.max(x.size,y.size);};
const findFact=id=>labFacts.find(f=>f.id===id);
function interpret(q, history=[]){
 const n=normalize(q);
 const before=history.filter(h=>h.role==='student').at(-1)?.text || '';
 if (/^(aux?|a la|a l)\s+(pieds?|mollets?|nuque|cou|epaule|dos)\b/.test(n) && before) return `${before} ${q}`;
 return q;
}
export function rulesLabAnswer(question,history=[]){
 const special=misleadingFeverPEAnswer('ep-postop',question);
 if(special)return {answer:special.answer,matchedId:'fievre',confidence:100};
 const q=interpret(question,history), n=normalize(q);
 // Le score ne dépend que des variantes documentées dans la banque commune.
 const ranking=labFacts.map(f=>({f, s: Math.max(0,...(f.variants||[]).map(v=>{
  const p=normalize(v);if(!p)return 0;if(n===p)return 100;
  if(p.length>=5 && (` ${n} `).includes(` ${p} `))return 75+p.length/100;
  if(n.length>=6 && (` ${p} `).includes(` ${n} `))return 55+n.length/100;
  const o=overlap(n,p);return o>=.70?30+o*10:0;
 }))})).sort((a,b)=>b.s-a.s);
 const a=ranking[0],b=ranking[1];
 if(!a||a.s<30||(b && a.s-b.s<1))return {answer:BAD,matchedId:null,confidence:null};
 return {answer:a.f.answer,matchedId:a.f.id,confidence:a.s};
}
let cachePromise;
async function buildEmbeddings(){
 if(cachePromise)return cachePromise;
 cachePromise=(async()=>{
  const extractor=await loadSemanticModel();
  const embeddings=[];
  for(let i=0;i<variants.length;i+=32){
   const batch=variants.slice(i,i+32);
   const res=await extractor(batch.map(x=>x.text),{pooling:'mean',normalize:true});
   const width=res.dims.at(-1);
   for(let j=0;j<batch.length;j++)embeddings.push(Array.from(res.data.slice(j*width,(j+1)*width)));
  }
  return {extractor,embeddings};
 })().catch(e=>{cachePromise=null;throw e;});
 return cachePromise;
}
export async function semanticLabAnswer(question,history=[]){
 const special=misleadingFeverPEAnswer('ep-postop',question);
 if(special)return {answer:special.answer,matchedId:'fievre',similarity:1};
 const {extractor,embeddings}=await buildEmbeddings();
 const q=interpret(question,history);
 const res=await extractor([q],{pooling:'mean',normalize:true});
 const query=Array.from(res.data);
 const ranked=variants.map((v,i)=>({id:v.id,score:embeddings[i].reduce((s,x,j)=>s+x*query[j],0)})).sort((a,b)=>b.score-a.score);
 const best=ranked[0], runner=ranked.find(v=>v.id!==best?.id);
 if(!best||best.score<.69||(runner && best.score-runner.score<.025))return {answer:BAD,matchedId:null,similarity:best?.score??null};
 return {answer:findFact(best.id)?.answer||BAD,matchedId:best.id,similarity:best.score};
}
