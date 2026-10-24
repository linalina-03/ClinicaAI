import { connection } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { physicianAuthenticated, physicianAuthConfigured } from '../../lib/physicianAccess';
import PhysicianGate from './PhysicianGate';
import PhysicianLogout from './PhysicianLogout';
import ImportedReviews from './ImportedReviews';

// This authenticated page reads request cookies; render it per request.
export const instant = false;

export default async function PhysicianValidationPage() {
  // Request boundary before cookie/session verification and Date.now().
  await connection();
  if (!(await physicianAuthenticated())) return <PhysicianGate configured={physicianAuthConfigured()} />;
  const html = readFileSync(join(process.cwd(), 'src', 'data', 'validation', 'portal.html'), 'utf8');
  return <main style={{minHeight:'100vh',background:'#f4f6f9'}}>
    <div style={{padding:'12px 20px',background:'#13243e',color:'#fff',display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
      <strong>ClinicaAI · Physician Validation</strong>
      <div style={{display:'flex',gap:14,alignItems:'center'}}><a style={{color:'#fff',textDecoration:'underline'}} href="/">← Back to consultation</a><PhysicianLogout /></div>
    </div>
    <ImportedReviews />
    <div style={{maxWidth:1180,margin:"auto",padding:"12px 20px",fontWeight:700}}>Existing clinical dossier validation / Validation du dossier clinique</div>
    <iframe title="ClinicaAI clinical facts validation" srcDoc={html} style={{display:'block',width:'100%',height:'calc(100vh - 60px)',border:0}} />
  </main>;
}
