import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { countriesGeoJSON } from './countryGeoJSON';

/**
 * Check if a point is inside a country's boundaries using Turf.js
 * Returns 0 if inside, or distance to center if country not found
 */
export function getDistanceToCountry(
  clickedLat: number,
  clickedLng: number,
  countryName: string,
  centerLat: number,
  centerLng: number
): number {
  const geoJson = countriesGeoJSON[countryName];

  if (!geoJson) {
    // Fallback to center point distance if country not found
    return haversineDistance(clickedLat, clickedLng, centerLat, centerLng);
  }

  // Check if point is inside the country polygon using Turf.js
  const point = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Point' as const,
      coordinates: [clickedLng, clickedLat] // GeoJSON uses [lng, lat]
    }
  };

  if (booleanPointInPolygon(point, geoJson)) {
    return 0; // Point is inside the country
  }

  // Point is outside - calculate distance to center
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
  return countriesGeoJSON[countryName] || null;
}
