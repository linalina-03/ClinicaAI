// Approximate offline English terminology normalization for the EXISTING French rule rubric.
// Does not guarantee grading parity; all scores remain indicative and require clinical review.
const pairs=[
[/pulmonary embol(?:ism|i)\b|\bPE\b/gi,' embolie pulmonaire '],
[/deep vein thrombosis|\bDVT\b/gi,' thrombose veineuse '],
[/haemodynamic(?:ally)?|hemodynamic(?:ally)?/gi,' hemodynamique '],
[/normotensi(?:ve|on)|stable blood pressure/gi,' normotendu stable '],
[/hypotensi(?:on|ve)|low blood pressure/gi,' hypotension choc '],
[/\bshock\b/gi,' choc hypoperfusion '],
[/blood pressure|arterial pressure/gi,' pression arterielle '],
[/heart rate|pulse rate/gi,' frequence cardiaque '],
[/oxygen saturation|\bSpO2\b/gi,' saturation '],
[/pretest probab(?:ility)?|clinical probability|\bWells\b/gi,' probabilite clinique wells '],
[/right ventricle|right ventricular|\bRV\b/gi,' ventricule droit '],
[/cardiac biomarker|troponin/gi,' troponine biomarqueurs '],
[/anticoagulat(?:ion|e|ing)|anticoagulant/gi,' anticoagulation anticoagulant '],
[/heparin|enoxaparin/gi,' heparine hbpm '],
[/bleeding risk|risk of bleeding/gi,' risque hemorragique '],
[/contraindicat(?:ion|ed)/gi,' contre indication '],
[/thrombolysis|thrombolytic|fibrinolysis/gi,' thrombolyse fibrinolyse '],
[/reperfusion|embolectomy/gi,' reperfusion embolectomie '],
[/monitor(?:ing)?|reassess(?:ment)?/gi,' surveillance monitorage reevaluation '],
[/intensive care|critical care|resuscitation/gi,' soins intensifs reanimation '],
[/heart failure|cardiac failure/gi,' insuffisance cardiaque '],
[/pregnan(?:t|cy)|obstetric|fetal/gi,' obstetric foet grossesse '],
];
export function scoringTextForLanguage(value,language){
 if(language!=='en')return value;
 const source=String(value||'');
 const withoutRiskNegations=source.replace(/\b(?:do not|don't|never|avoid|no)\s+(?:give|perform|use|consider)?\s*(?:routine|systemic)?\s*(?:thrombolysis|thrombolytic|fibrinolysis)/gi,' ne pas thrombolyser ');
 return pairs.reduce((str,[rx,fr])=>str.replace(rx,fr),withoutRiskNegations);
}
export function scoringAnswers(answers,language){
 if(language!=='en')return answers;
 return Object.fromEntries(Object.entries(answers).map(([key,value])=>[key,scoringTextForLanguage(value,language)]));
}
