'use client';
import { useState } from 'react';
export default function PhysicianGate({ configured }: { configured: boolean }) {
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
    <h1>🩺 Physician Validation</h1>
    <p><strong>For licensed physicians and authorized jury reviewers only.</strong></p>
    <p>Clinical reference dossiers and AI review are restricted. This is an educational research prototype, not a tool for patient care.</p>
    <p style={{color:'#526078'}}>Espace réservé aux médecins et aux membres du jury autorisés. Prototype pédagogique, non destiné aux soins.</p>
    {configured ? <form onSubmit={submit}><label htmlFor="accessCode">Reviewer access code / Code d’accès</label><input id="accessCode" type="password" autoComplete="off" required minLength={12} value={code} onChange={e=>setCode(e.target.value)} style={{display:'block',width:'100%',padding:12,margin:'10px 0 14px',border:'1px solid #b5c5d5',borderRadius:8}}/><button type="submit" disabled={busy} style={{padding:'12px 20px',background:'#15395f',borderRadius:9,color:'white',border:0,cursor:'pointer'}}>{busy?'Checking…':'Enter physician workspace →'}</button>{error&&<p role="alert" style={{color:'#ba1a1a'}}>{error}</p>}</form> : <p role="alert">Restricted access is not configured. Set the required server environment variables.</p>}
    <p><a href="/">← Back to ClinicaAI</a></p>
  </main>;
}
