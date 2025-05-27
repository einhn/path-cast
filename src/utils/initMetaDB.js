// src/utils/initMetaDB.js
import { openDB } from 'idb';

export async function initMetaDB() {
  const db = await openDB('MetaDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('stations')) {
        db.createObjectStore('stations', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('path_station_map')) {
        db.createObjectStore('path_station_map', { keyPath: 'pointKey' });
      }
    },
  });

  const stationRes = await fetch('/data/stations.json');
  const stations = await stationRes.json();
  const mapRes = await fetch('/data/bike_path_station_map.json');
  const stationMap = await mapRes.json();

  const tx = db.transaction(['stations', 'path_station_map'], 'readwrite');
  const stationStore = tx.objectStore('stations');
  const mapStore = tx.objectStore('path_station_map');

  for (const s of stations) stationStore.put(s);
  for (const m of stationMap) {
    mapStore.put({
      pointKey: `${m.point.lat},${m.point.lng}`,
      ...m.station,
    });
  }

  await tx.done;
  console.log('✅ MetaDB 저장 완료');
}
