// scripts/rebuild_station_index.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 만들기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일 경로 정의
const inputPath = path.resolve(__dirname, '../public/data/bike_path_station_map.json');
const outputPath = path.resolve(__dirname, '../public/data/bike_path_station_index.json');

// 원본 파일 로드
const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// 변환: { "lat,lng": stationId } 형태로
const indexed = {};
for (const { point, station } of raw) {
  const key = `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`;
  indexed[key] = station.id;
}

// 저장
fs.writeFileSync(outputPath, JSON.stringify(indexed, null, 2), 'utf8');

console.log(`✅ ${Object.keys(indexed).length}개 지점을 인덱스로 저장했습니다.`);
console.log(`📁 저장 경로: ${outputPath}`);