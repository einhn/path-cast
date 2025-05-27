import { openDB } from 'idb';

export async function initPathStationDB() {
  const res = await fetch('/data/path_station_map.json');
  const pathStationList = await res.json();

  const db = await openDB('PathStationDB', 1, {
    upgrade(db) {
      db.createObjectStore('map', { keyPath: 'pointId' });
    }
  });

  const tx = db.transaction('map', 'readwrite');
  const store = tx.objectStore('map');

  for (const entry of pathStationList) {
    await store.put(entry);
  }

  await tx.done;
  console.log('✅ 경로-관측소 매핑 저장 완료');
}