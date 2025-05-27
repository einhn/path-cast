export const sampleRouteAndMatchStations = async (path) => {
  const samples = sampleEvery5km(path);
  const stationDB = await openDB('WeatherDB', 1);
  const stations = await stationDB.getAll('stations');

  return samples.map((point) => {
    const closest = stations.reduce((prev, curr) => {
      const d1 = haversine(point, prev);
      const d2 = haversine(point, curr);
      return d1 < d2 ? prev : curr;
    });
    return { ...point, stationId: closest.id };
  });
};