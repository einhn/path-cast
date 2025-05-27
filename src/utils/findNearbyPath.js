import { openDB } from 'idb';

export const findPathsNear = async (origin, thresholdKm = 5) => {
  const db = await openDB('BikeDB', 1);
  const tx = db.transaction('bike_paths', 'readonly');
  const paths = await tx.store.getAll();

  const withinDistance = (p) => {
    const dx = haversine(origin, { lat: p.lat, lon: p.lon });
    return dx <= thresholdKm;
  };

  return paths.filter(withinDistance);
};

// Haversine 거리 계산 (단위: km)
function haversine(p1, p2) {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lon - p1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}