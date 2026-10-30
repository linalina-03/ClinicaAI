'use client';
import { useEffect, useState } from 'react';
export default function PhysicianGate({ configured }: { configured: boolean }) {
  const [language,setLanguage]=useState<'fr'|'en'>('fr');
  const t=(fr:string,en:string)=>language==='fr'?fr:en;
  useEffect(()=>{try{if(localStorage.getItem('clinicaai_physician_validation_language')==='en')setLanguage('en')}catch{}},[]);
  const chooseLanguage=(v:'fr'|'en')=>{setLanguage(v);try{localStorage.setItem('clinicaai_physician_validation_language',v)}catch{}};
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/physician-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessCode: code }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Access denied');
      window.location.reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in'); }
    finally { setBusy(false); }
  }
  return <main style={{fontFamily:'system-ui',maxWidth:530,margin:'7vh auto',padding:28,border:'1px solid #dbe3ed',borderRadius:16,background:'#fff',color:'#142b49'}}>
    <label style={{display:"flex",alignItems:"center",gap:10,fontWeight:600,color:"#142b49"}}>{t("Langue de l’interface","Interface language")} <select aria-label={t("Langue de l’interface","Interface language")} value={language} onChange={e=>chooseLanguage(e.target.value as "fr"|"en")} style={{backgroundColor:"#ffffff",color:"#142b49",border:"1px solid #9fb0c7",borderRadius:7,padding:"7px 10px",minWidth:125}}><option value="fr">Français</option><option value="en">English</option></select></label><h1>🩺 {t("Validation médicale","Physician Validation")}</h1>
    <p><strong>{t("Réservé aux médecins et membres du jury autorisés.","For licensed physicians and authorized jury reviewers only.")}</strong></p>
    <p>{t("Les dossiers cliniques et évaluations par IA sont réservés aux personnes autorisées. Prototype de recherche pédagogique, non destiné aux soins.","Clinical reference dossiers and AI review are restricted. This is an educational research prototype, not a tool for patient care.")}</p>
    
    {configured ? <form onSubmit={submit}><label htmlFor="accessCode">{t("Code d’accès du médecin","Reviewer access code")}</label><p style={{padding:"9px 12px",background:"#f1f5f9",borderRadius:8,fontSize:13,margin:"10px 0"}}>{t("Code d’accès de démonstration : ","Demonstration access code: ")}<code>nassrlina2003</code></p><input id="accessCode" type="password" autoComplete="off" required minLength={12} value={code} onChange={e=>setCode(e.target.value)} style={{display:'block',width:'100%',padding:12,margin:'10px 0 14px',border:'1px solid #b5c5d5',borderRadius:8}}/><button type="submit" disabled={busy} style={{padding:'12px 20px',background:'#15395f',borderRadius:9,color:'white',border:0,cursor:'pointer'}}>{busy?t('Vérification…','Checking…'):t('Accéder à la validation →','Enter physician workspace →')}</button>{error&&<p role="alert" style={{color:'#ba1a1a'}}>{error}</p>}</form> : <p role="alert">{t("Accès réservé non configuré. Définir les variables serveur requises.","Restricted access is not configured. Set the required server environment variables.")}</p>}
    <p><a href="/">{t("← Retour à ClinicaAI","← Back to ClinicaAI")}</a></p>
  </main>;
}
