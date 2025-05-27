// src/lib/db/queryNearbyBikePath.js

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 지구 반지름 (m)
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 주어진 위치에서 일정 반경 내 자전거길 좌표들을 IndexedDB에서 찾음
 * @param {IDBDatabase} db - opened IndexedDB instance
 * @param {{ lat: number, lng: number }} location - 기준 좌표
 * @param {number} radius - 반경 (미터 단위)
 * @returns {Promise<Array<{ lat: number, lng: number, road: string }>>}
 */
export function queryNearbyBikePath(db, location, radius) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bike_paths', 'readonly');
    const store = tx.objectStore('bike_paths');
    const req = store.getAll();

    req.onsuccess = () => {
      const result = req.result.filter((point) => {
        const d = haversineDistance(location.lat, location.lng, point.lat, point.lng);
        return d <= radius;
      });

      resolve(result);
    };

    req.onerror = () => reject(req.error);
  });
}