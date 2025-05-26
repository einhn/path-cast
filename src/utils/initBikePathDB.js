// src/utils/initBikePathDB.js
import { openDB } from 'idb';
import Papa from 'papaparse';

// 1. IndexedDB 초기화 및 데이터 삽입
export async function initBikePathDB() {
  try {
    // CSV 로드
    const res = await fetch('/data/bike_paths_utf8.csv');
    const text = await res.text();

    // CSV 파싱
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    // DB 생성
    const db = await openDB('BikeDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('bike_paths')) {
          db.createObjectStore('bike_paths', { keyPath: '순서' });
        }
      },
    });

    // 트랜잭션 시작
    const tx = db.transaction('bike_paths', 'readwrite');
    const store = tx.objectStore('bike_paths');

    // 데이터 삽입
    for (const row of parsed.data) {
      store.put(row);
    }

    await tx.done;
    console.log('✅ 자전거길 데이터 IndexedDB에 저장 완료');
  } catch (err) {
    console.error('❌ IndexedDB 저장 실패:', err);
  }
}