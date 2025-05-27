// src/utils/getStationMapFromDB.js
import { openDB } from 'idb';

export async function getStationMapFromDB() {
  const db = await openDB('MetaDB', 1);
  const store = db.transaction('path_station_map').objectStore('path_station_map');
  const all = await store.getAll();

  if (all.length > 0) {
    return all;
  }

  const res = await fetch('/data/bike_path_station_map.json');
  const map = await res.json();

  const tx = db.transaction('path_station_map', 'readwrite');
  const store2 = tx.objectStore('path_station_map');
  for (const m of map) {
    store2.put({
      pointKey: `${m.point.lat},${m.point.lng}`,
      ...m.station,
    });
  }
  await tx.done;
  return map;
}