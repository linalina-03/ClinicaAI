import { NextRequest, NextResponse } from 'next/server';
import { accessCodeMatches, createPhysicianSession, physicianAuthConfigured, physicianCookieName, sessionSeconds } from '../../../lib/physicianAccess';

const attempts = new Map<string, { count: number; time: number }>();
const headers = { 'Cache-Control': 'no-store' };
export async function POST(request: NextRequest) {
  if (!physicianAuthConfigured()) return NextResponse.json({ error: 'Physician access is not configured on the server.' }, { status: 503, headers });
  const ip = (request.headers.get('x-forwarded-for') || 'local').split(',')[0].slice(0, 80);
  const now = Date.now();
  const found = attempts.get(ip);
  const entry = !found || now - found.time > 15 * 60_000 ? { count: 0, time: now } : found;
  if (entry.count >= 8) return NextResponse.json({ error: 'Too many attempts. Please try later.' }, { status: 429, headers });
  let input: { accessCode?: unknown };
  try { input = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers }); }
  const candidate = typeof input.accessCode === 'string' ? input.accessCode : '';
  if (!accessCodeMatches(candidate)) {
    entry.count++;
    attempts.set(ip, entry);
    if (attempts.size > 500) for (const [key, value] of attempts) if (now - value.time > 15 * 60_000) attempts.delete(key);
    return NextResponse.json({ error: 'Invalid access code.' }, { status: 401, headers });
  }
  attempts.delete(ip);
  const response = NextResponse.json({ ok: true }, { headers });
  response.cookies.set(physicianCookieName, createPhysicianSession(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: sessionSeconds });
  return response;
}
export async function DELETE() {
  const response = NextResponse.json({ ok: true }, { headers });
  response.cookies.set(physicianCookieName, '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  return response;
}
