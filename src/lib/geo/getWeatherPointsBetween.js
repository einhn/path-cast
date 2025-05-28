// src/lib/geo/sampleRouteWithStations.js
import haversine from 'haversine-distance';

/**
 * 자전거길 좌표 ↔ 관측소 매핑 데이터 기반으로 출발/도착 사이의 경로를 샘플링
 *
 * @param {{ lat: number, lng: number }} from
 * @param {{ lat: number, lng: number }} to
 * @param {any[]} stations (사용 안 함, 호환성 유지를 위한 인자)
 * @param {number} interval (샘플링 거리 간격, 단위: meter)
 * @returns {Promise<Array<{ lat, lng, id, gridX, gridY }>>}
 */
export async function sampleRouteWithStations(from, to, stations = [], interval = 10000) {
  console.log('📍[sampleRouteWithStations] called with:');
  console.log('   - from:', from);
  console.log('   - to:', to);

  const res = await fetch('/data/bike_path_weather_map.json');
  console.log('📦 fetch status:', res.status, res.headers.get('content-type'));
  const map = await res.json();
  console.log(`✅ loaded bike_path_weather_map.json (${map.length} entries)`);

  const calcDistance = (a, b) => haversine(a, b) / 1000; // 거리(km)

  // 1. 출발지에서 가장 가까운 지점 탐색
  let minFrom = null, minFromDist = Infinity;
  map.forEach((p, i) => {
    const d = calcDistance(from, p.point);
    if (d < minFromDist) {
      minFrom = { ...p, idx: i };
      minFromDist = d;
    }
  });

  // 2. 도착지에서 가장 가까운 지점 탐색
  let minTo = null, minToDist = Infinity;
  map.forEach((p, i) => {
    const d = calcDistance(to, p.point);
    if (d < minToDist) {
      minTo = { ...p, idx: i };
      minToDist = d;
    }
  });

  console.log(`🎯 가장 가까운 출발지 index: ${minFrom.idx}, road: ${minFrom.road}, 거리: ${minFromDist.toFixed(2)}km`);
  console.log(`🎯 가장 가까운 도착지 index: ${minTo.idx}, road: ${minTo.road}, 거리: ${minToDist.toFixed(2)}km`);

  let subset = [];

  // 3. 동일한 자전거길 내 구간 선택
  if (minFrom.road === minTo.road) {
    const [startIdx, endIdx] = [minFrom.idx, minTo.idx].sort((a, b) => a - b);
    subset = map.slice(startIdx, endIdx + 1);
    console.log(`📌 동일한 road (${minFrom.road}) 내 구간 ${startIdx}~${endIdx} 선택됨`);
  } else {
    // 4. 서로 다른 자전거길이면 road 범위로 단순 포함
    const [roadMin, roadMax] = [minFrom.road, minTo.road].sort((a, b) => a - b);
    subset = map.filter(p => p.road >= roadMin && p.road <= roadMax);
    console.log(`📌 서로 다른 road (${minFrom.road}, ${minTo.road}) → road ${roadMin}~${roadMax} 전체 포함`);
  }

  // 5. 거리 간격 기반 샘플링 (5km 간격)
  const sampled = [];
  let prev = null;
  for (const p of subset) {
    if (!prev) {
      sampled.push(p);
      prev = p;
    } else {
      const dist = calcDistance(prev.point, p.point);
      if (dist >= 5) {
        sampled.push(p);
        prev = p;
      }
    }
  }

  // 6. 반환: 관측소 + 좌표
  const result = sampled.map(p => ({
    ...p.station,
    lat: p.point.lat,
    lng: p.point.lng,
  }));

  console.log(`✅ 샘플링된 날씨 포인트 개수: ${result.length} (5km 간격)`);
  return result;
}