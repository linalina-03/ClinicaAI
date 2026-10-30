import { NextRequest, NextResponse } from 'next/server';
import { misleadingFeverPEAnswer } from '../../../../lib/leadingQuestion.js';
import { commonPostopInstructions } from '../../../../lib/commonPostopGemini.js';
import caseData from '../../../../data/cases/ep-postop.json';
import enriched from '../../../../data/enrichment/ep-postop-enriched.json';

// Node.js est le runtime par défaut avec cacheComponents activé.
const windows = new Map<string,{start:number,count:number}>();
const LIMIT = 12;
export async function POST(request: NextRequest) {
  const key=process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({error:'Clé Generative AI non configurée sur le serveur. Consultez README-LAB.md.'},{status:503});
  const ip=(request.headers.get('x-forwarded-for')||'local').split(',')[0].trim().slice(0,80);
  const now=Date.now(); const prev=windows.get(ip);
  if (!prev||now-prev.start>60000) windows.set(ip,{start:now,count:1});
  else {if(prev.count>=LIMIT)return NextResponse.json({error:'Limite de démonstration atteinte (12 appels/minute). Réessayez plus tard.'},{status:429});prev.count++;}
  if(windows.size>1000) for(const [k,v] of windows)if(now-v.start>60000)windows.delete(k);
  let data:unknown;
  try{data=await request.json();}catch{return NextResponse.json({error:'JSON invalide'},{status:400});}
  if(!data||typeof data!=='object')return NextResponse.json({error:'Entrée invalide'},{status:400});
  const input=data as {question?:unknown;history?:unknown;language?:unknown};
  if(typeof input.question!=='string'||!input.question.trim()||input.question.length>350)return NextResponse.json({error:'Question invalide (350 caractères maximum)'},{status:400});
  const special=misleadingFeverPEAnswer('ep-postop',input.question,input.language==='en'?'en':'fr');
  if(special)return NextResponse.json({answer:special.answer,method:'validated-case-rule'},{headers:{'Cache-Control':'no-store'}});
  const hist=Array.isArray(input.history)?input.history.slice(-8).filter((m:unknown)=>m&&typeof m==='object'&&['student','patient'].includes((m as {role?:string}).role||'')&&typeof (m as {text?:string}).text==='string').map((m:{role:string;text:string})=>({role:m.role,text:m.text.slice(0,650)})):[];
  // Faits autorisés : UNIQUEMENT l'ouverture du cas et les réponses de la banque pédagogique.
  const system=commonPostopInstructions(input.language==='en'?'en':'fr');
  const dialogue=hist.map(m=>`${m.role==='student'?'Étudiant':'Patiente'}: ${m.text}`).join('\n');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),18000);
  try{
    const model=process.env.GEMINI_MODEL||'gemini-2.5-flash-lite';
    if(!/^[a-zA-Z0-9._-]+$/.test(model))return NextResponse.json({error:'Modèle invalide'},{status:500});
    const resp=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},signal:controller.signal,
      body:JSON.stringify({system_instruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:`Historique :\n${dialogue}\n\nQuestion de l'étudiant : ${input.question}\n\nRéponse de la patiente :` }]}],generationConfig:{temperature:0.2,maxOutputTokens:240}})
    });
    const raw=await resp.json().catch(()=>({}));
    if(!resp.ok)return NextResponse.json({error:resp.status===429?'Quota gratuit Generative AI atteint.':resp.status===400?'Vérifiez le modèle Generative AI et la configuration API.':'Service Generative AI indisponible.',providerStatus:resp.status},{status:502});
    const answer=raw?.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||'').join(' ').trim();
    if(!answer)return NextResponse.json({error:'Aucune réponse générée.'},{status:502});
    return NextResponse.json({answer:answer.slice(0,1200),model,usage:raw.usageMetadata?{input:raw.usageMetadata.promptTokenCount||0,output:raw.usageMetadata.candidatesTokenCount||0}:null},{headers:{'Cache-Control':'no-store'}});
  }catch{return NextResponse.json({error:'Échec de communication avec Generative AI ou délai dépassé.'},{status:502});}
  finally{clearTimeout(timer);}
}
