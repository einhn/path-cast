// scripts/map_bikepaths_to_stations.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// 현재 파일 경로 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CommonJS 패키지 불러오기
const require = createRequire(import.meta.url);
const csv = require('csv-parser');

// 파일 경로 설정
const bikePathFile = path.resolve(__dirname, '../public/data/bike_paths_utf8.csv');
const stationFile = path.resolve(__dirname, '../public/data/stations.json');
const outputFile = path.resolve(__dirname, '../public/data/bike_path_station_map.json');

// 거리 계산
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 관측소 데이터
const stations = JSON.parse(fs.readFileSync(stationFile, 'utf8'));
const result = [];

fs.createReadStream(bikePathFile)
  .pipe(csv())
  .on('data', (row) => {
    const lat = parseFloat(row['위도(LINE_XP)']);
    const lng = parseFloat(row['경도(LINE_YP)']);
    const road = row['국토종주 자전거길'];

    if (isNaN(lat) || isNaN(lng)) return;

    let closest = null;
    let minDist = Infinity;

    for (const st of stations) {
      const dist = haversine(lat, lng, st.lat, st.lng);
      if (dist < minDist) {
        minDist = dist;
        closest = st;
      }
    }

    result.push({
      road,
      point: { lat, lng },
      station: {
        id: closest.id,
        name: closest.name,
        lat: closest.lat,
        lng: closest.lng,
        distance: minDist.toFixed(2) + ' km',
      },
    });
  })
  .on('end', () => {
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf8');
    console.log(`✅ ${result.length}개 지점 → 관측소 매핑 완료: bike_path_station_map.json 저장됨`);
  });