import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import pointToLineDistance from '@turf/point-to-line-distance';
import polygonToLine from '@turf/polygon-to-line';
import { point } from '@turf/helpers';

/**
 * Check if a point is inside a country's boundaries using Turf.js
 * Returns 0 if inside, or distance to center if country not found
 */
export function getDistanceToCountry(
  clickedLat: number,
  clickedLng: number,
  countryBorder: GeoJSON.Feature | null,
  centerLat: number,
  centerLng: number
): number {
  if (!countryBorder) {
    // Fallback to center point distance if country not found
    return haversineDistance(clickedLat, clickedLng, centerLat, centerLng);
  }

  // Check if point is inside the country polygon using Turf.js
  const pt = point([clickedLng, clickedLat]);

  if (booleanPointInPolygon(pt, countryBorder as any)) {
    return 0; // Point is inside the country
  }

  const line = polygonToLine(countryBorder as any);

  // polygonToLine may return Feature or FeatureCollection depending on Polygon/MultiPolygon.
  // pointToLineDistance expects a single LineString feature/geometry, so we compute min distance
  // across all produced line parts (LineString / MultiLineString).
  const lineFeatures: any[] = [];

  const pushLineFeature = (f: any) => {
    if (!f) return;
    const geom = f.type === 'Feature' ? f.geometry : f;
    if (!geom) return;

    if (geom.type === 'LineString') {
      lineFeatures.push(f.type === 'Feature' ? f : { type: 'Feature', properties: {}, geometry: geom });
      return;
    }

    if (geom.type === 'MultiLineString') {
      for (const coords of geom.coordinates ?? []) {
        lineFeatures.push({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: coords }
        });
      }
    }
  };

  if (line && line.type === 'FeatureCollection') {
    for (const f of line.features ?? []) pushLineFeature(f);
  } else {
    pushLineFeature(line);
  }

  let min = Infinity;
  for (const f of lineFeatures) {
    const d = pointToLineDistance(pt, f as any, { units: 'kilometers' });
    if (typeof d === 'number' && Number.isFinite(d)) min = Math.min(min, d);
  }

  if (min !== Infinity) return min;

  // Fallback in case geometry is malformed
  return haversineDistance(clickedLat, clickedLng, centerLat, centerLng);
}

/**
 * Haversine distance calculation between two points
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const toRad = (deg: number) => deg * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Get GeoJSON feature for a country (for displaying on map)
 */
export function getCountryGeoJSON(countryName: string) {
  return null;
}
