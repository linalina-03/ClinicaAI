'use client';
import {useEffect,useState} from 'react';

const headings=['lot','questionId','category','question','codeReponse','answer'];
type Entry=Record<string,string>;
function parseCSV(text:string):Entry[]{
 const rows:string[][]=[];let row:string[]=[];let field='';let quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
  else if(!quoted&&c===';'){row.push(field);field='';}
  else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);field='';if(row.some(Boolean))rows.push(row);row=[];}
  else field+=c;
 }
 if(quoted)throw Error('Malformed CSV quotation / Guillemets CSV non fermés');
 row.push(field);if(row.some(Boolean))rows.push(row);
 const cols=rows.shift()||[];
 if(!headings.every(h=>cols.includes(h)))throw Error('Import the blinded export from AI Comparison Lab (expected lot, questionId, codeReponse, answer).');
 if(rows.length>5000)throw Error('CSV exceeds 5000 rows');
 return rows.map((cells,i)=>Object.fromEntries(cols.map((h,j)=>[h,cells[j]||''])) as Entry).map((r,i)=>({...r,_id:`${r.lot}:${r.questionId}:${r.codeReponse}:${i}`}));
}
function escapeCSV(v:string){return '"'+String(v??'').replaceAll('"','""')+'"';}
export default function ImportedReviews(){
 const [language,setLanguage]=useState('fr');const fr=language==='fr';
 const t=(f:string,e:string)=>fr?f:e;
 const [entries,setEntries]=useState<Entry[]>([]);const [idx,setIdx]=useState(0);
 const [reviewer,setReviewer]=useState('');const [ratings,setRatings]=useState<Record<string,Entry>>({});const [error,setError]=useState('');
 const [fileName,setFileName]=useState('');const current=entries[idx];
 const key=current?`${fileName}:${current._id}:${reviewer.trim()}`:'';
 const rating=ratings[key]||{};
 useEffect(()=>{try{const a=JSON.parse(localStorage.getItem('clinicaai-imported-physician-reviews-v1')||'{}');if(a&&typeof a==='object')setRatings(a);}catch{}},[]);
 function update(field:string,value:string){const next={...ratings,[key]:{...rating,[field]:value,reviewer:reviewer.trim(),updatedAt:new Date().toISOString()}};setRatings(next);try{localStorage.setItem('clinicaai-imported-physician-reviews-v1',JSON.stringify(next));}catch{setError(t('Espace de stockage insuffisant : exportez maintenant vos notes.','Storage unavailable: export your reviews now.'));}}
 async function importFile(file?:File){if(!file)return;setError('');if(file.size>4_000_000){setError('CSV too large (4 MB max)');return;}try{const parsed=parseCSV(await file.text());if(!parsed.length)throw Error('Empty CSV');setEntries(parsed);setIdx(0);setFileName(file.name);}catch(e:any){setError(e.message||'Invalid CSV');}}
 function exportRatings(){const cols=['reviewer','lot','questionId','category','question','codeReponse','answer','comprehension','fidelite','naturel','hallucination','comment','correction','updatedAt'];const rows=entries.map(r=>({...r,...(ratings[`${fileName}:${r._id}:${reviewer.trim()}`]||{}),reviewer:reviewer.trim()})).filter(r=>r.updatedAt);const csv=[cols.join(';'),...rows.map(r=>cols.map(c=>escapeCSV(r[c])).join(';'))].join('\r\n');const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='clinicaai-physician-reviews.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <section className="mx-auto max-w-6xl p-5 my-5 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-900">
 <div className="flex justify-between flex-wrap gap-2"><h2 className="text-xl font-bold">{t('Validation des réponses importées (à l’aveugle)','Blinded imported response review')}</h2><select aria-label="Review language" value={language} onChange={e=>setLanguage(e.target.value)} className="border rounded p-2"><option value="fr">Français</option><option value="en">English</option></select></div>
 <p className="text-sm text-slate-600 my-3">{t('Importez le CSV « Exporter pour les médecins (aveugle) » du laboratoire. La clé reliant A/B/C aux moteurs doit rester séparée jusqu’à la fin de la notation. Les notes restent dans ce navigateur.','Import the “Export for physicians (blinded)” CSV. Keep the A/B/C engine key separate until after scoring. Reviews stay in this browser.')}</p>
 <div className="grid sm:grid-cols-2 gap-3"><label className="text-sm font-medium">{t('Identifiant du médecin','Reviewer ID')}<input className="block w-full border rounded p-2 mt-1" value={reviewer} onChange={e=>setReviewer(e.target.value)} placeholder="MD01" maxLength={40}/></label><label className="text-sm font-medium">{t('Importer CSV aveugle','Import blinded CSV')}<input className="block w-full border rounded p-2 mt-1" type="file" accept=".csv,text/csv" onChange={e=>importFile(e.target.files?.[0])}/></label></div>
 {error&&<p role="alert" className="text-red-700 mt-3">{error}</p>}
 {current&&<div className="mt-4 space-y-3">
  <div className="flex flex-wrap justify-between gap-2"><strong>{idx+1} / {entries.length} · {current.questionId} · {t('Réponse','Response')} {current.codeReponse}</strong><span className="text-sm text-slate-500">{fileName}</span></div>
  <div className="rounded-lg bg-slate-100 p-3"><strong>{t('Question','Question')}:</strong><p className="whitespace-pre-wrap">{current.question}</p></div>
  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3"><strong>{t('Réponse anonyme','Blinded response')} {current.codeReponse}</strong><p className="whitespace-pre-wrap mt-2">{current.answer}</p></div>
  {!reviewer.trim()?<p className="text-amber-700">{t('Renseignez votre identifiant pour évaluer.','Enter a reviewer ID before scoring.')}</p>:<div className="grid sm:grid-cols-2 gap-3">
    {([['comprehension',t('Compréhension','Understanding')],['fidelite',t('Fidélité clinique','Clinical accuracy')],['naturel',t('Naturel','Naturalness')]] as const).map(([field,label])=><label key={field} className="text-sm font-medium">{label}<select className="mt-1 block w-full p-2 border rounded" value={rating[field]||''} onChange={e=>update(field,e.target.value)}><option value="">{t('Non évalué','Not rated')}</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}/5</option>)}</select></label>)}
    <label className="text-sm font-medium">{t('Information inventée ou contradictoire ?','Invented or contradictory information?')}<select className="mt-1 block w-full p-2 border rounded" value={rating.hallucination||''} onChange={e=>update('hallucination',e.target.value)}><option value="">{t('Non évalué','Not rated')}</option><option value="non">{t('Non','No')}</option><option value="oui">{t('Oui','Yes')}</option><option value="incertain">{t('Incertain','Uncertain')}</option></select></label>
    <label className="text-sm font-medium">{t('Commentaire médical','Medical comment')}<textarea className="mt-1 block w-full p-2 border rounded" value={rating.comment||''} onChange={e=>update('comment',e.target.value)} rows={3}/></label>
    <label className="text-sm font-medium">{t('Correction proposée (facultative)','Suggested correction (optional)')}<textarea className="mt-1 block w-full p-2 border rounded" value={rating.correction||''} onChange={e=>update('correction',e.target.value)} rows={3}/></label>
   </div>}
  <div className="flex flex-wrap gap-2"><button type="button" disabled={idx===0} onClick={()=>setIdx(i=>i-1)} className="border rounded px-4 py-2 disabled:opacity-40">← {t('Précédent','Previous')}</button><button type="button" disabled={idx===entries.length-1} onClick={()=>setIdx(i=>i+1)} className="border rounded px-4 py-2 disabled:opacity-40">{t('Suivant','Next')} →</button><button type="button" disabled={!reviewer.trim()||!Object.keys(ratings).some(k=>k.startsWith(fileName+':')&&k.endsWith(':'+reviewer.trim()))} onClick={exportRatings} className="bg-blue-700 text-white rounded px-4 py-2 disabled:opacity-40">{t('Exporter les évaluations CSV','Export physician ratings CSV')}</button></div>
 </div>}
 <p className="text-xs text-slate-500 mt-3">{t('Les références cliniques du dossier sont disponibles dans la section historique ci-dessous. Aucune réponse IA ne constitue une validation médicale.','Clinical reference dossiers remain available in the original section below. AI responses are not medical approval.')}</p>
 </section>;
}
