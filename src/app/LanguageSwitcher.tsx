'use client';
import {useEffect,useRef} from 'react';
import extraUI from '../data/i18n/ui-en.json';
import patientAnswers from '../data/i18n/patient-answers-en.json';

type Lang='fr'|'en';
export function getPreferredLanguage():Lang{try{return localStorage.getItem('clinicaai-language')==='fr'?'fr':'en'}catch{return 'en'}}
const originals=new WeakMap<Text,string>();
const lastRendered=new WeakMap<Text,string>();
const translated=new Map<string,string>();
const dictionary:Record<string,string>={
 ...extraUI, ...patientAnswers,
 'Laboratoire comparatif IA →':'AI Comparison Lab →','Simulateur clinique':'Clinical simulator',
 'Interrogatoire libre':'Open history taking','Examinateur clinique':'Clinical examiner','Examens complémentaires':'Diagnostic investigations',
 'Évaluation initiale et gravité':'Initial assessment and severity','Hypothèses et diagnostic':'Differential diagnosis and final diagnosis',
 'Conduite à tenir':'Management plan','Raisonnement libre':'Free-text clinical reasoning',
 'Valider les examens':'Confirm investigations','Prescription validée':'Investigations confirmed',
 'Résultats des examens demandés':'Requested investigation results',
 'Diagnostic principal':'Primary diagnosis','Hypothèses':'Differential diagnoses',
 'Réinitialiser':'Reset','Recommencer':'Start again','Terminer et évaluer':'Finish and evaluate',
 'Progression personnelle':'Personal progress','Afficher':'Show','Masquer':'Hide',
 'Bilan pédagogique':'Learning feedback','Conseils de révision':'Study recommendations',
 'Interrogatoire':'History taking','Examens':'Investigations','Gravité':'Severity',
 'Diagnostic':'Diagnosis','Conduite':'Management','Correction':'Feedback',
 'Exporter CSV':'Export CSV','Effacer l’historique':'Clear history',
 'Non documenté':'Not documented', 'Résultat non documenté dans ce cas.':'Result not documented in this case.',
 'Règles':'Rules','Sémantique':'Semantic','IA générative':'Generative AI',
 'Choisir un cas clinique':'Choose a clinical case', 'Nouvelle consultation':'New consultation',
 'Évaluation initiale':'Initial assessment','Choix structurés':'Structured selections',
 'Rédigez votre réponse':'Write your answer','Question clinique':'Clinical question',
 'Sélectionnez les éléments pertinents':'Select the relevant items',
 'Valider':'Confirm','Suivant':'Next','Précédent':'Previous',
 'Lancer la correction IA':'Run AI feedback','Correction par Generative AI':'Generative AI feedback',
 'Réponse du patient':'Patient response','Question de l’étudiant':'Student question',
 'Résultat':'Result','Motif de consultation':'Reason for consultation',
 'Examens sélectionnés':'Selected investigations',
 'Choisir les examens nécessaires':'Choose necessary investigations',
 'Examens biologiques':'Laboratory tests', 'Imagerie':'Imaging',
 'Terminer la consultation':'Finish consultation',
 'Votre raisonnement':'Your clinical reasoning',
 'Interprétation indicative, sans points supplémentaires.':'Illustrative interpretation; no additional points.',
 'Aide pédagogique':'Learning guidance', 'Comment ça marche ?':'How does it work?',
 'Hypothèses diagnostiques':'Diagnostic hypotheses', 'Arguments cliniques':'Clinical arguments',
 'Corriger avec Generative AI':'Grade with Generative AI'
};
function eligible(t:string){const s=t.trim();return !!s&&s.length>=3&&s.length<=1500&&/[a-zA-ZÀ-ÿ]/.test(s)&&!/^\d[\d\s,./:-]*$/.test(s)}
// Clinical source texts have pretranslated equivalents; no translation request is sent for UI rendering.
export function translateClinicalText(text:string,target:Lang):string {
 if(target==='en')return dictionary[text]||text;
 const entry=Object.entries(dictionary).find(([,value])=>value===text);
 return entry?.[0]||text;
}
export default function LanguageSwitcher({language,onChange}:{language:Lang,onChange:(l:Lang)=>void}){
 // Interface labels are rendered from React state, not mutated in the DOM.
 // Save the choice only on explicit user interaction: on mount the initial
 // English default must not overwrite a previously saved French preference.
 useEffect(()=>{document.documentElement.lang=language},[language]);
 function handleChange(next:Lang){
  try{localStorage.setItem('clinicaai-language',next)}catch{}
  onChange(next);
 }
 return <div className="flex items-center gap-2" data-i18n-ignore="true">
  <label htmlFor="clinicaai-lang" className="text-sm text-slate-200">🌐 {language==='fr'?'Langue':'Language'}</label>
  <select id="clinicaai-lang" aria-label="Language / Langue" value={language} onChange={e=>handleChange(e.target.value as Lang)} className="rounded-lg bg-white text-slate-900 px-3 py-2 text-sm font-semibold">
   <option value="fr">🇫🇷 Français</option><option value="en">🇬🇧 English</option>
  </select>
 </div>;
}
