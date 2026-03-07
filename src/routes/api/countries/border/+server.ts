import { json, type RequestEvent } from '@sveltejs/kit';
import { getCountryBorderFeatureByName, getCountryBorderFeatureByPoint } from '$lib/server/countryBordersService';

export async function GET({ url }: RequestEvent) {
  const name = url.searchParams.get('name');

  const latParam = url.searchParams.get('lat');
  const lngParam = url.searchParams.get('lng');
  const lat = latParam !== null ? Number(latParam) : null;
  const lng = lngParam !== null ? Number(lngParam) : null;

  if (!name && (lat === null || lng === null)) {
    return json({ error: 'Missing name or lat/lng' }, { status: 400 });
  }

  try {
    const feature =
      lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng)
        ? await getCountryBorderFeatureByPoint(lat, lng)
        : await getCountryBorderFeatureByName(name as string);
    if (!feature) {
      return json({ feature: null }, { status: 200 });
    }

    return json({ feature }, { status: 200 });
  } catch (e) {
    return json({ error: 'Failed to load border' }, { status: 500 });
  }
}
