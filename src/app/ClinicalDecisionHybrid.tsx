'use client';
import {useState} from 'react';
import ClinicalHelp from './ClinicalHelp';

type Section='triage'|'management';
const options:Record<Section,{id:string,label:string}[]>={
 triage:[
 {id:'airway',label:'Évaluer conscience, voies aériennes et respiration (ABCDE)'},
 {id:'vitals',label:'Mesurer pression artérielle, fréquence cardiaque, fréquence respiratoire et SpO₂'},
 {id:'perfusion',label:'Rechercher signes de choc et d’hypoperfusion'},
 {id:'monitor',label:'Installer monitorage et réévaluer les constantes'},
 {id:'pretest',label:'Estimer la probabilité clinique prétest (Wells/Genève selon contexte)'},
 {id:'bleed',label:'Rechercher facteurs de risque hémorragique et contre-indications'},
 {id:'risk',label:'Évaluer le risque d’EP après confirmation diagnostique'},
 {id:'oxygen',label:'Vérifier si une oxygénothérapie est indiquée selon la saturation'},
 {id:'score_only',label:'Se baser uniquement sur les D-dimères pour juger la gravité'},
 {id:'wait',label:'Reporter l’évaluation des constantes jusqu’aux résultats d’imagerie'},
 {id:'discharge',label:'Décider d’un retour à domicile sans évaluation de la stabilité'}
 ],
 management:[
 {id:'reassess',label:'Surveiller et réévaluer l’état hémodynamique et respiratoire'},
 {id:'oxygen',label:'Oxygène si hypoxémie, selon besoins cliniques'},
 {id:'anticoag',label:'Envisager une anticoagulation si indiquée, en tenant compte du risque hémorragique'},
 {id:'bleed',label:'Rechercher les contre-indications et le risque hémorragique'},
 {id:'kidney',label:'Adapter la stratégie aux fonctions rénale et hépatique et au poids'},
 {id:'confirm',label:'Organiser une confirmation diagnostique adaptée à la probabilité et à la stabilité'},
 {id:'shock',label:'En cas de choc : alerter l’équipe d’urgence et organiser les soins critiques'},
 {id:'reperfusion',label:'Envisager une reperfusion uniquement si les indications sont réunies'},
 {id:'contra',label:'Vérifier les contre-indications avant toute thrombolyse'},
 {id:'thrombolysis_all',label:'Réaliser une thrombolyse systématique chez tout patient stable'},
 {id:'antibiotic',label:'Prescrire systématiquement une antibiothérapie pour la suspicion d’EP'},
 {id:'home',label:'Retour immédiat à domicile sans stratification du risque'},
 {id:'no_anticoag',label:'Ne jamais envisager d’anticoagulation même après confirmation et absence de contre-indication'}
 ]
};
const enOptions={triage:[
 'Assess consciousness, airway and breathing (ABCDE)','Measure blood pressure, heart rate, respiratory rate and SpO₂','Look for shock and hypoperfusion','Start monitoring and reassess vital signs','Estimate clinical pretest probability (Wells/Geneva as appropriate)','Check bleeding risks and contraindications','Assess PE risk after diagnostic confirmation','Assess whether oxygen is indicated according to oxygen saturation','Base severity assessment on D-dimers alone','Postpone vital signs until imaging results','Discharge without assessing clinical stability'],
 management:[
 'Monitor and reassess cardiovascular and respiratory status','Provide oxygen if clinically indicated for hypoxaemia','Consider anticoagulation if indicated, taking bleeding risk into account','Check contraindications and bleeding risk','Adjust strategy for kidney/liver function and body weight','Arrange diagnostic confirmation appropriate to probability and stability','If shock is present, alert the emergency team and arrange critical care','Consider reperfusion only when indications are fulfilled','Check contraindications before thrombolysis','Give routine thrombolysis to every stable patient','Prescribe antibiotics routinely for suspected pulmonary embolism','Immediate discharge without risk stratification','Never consider anticoagulation even when confirmed and without contraindication']};
const enHead={triage:'1. Initial assessment and severity',management:'3. Management plan'};
const enPrompt={triage:'Describe your initial ABCDE assessment, clinical stability and risk priorities.',management:'Describe your management strategy and justification based on patient stability.'};
const heading={triage:'1. Évaluation initiale et gravité',management:'3. Conduite à tenir'};
const prompt={triage:'Décris spontanément l’évaluation d’urgence, les constantes, la stabilité et le risque. Argumente tes priorités.',management:'Décris spontanément ta prise en charge et ses justifications selon la stabilité du patient.'};
export default function ClinicalDecisionHybrid({section,disabled,finished,caseIndex,onAnswer,language='fr'}:{language?:'fr'|'en';section:Section;disabled:boolean;finished:boolean;caseIndex:number;onAnswer:(answer:string)=>void}){
 const [step,setStep]=useState(0),[free,setFree]=useState(''),[selected,setSelected]=useState<string[]>([]),[justification,setJustification]=useState(''),[locked,setLocked]=useState(false);
 const [grade,setGrade]=useState<any>(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const list=options[section];const t=(fr:string,en:string)=>language==='en'?en:fr;
 function update(){const choice=selected.map(id=>list.find(x=>x.id===id)?.label).filter(Boolean);
  // Preserve spontaneous answer separately from checked options. The existing rule-based score still receives a readable synthesis.
  onAnswer(`Réflexion spontanée : ${free}\nActions sélectionnées : ${choice.join(' ; ')}\nJustification finale : ${justification}`.slice(0,1600));
 }
 function lock(){update();setLocked(true)}
 async function gradeAI(){if(loading||!locked||!finished)return;setLoading(true);setError('');setGrade(null);
  try{const r=await fetch('/api/clinical-sections-grade',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language,section,caseIndex,freeText:free,selected:selected.map(id=>list.find(x=>x.id===id)?.label),justification})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Correction IA indisponible');setGrade(d)}catch(e:any){setError(e?.message||'Erreur de correction')}finally{setLoading(false)}
 }
 const blocked=disabled||locked;
 return <section className="mb-4 rounded-xl border border-indigo-200 p-3 space-y-3">
 <h4 className="font-bold text-indigo-900">{language==='en'?enHead[section]:heading[section]} — {t('parcours hybride','hybrid pathway')} <ClinicalHelp topic={section} language={language}/></h4>
 <p className="text-xs text-slate-600">{t("Raisonnement libre d’abord, propositions ensuite, puis hiérarchisation et justification. Les distracteurs sont volontaires. Correction Gemini séparée et indicative sur 20 points.","Write your reasoning first, then review the options, prioritise your choices and justify them. Some options are deliberate distractors. Optional Gemini feedback is provided separately out of 20.")}</p>
 <div className="flex gap-1 text-xs">{[language==='en'?'1. Free text':'1. Libre',language==='en'?'2. Select':'2. Choix',language==='en'?'3. Priorities':'3. Priorités'].map((s,i)=><span key={s} className={'flex-1 rounded p-2 text-center '+(step===i?'bg-indigo-700 text-white':'bg-slate-100 text-slate-600')}>{s}</span>)}</div>
 {step===0&&<><ClinicalHelp topic={section} step={0} language={language}/><label className="block text-sm font-semibold">{t('Ton raisonnement spontané','Your spontaneous reasoning')}<textarea className="mt-2 w-full border rounded-xl p-3 min-h-32 font-normal" value={free} maxLength={900} disabled={blocked} onChange={e=>{setFree(e.target.value)}} placeholder={language==='en'?enPrompt[section]:prompt[section]}/></label><button type="button" disabled={blocked} className="rounded-lg bg-indigo-700 text-white px-3 py-2 disabled:opacity-40" onClick={()=>setStep(1)}>{t('Voir les propositions →','View options →')}</button></>}
 {step===1&&<><ClinicalHelp topic={section} step={1} language={language}/><p className="text-sm font-semibold">{t("Choisis les décisions que tu juges appropriées :","Choose the decisions you consider appropriate:")}</p><div className="max-h-72 overflow-y-auto border rounded-xl p-2 space-y-2">{list.map(x=><label className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-slate-50" key={x.id}><input type="checkbox" className="mt-1" disabled={blocked} checked={selected.includes(x.id)} onChange={e=>setSelected(v=>e.target.checked?[...v,x.id]:v.filter(z=>z!==x.id))}/><span>{language==='en'?enOptions[section][list.indexOf(x)]:x.label}</span></label>)}</div><div className="flex gap-2"><button type="button" disabled={locked} className="border rounded-lg px-3 py-2" onClick={()=>setStep(0)}>{t('Retour','Back')}</button><button type="button" disabled={blocked} className="bg-indigo-700 text-white rounded-lg px-3 py-2 disabled:opacity-40" onClick={()=>setStep(2)}>{t('Justifier mes choix →','Justify choices →')}</button></div></>}
 {step===2&&<><ClinicalHelp topic={section} step={2} language={language}/><p className="text-sm">{selected.length} {t("décision(s) sélectionnée(s). Explique leur ordre de priorité, les conditions d’application et ce que tu éviterais.","decisions selected. Explain their priority, when to apply them and what you would avoid.")}</p><textarea className="w-full border rounded-xl p-3 min-h-28" maxLength={600} disabled={blocked} value={justification} onChange={e=>setJustification(e.target.value)} placeholder={t("Mes priorités et les précautions à prendre…","My priorities and safety precautions…")}/><div className="flex flex-wrap gap-2"><button type="button" disabled={locked} className="border rounded-lg px-3 py-2" onClick={()=>setStep(1)}>{t('Retour','Back')}</button><button type="button" disabled={blocked} className="bg-indigo-700 text-white rounded-lg px-3 py-2 disabled:opacity-40" onClick={lock}>{t('Valider mes décisions','Confirm decisions')}</button></div></>}
 {locked&&<p className="text-sm text-emerald-800">{t("✓ Décisions validées. Correction IA disponible à la fin du cas. La note traditionnelle sur 100 reste indépendante.","✓ Decisions confirmed. AI feedback is available at the end of the case. The original score out of 100 remains separate.")}</p>}
 {locked&&finished&&<div className="border-t pt-3 space-y-2"><button type="button" disabled={loading} className="rounded-lg bg-slate-900 text-white px-3 py-2 disabled:opacity-50" onClick={gradeAI}>{loading?t('Correction en cours…','Grading…'):t('✨ Corriger avec Gemini — /20','✨ Grade with Gemini — /20')}</button>{error&&<p role="alert" className="text-sm text-red-700">{error}</p>}{grade&&<div className="rounded-lg bg-indigo-50 p-3 text-sm space-y-2"><strong className="block">{t("Note IA indicative : ","Indicative AI score: ")} {grade.total}/20</strong>{Object.entries(grade.scores||{}).map(([name,val])=><p key={name}>{name} : {String(val)}</p>)}{grade.pointsForts?.length>0&&<p><b>{t("Points forts :","Strengths:")}</b> {grade.pointsForts.join(' ')}</p>}{grade.ameliorations?.length>0&&<p><b>{t("À améliorer :","Areas to improve:")}</b> {grade.ameliorations.join(' ')}</p>}{grade.vigilance?.length>0&&<p><b>{t("Vigilance :","Safety notes:")}</b> {grade.vigilance.join(' ')}</p>}<p className="text-xs text-slate-600">{t("Évaluation expérimentale à faire valider par un médecin. Ne remplace pas le barème existant.","Experimental assessment requiring clinician review. This does not replace the existing scoring system.")}</p></div>}</div>}
 </section>
}
