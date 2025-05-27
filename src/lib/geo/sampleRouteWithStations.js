import haversine from 'haversine-distance';

/**
 * @param {Array<{ lat: number, lng: number }>} route - 유저 경로
 * @param {Array<{ id: string, lat: number, lng: number, gridX: number, gridY: number }>} stationList
 * @param {number} interval - 샘플링 간격 (기본 500m)
 * @returns {Array<{ lat: number, lng: number, id: string, gridX: number, gridY: number }>}
 */
export function sampleRouteWithStations(route, stationList, interval = 500) {
  if (route.length < 2) return [];

  const sampled = [];
  let accumulated = 0;
  let prev = route[0];
  sampled.push({ ...prev });

  for (let i = 1; i < route.length; i++) {
    const curr = route[i];
    const dist = haversine(prev, curr);
    accumulated += dist;

    while (accumulated >= interval) {
      sampled.push({ ...curr });
      accumulated -= interval;
    }

    prev = curr;
  }

  return sampled.map((pt) => {
    const nearest = findNearestStation(pt, stationList);
    return { ...pt, ...nearest }; // id, gridX, gridY 포함
  }).filter(p => p.id && p.gridX && p.gridY);
}

/**
 * @param {{ lat: number, lng: number }} point
 * @param {Array<{ id: string, lat: number, lng: number, gridX: number, gridY: number }>} stations
 * @returns {{ id: string, gridX: number, gridY: number } | null}
 */
function findNearestStation(point, stations) {
  let nearest = null;
  let minDist = Infinity;

  for (const s of stations) {
    const dist = haversine(point, { lat: s.lat, lng: s.lng });
    if (dist < minDist) {
      minDist = dist;
      nearest = s;
    }
  }

  return nearest;
}