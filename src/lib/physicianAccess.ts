import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'clinicaai_physician_access';
const LIFETIME_SECONDS = 60 * 60 * 8;
export const physicianCookieName = COOKIE;

function config() {
  const code = process.env.PHYSICIAN_REVIEW_ACCESS_CODE || '';
  const secret = process.env.PHYSICIAN_REVIEW_SESSION_SECRET || '';
  return { code, secret, ready: code.length >= 12 && secret.length >= 32 };
}
export function physicianAuthConfigured() { return config().ready; }
function mac(payload: string, secret: string) { return createHmac('sha256', secret).update(payload).digest('hex'); }
export function createPhysicianSession() {
  const { secret, ready } = config();
  if (!ready) throw new Error('Physician access not configured');
  const expires = Math.floor(Date.now() / 1000) + LIFETIME_SECONDS;
  const payload = `v1.${expires}`;
  return `${payload}.${mac(payload, secret)}`;
}
export function verifyPhysicianSession(token?: string) {
  const { secret, ready } = config();
  if (!ready || !token || token.length > 200) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1' || !/^\d{10}$/.test(parts[1]) || !/^[0-9a-f]{64}$/.test(parts[2])) return false;
  if (Number(parts[1]) < Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(mac(`${parts[0]}.${parts[1]}`, secret), 'hex');
  const received = Buffer.from(parts[2], 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}
export async function physicianAuthenticated() {
  const jar = await cookies();
  return verifyPhysicianSession(jar.get(COOKIE)?.value);
}
export function accessCodeMatches(candidate: string) {
  const { code, ready } = config();
  if (!ready || candidate.length > 512) return false;
  const a = createHmac('sha256', 'clinicaai-access-code').update(candidate).digest();
  const b = createHmac('sha256', 'clinicaai-access-code').update(code).digest();
  return timingSafeEqual(a, b);
}
export const sessionSeconds = LIFETIME_SECONDS;
