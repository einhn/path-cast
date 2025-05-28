// src/utils/getBikePathFromDB.js
import { openDB } from 'idb';

export async function getBikePathFromDB() {
  const db = await openDB('BikeDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('bike_paths')) {
        db.createObjectStore('bike_paths', { keyPath: 'id', autoIncrement: true });
      }
    },
  });

  // 🟢 먼저 캐시에서 로드
  const tx = db.transaction('bike_paths', 'readonly');
  const store = tx.objectStore('bike_paths');
  const allPaths = await store.getAll();
  if (allPaths.length > 0) return allPaths;

  // 🟠 없으면 JSON에서 가져와 저장
  const res = await fetch('/data/bike_paths_utf8.json');
  const paths = await res.json();

  const writeTx = db.transaction('bike_paths', 'readwrite');
  const writeStore = writeTx.objectStore('bike_paths');

  for (const p of paths) {
    const lat = parseFloat(p.lat);
    const lng = parseFloat(p.lng);
    if (!isNaN(lat) && !isNaN(lng) && p.road) {
      writeStore.put({ lat, lng, road: p.road });
    }
  }

  await writeTx.done;
  return paths;
}