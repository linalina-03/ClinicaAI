'use client';
export default function PhysicianLogout() {
  return <button type="button" onClick={async()=>{await fetch('/api/physician-session',{method:'DELETE'}); window.location.reload();}} style={{background:'transparent',color:'white',border:'1px solid #fff',borderRadius:6,padding:'6px 9px',cursor:'pointer'}}>Sign out / Déconnexion</button>;
}
