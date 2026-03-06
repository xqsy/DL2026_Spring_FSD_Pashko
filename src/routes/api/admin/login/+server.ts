import { json, type RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { setAdminCookie, clearAdminCookie } from '$lib/server/adminAuth';
import crypto from 'node:crypto';

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

type RateLimitState = { resetAt: number; count: number };

const globalForAdminRateLimit = globalThis as unknown as {
  __adminRateLimit?: Map<string, RateLimitState>;
};

const rateLimit = (globalForAdminRateLimit.__adminRateLimit ??= new Map<string, RateLimitState>());

function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(event: RequestEvent) {
  const body = await event.request.json();
  const { token } = body ?? {};

  const ip = event.getClientAddress();
  const now = Date.now();
  const st = rateLimit.get(ip);
  if (!st || st.resetAt <= now) {
    rateLimit.set(ip, { resetAt: now + WINDOW_MS, count: 0 });
  }
  const current = rateLimit.get(ip);
  if (current && current.count >= MAX_ATTEMPTS) {
    return json({ error: 'Too many attempts' }, { status: 429 });
  }

  if (!env.ADMIN_TOKEN) {
    return json({ error: 'Admin login is not available' }, { status: 500 });
  }

  const provided = typeof token === 'string' ? token : '';
  const ok = provided && constantTimeEquals(provided, env.ADMIN_TOKEN);

  if (!ok) {
    if (current) current.count += 1;
    clearAdminCookie(event);
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }

  if (current) current.count = 0;
  setAdminCookie(event);
  return json({ ok: true });
}
