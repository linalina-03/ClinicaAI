'use client';
import {useEffect,useRef,useState} from 'react';
import ImportedReviews from './ImportedReviews';
import PhysicianLogout from './PhysicianLogout';

type View = 'responses' | 'dossier';
export default function ValidationWorkspace({dossierHtml}:{dossierHtml:string}) {
 const [view,setView] = useState<View>('responses');
 const [language,setLanguage]=useState<'fr'|'en'>('fr');
 const iframeRef=useRef<HTMLIFrameElement>(null);
 const t=(fr:string,en:string)=>language==='fr'?fr:en;
 useEffect(()=>{try{const saved=localStorage.getItem('clinicaai_physician_validation_language');if(saved==='fr'||saved==='en')setLanguage(saved);}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem('clinicaai_physician_validation_language',language);}catch{} const sel=iframeRef.current?.contentDocument?.getElementById('language') as HTMLSelectElement|null; if(sel){sel.value=language;sel.dispatchEvent(new Event('change',{bubbles:true}));}},[language,view]);
 const tab=(id:View,label:string)=><button type="button" role="tab" id={`tab-${id}`} aria-selected={view===id} aria-controls={`panel-${id}`} onClick={()=>setView(id)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view===id?'bg-blue-700 text-white':'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}>{label}</button>;
 return <main className="min-h-screen bg-slate-100 text-slate-900">
  <header className="bg-slate-900 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-white">
   <div><h1 className="font-bold text-lg">ClinicaAI · {t('Validation médicale','Medical validation')}</h1><p className="text-xs text-slate-300">{t('Évaluation des réponses et vérification du dossier clinique','Response assessment and clinical dossier review')}</p></div>
   <div className="flex items-center gap-4"><label className="text-sm font-semibold text-white" style={{display:"inline-flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>{t('Langue','Language')} <select aria-label={t('Langue de validation','Validation language')} value={language} onChange={e=>setLanguage(e.target.value as 'fr'|'en')} style={{backgroundColor:"#ffffff",color:"#142b49",border:"1px solid #cbd5e1",borderRadius:6,padding:"5px 10px",marginLeft:8,minWidth:115,fontWeight:600}}><option value="fr">Français</option><option value="en">English</option></select></label><a href="/lab" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{t("← Retour au LAB","← Back to LAB")}</a><a href="/" className="underline text-sm">{t('Retour au simulateur','Back to simulator')}</a><PhysicianLogout /></div>
  </header>
  <div className="mx-auto max-w-6xl px-4 pt-5">
   <nav role="tablist" aria-label={t('Espaces de validation','Validation areas')} className="flex flex-wrap gap-2">{tab('responses',t('1. Réponses du Lab (CSV)','1. Lab responses (CSV)'))}{tab('dossier',t('2. Dossier clinique','2. Clinical dossier'))}</nav>
  </div>
  <section role="tabpanel" id="panel-responses" aria-labelledby="tab-responses" hidden={view!=='responses'}>
   <ImportedReviews language={language}/>
  </section>
  <section role="tabpanel" id="panel-dossier" aria-labelledby="tab-dossier" hidden={view!=='dossier'}>
   {view==='dossier'&&<iframe ref={iframeRef} onLoad={()=>{const sel=iframeRef.current?.contentDocument?.getElementById("language") as HTMLSelectElement|null;if(sel){sel.value=language;sel.dispatchEvent(new Event("change",{bubbles:true}));}}} title={t("Validation des faits du dossier clinique","Clinical dossier fact validation")} srcDoc={dossierHtml} className="block w-full border-0 mt-4" style={{height:'calc(100vh - 130px)',minHeight:780}} />}
  </section>
 </main>;
}
