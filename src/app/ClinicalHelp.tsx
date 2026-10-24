'use client';
import {useId, useState} from 'react';

type HelpTopic = 'triage'|'diagnosis'|'management';
type HelpStep = 0|1|2;
const guide:Record<HelpTopic,{intro:string;steps:[string,string,string]}>= {
 triage:{intro:'Évalue d’abord la stabilité hémodynamique et respiratoire du patient. Recherche les signes de gravité et hiérarchise les priorités, sans attendre les examens pour reconnaître une urgence.',steps:[
 'Rédige spontanément ton évaluation initiale : ABCDE, constantes, signes de choc et probabilité clinique, selon les données disponibles. Ne te préoccupe pas encore des propositions.',
 'Coche uniquement les évaluations et décisions que tu juges adaptées à ce patient. Certaines options sont volontairement inappropriées.',
 'Explique quelles actions sont prioritaires, dans quel ordre et pourquoi. Valide ensuite tes décisions. La correction Gemini sera proposée après la fin du cas.'
 ]},
 diagnosis:{intro:'Propose des hypothèses à partir de l’interrogatoire et des examens, distingue les diagnostics différentiels puis choisis celui que tu estimes le plus probable.',steps:[
 'Écris tes hypothèses et tes arguments POUR et CONTRE sans regarder les réponses proposées. Cette première réflexion sert à évaluer ton raisonnement spontané.',
 'Sélectionne les diagnostics différentiels plausibles dans la liste. Tu peux retenir plusieurs possibilités ; ne coche pas tout systématiquement.',
 'Choisis un seul diagnostic principal parmi tes hypothèses. Vérifie qu’il concorde avec les signes cliniques. La correction IA reste indicative et indépendante du score habituel.'
 ]},
 management:{intro:'Construis une stratégie de prise en charge adaptée à la stabilité, aux risques et aux contre-indications du patient. Les décisions doivent être justifiées.',steps:[
 'Décris librement ce que tu ferais en premier, les mesures diagnostiques ou thérapeutiques envisagées et les précautions indispensables.',
 'Sélectionne les mesures réellement indiquées dans ce contexte. Certaines sont des distracteurs : une conduite valable dans un autre cas peut être dangereuse ici.',
 'Classe tes priorités, précise les conditions d’application et explique ce que tu éviterais. Valide ; la correction générative devient accessible à la fin du cas.'
 ]}
};
const guideEn:typeof guide={
 triage:{intro:'Assess airway, breathing, circulation, clinical stability and urgent warning signs before planning investigations.',steps:[
 'Describe your initial ABCDE assessment, vital signs, signs of shock and estimated clinical probability without seeing the options.',
 'Select only the assessments and actions you consider appropriate. Some options are deliberately unsuitable.',
 'Explain your priorities and sequence of actions, then confirm. Gemini feedback is available after completing the case.'
 ]},
 diagnosis:{intro:'Build a differential diagnosis using the history and investigations, then identify the most likely diagnosis.',steps:[
 'Write your hypotheses and evidence for and against each diagnosis before seeing the options.',
 'Select plausible differential diagnoses. Do not select every option by default.',
 'Choose one primary diagnosis and check that it is consistent with the findings. AI feedback is advisory only.'
 ]},
 management:{intro:'Develop an appropriate management plan considering patient stability, clinical risks and contraindications.',steps:[
 'Write your initial management plan, including urgent actions and essential precautions.',
 'Select the actions indicated in this scenario. Some distractors might be unsafe for this patient.',
 'Rank your priorities, explain when each action is indicated and what you would avoid. Confirm your choices.'
 ]}
};
export default function ClinicalHelp({topic,step,language='fr'}:{topic:HelpTopic;step?:HelpStep;language?:'fr'|'en'}){
 const [open,setOpen]=useState(false);const id=useId();const active=language==='en'?guideEn:guide;const content=step===undefined?active[topic].intro:active[topic].steps[step];
 return <span className="inline-flex flex-col align-middle max-w-full">
  <button type="button" aria-label={language==='en'?'Show help':step===undefined?'Afficher l’aide de la rubrique':'Afficher l’aide de cette étape'} aria-expanded={open} aria-controls={id} title={language==='en'?'How does this section work?':'Comment fonctionne cette rubrique ?'} onClick={()=>setOpen(v=>!v)} className="ml-2 inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-800 w-8 h-8 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600">💡</button>
  {open&&<span id={id} role="note" className="mt-2 block w-full max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-sm font-normal leading-relaxed text-slate-800 shadow-sm"><strong className="block text-amber-900 mb-1">💡 {language==='en'?'How does it work?':'Comment ça marche ?'}</strong>{content}<span className="block mt-2 text-xs text-amber-900">{language==='en'?'This guidance explains the process without revealing the correct answers.':'Cette aide explique la méthode sans révéler les bonnes réponses.'}</span></span>}
 </span>
}
