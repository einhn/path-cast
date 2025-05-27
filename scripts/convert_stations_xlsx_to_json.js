import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

// 경로 설정
const inputPath = path.resolve('public/data/stations.xlsx');
const outputPath = path.resolve('public/data/stations.json');

// 1. 엑셀 파일 열기
const workbook = xlsx.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// 2. 시트 → JSON 배열
const data = xlsx.utils.sheet_to_json(sheet);
console.log('🔎 원본 샘플:', data.slice(0, 1));

// 3. 필요한 필드만 추출
const stations = data
  .map((row, idx) => ({
    id: String(idx),
    name: [row['1단계'], row['2단계'], row['3단계']].filter(Boolean).join(' ').trim(),
    lat: parseFloat(row['위도(초/100)']),
    lng: parseFloat(row['경도(초/100)']),
    gridX: parseInt(row['격자 X'], 10),
    gridY: parseInt(row['격자 Y'], 10),
  }))
  .filter(st => !isNaN(st.lat) && !isNaN(st.lng));

console.log(`✅ 총 ${stations.length}개 관측소 변환 완료`);

// 4. 저장
fs.writeFileSync(outputPath, JSON.stringify(stations, null, 2), 'utf8');
console.log(`📁 저장 완료: ${outputPath}`);