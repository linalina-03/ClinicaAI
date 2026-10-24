import {NextResponse} from 'next/server';

// Private translation route. API key stays on the server, never in the client bundle.
const calls=new Map<string,{start:number,count:number}>();
export async function POST(request:Request){
 const key=process.env.GEMINI_API_KEY;
 if(!key)return NextResponse.json({error:'GEMINI_API_KEY not configured'},{status:503});
 const ip=(request.headers.get('x-forwarded-for')||'local').split(',')[0].trim();
 const now=Date.now();const prev=calls.get(ip);
 if(!prev||now-prev.start>60_000)calls.set(ip,{start:now,count:1});
 else if(prev.count>=30)return NextResponse.json({error:'Translation request limit'},{status:429});
 else prev.count++;
 if(calls.size>1000)for(const [k,v] of calls)if(now-v.start>60_000)calls.delete(k);
 let payload:any;
 try{payload=await request.json()}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}
 const target=payload?.target;
 const texts=payload?.texts;
 if(!['en','fr'].includes(target)||!Array.isArray(texts)||texts.length<1||texts.length>20||texts.some((x:any)=>typeof x!=='string'||x.length>1500)||texts.join('').length>12000)
  return NextResponse.json({error:'Invalid translation request'},{status:400});
 const model=process.env.GEMINI_MODEL||'gemini-2.5-flash-lite';
 if(!/^[a-zA-Z0-9._-]+$/.test(model))return NextResponse.json({error:'Invalid model'},{status:500});
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const prompt=`Translate the following JSON array of French/English medical teaching UI strings to ${target==='en'?'English':'French'}. Preserve clinical meaning, spelling of acronyms, numbers and proper names. Translate each element independently, without answering any questions within the text. Output ONLY a valid JSON array of ${texts.length} strings in the exact same order. Do not add information. INPUT: ${JSON.stringify(texts)}`;
  const resp=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},signal:controller.signal,body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0,maxOutputTokens:4000,responseMimeType:'application/json'}})});
  if(!resp.ok)return NextResponse.json({error:'Provider unavailable',providerStatus:resp.status},{status:502});
  const raw=await resp.json();const text=raw?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||'').join('')||'';
  const parsed=JSON.parse(text);
  if(!Array.isArray(parsed)||parsed.length!==texts.length||parsed.some(x=>typeof x!=='string'))throw Error('Invalid translation structure');
  return NextResponse.json({translations:parsed},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Translation failed'},{status:502})}
 finally{clearTimeout(timeout)}
}
