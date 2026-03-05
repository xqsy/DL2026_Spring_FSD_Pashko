import { json, type RequestEvent } from '@sveltejs/kit';
import { getCountryBorderFeatureByName } from '$lib/server/countryBordersService';

export async function GET({ url }: RequestEvent) {
  const name = url.searchParams.get('name');
  if (!name) {
    return json({ error: 'Missing name' }, { status: 400 });
  }

  try {
    const feature = await getCountryBorderFeatureByName(name);
    if (!feature) {
      return json({ feature: null }, { status: 200 });
    }

    return json({ feature }, { status: 200 });
  } catch (e) {
    return json({ error: 'Failed to load border' }, { status: 500 });
  }
}
