import { json, type RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { setAdminCookie, clearAdminCookie } from '$lib/server/adminAuth';

export async function POST(event: RequestEvent) {
  const body = await event.request.json();
  const { token } = body ?? {};

  if (!env.ADMIN_TOKEN) {
    return json({ error: 'ADMIN_TOKEN is not configured' }, { status: 500 });
  }

  if (!token || token !== env.ADMIN_TOKEN) {
    clearAdminCookie(event);
    return json({ error: 'Invalid token' }, { status: 401 });
  }

  setAdminCookie(event);
  return json({ ok: true });
}
