'use client';
import {useState} from 'react';
import ImportedReviews from './ImportedReviews';
import PhysicianLogout from './PhysicianLogout';

type View = 'responses' | 'dossier';
export default function ValidationWorkspace({dossierHtml}:{dossierHtml:string}) {
 const [view,setView] = useState<View>('responses');
 const tab=(id:View,label:string)=><button type="button" role="tab" id={`tab-${id}`} aria-selected={view===id} aria-controls={`panel-${id}`} onClick={()=>setView(id)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view===id?'bg-blue-700 text-white':'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}>{label}</button>;
 return <main className="min-h-screen bg-slate-100 text-slate-900">
  <header className="bg-slate-900 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-white">
   <div><h1 className="font-bold text-lg">ClinicaAI · Validation médicale</h1><p className="text-xs text-slate-300">Évaluation des réponses et vérification du dossier clinique</p></div>
   <div className="flex items-center gap-4"><a href="/" className="underline text-sm">Retour au simulateur</a><PhysicianLogout /></div>
  </header>
  <div className="mx-auto max-w-6xl px-4 pt-5">
   <nav role="tablist" aria-label="Espaces de validation" className="flex flex-wrap gap-2">{tab('responses','1. Réponses du Lab (CSV)')}{tab('dossier','2. Dossier clinique')}</nav>
  </div>
  <section role="tabpanel" id="panel-responses" aria-labelledby="tab-responses" hidden={view!=='responses'}>
   <ImportedReviews />
  </section>
  <section role="tabpanel" id="panel-dossier" aria-labelledby="tab-dossier" hidden={view!=='dossier'}>
   {view==='dossier'&&<iframe title="Validation des faits du dossier clinique" srcDoc={dossierHtml} className="block w-full border-0 mt-4" style={{height:'calc(100vh - 130px)',minHeight:780}} />}
  </section>
 </main>;
}
