import { env } from '$env/dynamic/private';
import { error, type RequestEvent } from '@sveltejs/kit';
import crypto from 'node:crypto';

const COOKIE_NAME = 'admin_session';

const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  iat: number;
  exp: number;
  nonce: string;
};

function getSecret(): string {
  const secret = env.ADMIN_TOKEN;
  if (!secret) throw error(500, 'ADMIN_TOKEN is not configured');
  return secret;
}

function sign(payloadB64: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decodePayload(payloadB64: string): SessionPayload | null {
  try {
    const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const data = JSON.parse(json) as Partial<SessionPayload>;
    if (typeof data.iat !== 'number' || typeof data.exp !== 'number' || typeof data.nonce !== 'string') return null;
    return { iat: data.iat, exp: data.exp, nonce: data.nonce };
  } catch {
    return null;
  }
}

function verifySession(value: string, secret: string): boolean {
  const parts = value.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return false;

  const expected = sign(payloadB64, secret);

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;

  const payload = decodePayload(payloadB64);
  if (!payload) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

export function isAdmin(event: RequestEvent): boolean {
  const value = event.cookies.get(COOKIE_NAME);
  if (!value) return false;
  const secret = env.ADMIN_TOKEN;
  if (!secret) return false;
  return verifySession(value, secret);
}

export function requireAdmin(event: RequestEvent): void {
  if (!isAdmin(event)) {
    throw error(401, 'Unauthorized');
  }
}

export function setAdminCookie(event: RequestEvent): void {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  const payloadB64 = encodePayload(payload);
  const value = `${payloadB64}.${sign(payloadB64, secret)}`;

  event.cookies.set(COOKIE_NAME, value, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAdminCookie(event: RequestEvent): void {
  event.cookies.delete(COOKIE_NAME, { path: '/' });
}
