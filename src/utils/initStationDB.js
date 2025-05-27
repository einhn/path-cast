import { openDB } from 'idb';

export const initStationDB = async () => {
  const db = await openDB('WeatherDB', 1, {
    upgrade(db) {
      const store = db.createObjectStore('stations', { keyPath: 'id' });
      store.createIndex('lat', 'lat');
      store.createIndex('lon', 'lon');
    },
  });

  const response = await fetch('/data/weather_stations.json');
  const stations = await response.json();

  for (const s of stations) {
    await db.put('stations', s);
  }

  console.log('✅ 기상관측소 데이터 저장 완료');
};