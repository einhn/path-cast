import { openDB } from 'idb';

export async function initStationDB() {
  const db = await openDB('WeatherDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('stations')) {
        db.createObjectStore('stations', { keyPath: 'id' });
      }
    }
  });

  const existing = await db.getAll('stations');
  if (existing.length > 0) return; // 이미 있으면 초기화 생략

  const res = await fetch('/data/stations.json');
  const stations = await res.json();

  const tx = db.transaction('stations', 'readwrite');
  const store = tx.objectStore('stations');
  for (const station of stations) {
    store.put(station);
  }
  await tx.done;
  console.log('✅ 관측소 정보 IndexedDB에 저장 완료');
}