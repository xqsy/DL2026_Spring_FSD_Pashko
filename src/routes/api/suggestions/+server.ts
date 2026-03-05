import { json, type RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export async function POST({ request }: RequestEvent) {
  const body = await request.json();

  const { questionText, lat, lng, country, city } = body ?? {};

  if (!questionText || typeof questionText !== 'string') {
    return json({ error: 'questionText is required' }, { status: 400 });
  }
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return json({ error: 'lat/lng are required' }, { status: 400 });
  }

  const suggestion = await prisma.questionSuggestion.create({
    data: {
      questionText: questionText.trim(),
      lat,
      lng,
      country: typeof country === 'string' && country.trim() ? country.trim() : null,
      city: typeof city === 'string' && city.trim() ? city.trim() : null,
    },
  });

  return json({ id: suggestion.id });
}
