// scripts/test_sample_route.js
import { sampleRouteWithStations } from '../src/lib/geo/sampleRouteWithStations.js';
import haversine from 'haversine-distance';

const route = [
  { lat: 37.563569, lng: 126.980008 },
  { lat: 37.570377, lng: 126.981641 },
  { lat: 37.584137, lng: 126.970652 }
];

// 거리 출력
console.log('🧪 경로 길이:', route.length);
let total = 0;
for (let i = 1; i < route.length; i++) {
  const d = haversine(route[i - 1], route[i]);
  console.log(`구간 ${i}: ${d.toFixed(2)}m`);
  total += d;
}
console.log(`📏 총 거리: ${total.toFixed(2)}m`);

// 샘플링
const sampled = sampleRouteWithStations(route, 500);
console.log('📍 샘플링된 지점 수:', sampled.length);

// 고유 관측소 ID 추출
const uniqueStations = [...new Set(sampled.map(p => p.stationId))];
console.log('📡 고유 관측소 ID:', uniqueStations);