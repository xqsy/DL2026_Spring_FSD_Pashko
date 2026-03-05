type Point = { lat: number; lng: number };

/**
 * Simplified country borders as polygons
 * Each country has an array of polygon rings representing its approximate boundary
 */
export const countryBorders: Record<string, Point[][]> = {
  'Франция': [
    [{lat: 51.09, lng: 2.54}, {lat: 50.87, lng: 1.86}, {lat: 49.73, lng: 1.78}, {lat: 48.65, lng: -1.78}, {lat: 47.78, lng: -3.17},
     {lat: 46.35, lng: -1.78}, {lat: 44.25, lng: -1.78}, {lat: 43.34, lng: -1.78}, {lat: 42.43, lng: 3.14}, {lat: 43.34, lng: 6.92},
     {lat: 44.25, lng: 7.56}, {lat: 45.0, lng: 7.56}, {lat: 46.15, lng: 8.94}, {lat: 47.58, lng: 7.56}, {lat: 48.0, lng: 7.56},
     {lat: 48.65, lng: 8.94}, {lat: 49.73, lng: 8.3}, {lat: 51.09, lng: 2.54}]
  ],
  'Италия': [
    [{lat: 47.09, lng: 12.34}, {lat: 46.85, lng: 12.34}, {lat: 46.52, lng: 13.59}, {lat: 45.85, lng: 13.59}, {lat: 45.0, lng: 13.59},
     {lat: 44.31, lng: 12.29}, {lat: 44.05, lng: 12.39}, {lat: 43.0, lng: 12.0}, {lat: 41.95, lng: 12.39}, {lat: 40.0, lng: 18.0},
     {lat: 39.0, lng: 16.0}, {lat: 38.0, lng: 15.7}, {lat: 37.95, lng: 15.6}, {lat: 38.9, lng: 16.0}, {lat: 39.8, lng: 17.0},
     {lat: 40.6, lng: 18.3}, {lat: 41.2, lng: 19.4}, {lat: 42.0, lng: 19.4}, {lat: 42.5, lng: 18.5}, {lat: 43.2, lng: 16.0},
     {lat: 44.0, lng: 14.0}, {lat: 44.8, lng: 13.0}, {lat: 45.6, lng: 13.7}, {lat: 46.5, lng: 13.7}, {lat: 47.09, lng: 12.34}]
  ],
  'Япония': [
    [{lat: 45.52, lng: 141.23}, {lat: 45.35, lng: 140.9}, {lat: 44.5, lng: 141.0}, {lat: 43.5, lng: 145.0}, {lat: 42.0, lng: 141.0},
     {lat: 41.5, lng: 140.5}, {lat: 41.0, lng: 139.5}, {lat: 40.0, lng: 139.5}, {lat: 39.0, lng: 139.5}, {lat: 38.0, lng: 140.5},
     {lat: 37.0, lng: 140.5}, {lat: 36.0, lng: 139.5}, {lat: 35.0, lng: 139.5}, {lat: 34.0, lng: 134.5}, {lat: 33.0, lng: 132.0},
     {lat: 32.0, lng: 131.0}, {lat: 31.0, lng: 131.0}, {lat: 30.0, lng: 130.5}, {lat: 30.5, lng: 131.5}, {lat: 31.5, lng: 131.0},
     {lat: 33.0, lng: 133.0}, {lat: 34.5, lng: 135.0}, {lat: 35.5, lng: 139.5}, {lat: 36.5, lng: 140.5}, {lat: 38.0, lng: 141.5},
     {lat: 40.0, lng: 141.5}, {lat: 42.0, lng: 141.0}, {lat: 43.5, lng: 145.5}, {lat: 44.5, lng: 145.0}, {lat: 45.52, lng: 141.23}]
  ],
  'Бразилия': [
    [{lat: 5.27, lng: -60.0}, {lat: 4.0, lng: -58.0}, {lat: 2.0, lng: -50.0}, {lat: 0.0, lng: -50.0}, {lat: -2.0, lng: -50.0},
     {lat: -5.0, lng: -52.0}, {lat: -10.0, lng: -55.0}, {lat: -15.0, lng: -55.0}, {lat: -20.0, lng: -55.0}, {lat: -25.0, lng: -55.0},
     {lat: -30.0, lng: -55.0}, {lat: -33.0, lng: -55.0}, {lat: -33.5, lng: -53.5}, {lat: -32.0, lng: -52.0}, {lat: -30.0, lng: -50.0},
     {lat: -25.0, lng: -48.0}, {lat: -20.0, lng: -40.0}, {lat: -15.0, lng: -40.0}, {lat: -10.0, lng: -36.0}, {lat: -5.0, lng: -35.0},
     {lat: 0.0, lng: -35.0}, {lat: 2.0, lng: -50.0}, {lat: 4.0, lng: -51.0}, {lat: 5.27, lng: -60.0}]
  ],
  'Канада': [
    [{lat: 83.0, lng: -74.0}, {lat: 83.0, lng: -60.0}, {lat: 75.0, lng: -60.0}, {lat: 70.0, lng: -95.0}, {lat: 65.0, lng: -95.0},
     {lat: 60.0, lng: -140.0}, {lat: 55.0, lng: -130.0}, {lat: 50.0, lng: -130.0}, {lat: 48.0, lng: -125.0}, {lat: 48.0, lng: -123.0},
     {lat: 49.0, lng: -95.0}, {lat: 52.0, lng: -80.0}, {lat: 55.0, lng: -60.0}, {lat: 60.0, lng: -60.0}, {lat: 65.0, lng: -75.0},
     {lat: 70.0, lng: -75.0}, {lat: 75.0, lng: -95.0}, {lat: 83.0, lng: -74.0}]
  ],
  'Индия': [
    [{lat: 35.5, lng: 76.5}, {lat: 35.0, lng: 74.0}, {lat: 32.0, lng: 74.0}, {lat: 30.0, lng: 70.0}, {lat: 28.0, lng: 68.0},
     {lat: 25.0, lng: 68.0}, {lat: 23.0, lng: 68.0}, {lat: 22.0, lng: 72.0}, {lat: 20.0, lng: 72.0}, {lat: 18.0, lng: 72.0},
     {lat: 15.0, lng: 73.0}, {lat: 11.0, lng: 79.0}, {lat: 8.0, lng: 77.0}, {lat: 8.0, lng: 80.0}, {lat: 10.0, lng: 80.0},
     {lat: 12.0, lng: 80.0}, {lat: 15.0, lng: 90.0}, {lat: 22.0, lng: 90.0}, {lat: 25.0, lng: 90.0}, {lat: 27.0, lng: 88.0},
     {lat: 28.0, lng: 88.0}, {lat: 28.0, lng: 85.0}, {lat: 27.0, lng: 83.0}, {lat: 26.0, lng: 80.0}, {lat: 28.0, lng: 77.0},
     {lat: 30.0, lng: 77.0}, {lat: 32.0, lng: 79.0}, {lat: 34.0, lng: 77.0}, {lat: 35.5, lng: 76.5}]
  ],
  'Египет': [
    [{lat: 31.5, lng: 25.0}, {lat: 31.0, lng: 25.0}, {lat: 29.0, lng: 25.0}, {lat: 27.0, lng: 25.0}, {lat: 25.0, lng: 25.0},
     {lat: 22.0, lng: 25.0}, {lat: 22.0, lng: 30.0}, {lat: 22.0, lng: 32.0}, {lat: 23.0, lng: 35.0}, {lat: 25.0, lng: 35.0},
     {lat: 27.0, lng: 33.0}, {lat: 29.0, lng: 33.0}, {lat: 31.0, lng: 33.0}, {lat: 31.5, lng: 32.0}, {lat: 31.5, lng: 25.0}]
  ],
  'Австралия': [
    [{lat: -10.0, lng: 142.0}, {lat: -12.0, lng: 143.0}, {lat: -14.0, lng: 143.0}, {lat: -15.0, lng: 145.0}, {lat: -18.0, lng: 146.0},
     {lat: -20.0, lng: 148.0}, {lat: -25.0, lng: 152.0}, {lat: -28.0, lng: 153.0}, {lat: -30.0, lng: 153.0}, {lat: -35.0, lng: 150.0},
     {lat: -38.0, lng: 145.0}, {lat: -39.0, lng: 140.0}, {lat: -38.0, lng: 135.0}, {lat: -35.0, lng: 135.0}, {lat: -34.0, lng: 130.0},
     {lat: -32.0, lng: 125.0}, {lat: -30.0, lng: 115.0}, {lat: -22.0, lng: 115.0}, {lat: -15.0, lng: 125.0}, {lat: -12.0, lng: 135.0},
     {lat: -10.0, lng: 142.0}]
  ]
};

/**
 * Calculate distance from a point to a polygon boundary
 * Returns 0 if point is inside the polygon
 */
export function distanceToPolygon(
  pointLat: number,
  pointLng: number,
  polygon: { lat: number; lng: number }[]
): number {
  // Check if point is inside polygon
  if (pointInPolygon(pointLat, pointLng, polygon)) {
    return 0;
  }

  // Find minimum distance to polygon edges
  let minDistance = Infinity;

  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    const dist = distanceToSegment(pointLat, pointLng, p1.lat, p1.lng, p2.lat, p2.lng);
    minDistance = Math.min(minDistance, dist);
  }

  return minDistance;
}

/**
 * Check if point is inside polygon using ray casting
 */
function pointInPolygon(lat: number, lng: number, polygon: { lat: number; lng: number }[]): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;

    if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calculate distance from point to line segment
 */
function distanceToSegment(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  // Use Haversine for accurate distance
  return haversineDistance(px, py, xx, yy);
}

/**
 * Haversine distance calculation
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
 * Get distance to country border
 * Returns distance in km, or 0 if country not found (falls back to center point)
 */
export function getDistanceToCountry(
  clickedLat: number,
  clickedLng: number,
  countryName: string,
  centerLat: number,
  centerLng: number
): number {
  const borders = countryBorders[countryName];

  if (!borders || borders.length === 0) {
    // Fallback to center point distance
    return haversineDistance(clickedLat, clickedLng, centerLat, centerLng);
  }

  // Calculate distance to each polygon ring (some countries have multiple)
  let minDistance = Infinity;

  for (const ring of borders) {
    const dist = distanceToPolygon(clickedLat, clickedLng, ring);
    minDistance = Math.min(minDistance, dist);
  }

  return minDistance;
}
