// src/utils/getStationsFromDB.js
import { openDB } from 'idb';

export async function getStationsFromDB() {
  const db = await openDB('MetaDB', 1);
  const store = db.transaction('stations').objectStore('stations');
  const allStations = await store.getAll();

  if (allStations.length > 0) {
    return allStations;
  }

  const res = await fetch('/data/stations.json');
  const stations = await res.json();
  const tx = db.transaction('stations', 'readwrite');
  const store2 = tx.objectStore('stations');
  for (const s of stations) store2.put(s);
  await tx.done;
  return stations;
}
