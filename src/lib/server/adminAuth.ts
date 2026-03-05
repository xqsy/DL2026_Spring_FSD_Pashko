import { env } from '$env/dynamic/private';
import { error, type RequestEvent } from '@sveltejs/kit';

const COOKIE_NAME = 'admin_token';

export function isAdmin(event: RequestEvent): boolean {
  const token = event.cookies.get(COOKIE_NAME);
  return Boolean(token && env.ADMIN_TOKEN && token === env.ADMIN_TOKEN);
}

export function requireAdmin(event: RequestEvent): void {
  if (!isAdmin(event)) {
    throw error(401, 'Unauthorized');
  }
}

export function setAdminCookie(event: RequestEvent): void {
  const token = env.ADMIN_TOKEN;
  if (!token) throw error(500, 'ADMIN_TOKEN is not configured');

  event.cookies.set(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAdminCookie(event: RequestEvent): void {
  event.cookies.delete(COOKIE_NAME, { path: '/' });
}
