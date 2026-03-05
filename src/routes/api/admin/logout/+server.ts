import { json, type RequestEvent } from '@sveltejs/kit';
import { clearAdminCookie } from '$lib/server/adminAuth';

export async function POST(event: RequestEvent) {
  clearAdminCookie(event);
  return json({ ok: true });
}
