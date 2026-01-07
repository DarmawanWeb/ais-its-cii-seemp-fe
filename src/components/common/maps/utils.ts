/**
 * Convert zoom level to search radius in kilometers
 * Higher zoom = smaller radius (more zoomed in)
 * Lower zoom = larger radius (more zoomed out)
 */
export const zoomToRadiusKm = (zoom: number): number => {
  // Zoom levels typically range from 0 (world) to 18+ (building)
  // Let's create a smooth exponential decay

  if (zoom >= 18) return 0.5; // Very zoomed in - 500m radius
  if (zoom >= 17) return 0.75; // 750m
  if (zoom >= 16) return 1; // 1km
  if (zoom >= 15) return 1.5; // 1.5km
  if (zoom >= 14) return 2; // 2km
  if (zoom >= 13) return 3; // 3km
  if (zoom >= 12) return 5; // 5km
  if (zoom >= 11) return 7; // 7km
  if (zoom >= 10) return 10; // 10km
  if (zoom >= 9) return 15; // 15km
  if (zoom >= 8) return 25; // 25km
  if (zoom >= 7) return 40; // 40km
  if (zoom >= 6) return 60; // 60km
  if (zoom >= 5) return 100; // 100km
  if (zoom >= 4) return 150; // 150km
  if (zoom >= 3) return 250; // 250km
  if (zoom >= 2) return 500; // 500km
  if (zoom >= 1) return 1000; // 1000km
  return 2000; // World view - 2000km
};

/**
 * Format radius for display
 */
export const formatRadius = (radiusKm: number): string => {
  if (radiusKm < 1) {
    return `${(radiusKm * 1000).toFixed(0)}m`;
  }
  return `${radiusKm.toFixed(1)}km`;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
