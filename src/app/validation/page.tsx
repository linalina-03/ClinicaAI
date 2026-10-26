import { connection } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { physicianAuthenticated, physicianAuthConfigured } from '../../lib/physicianAccess';
import PhysicianGate from './PhysicianGate';
import PhysicianLogout from './PhysicianLogout';
import ImportedReviews from './ImportedReviews';
import ValidationWorkspace from './ValidationWorkspace';

// This authenticated page reads request cookies; render it per request.
export const instant = false;

export default async function PhysicianValidationPage() {
  // Request boundary before cookie/session verification and Date.now().
  await connection();
  if (!(await physicianAuthenticated())) return <PhysicianGate configured={physicianAuthConfigured()} />;
  const html = readFileSync(join(process.cwd(), 'src', 'data', 'validation', 'portal.html'), 'utf8');
  return <ValidationWorkspace dossierHtml={html} />;
}
