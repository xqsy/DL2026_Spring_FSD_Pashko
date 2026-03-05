/**
 * Calculate distance between two points on Earth using Haversine formula
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate points based on distance
 * @param distanceKm Distance in kilometers
 * @param usedHint Whether player used a hint
 * @returns Points earned
 */
export function calculatePoints(distanceKm: number, usedHint: boolean = false): number {
  const MAX_POINTS = 1000;
  const POINTS_PER_KM = 1;
  const HINT_PENALTY = 100;

  let points = Math.max(0, MAX_POINTS - Math.floor(distanceKm * POINTS_PER_KM));

  if (usedHint) {
    points = Math.max(0, points - HINT_PENALTY);
  }

  return points;
}
