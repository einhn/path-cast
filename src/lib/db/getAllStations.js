import { openDB } from 'idb';

export async function getAllStationsFromDB() {
  const db = await openDB('WeatherDB', 1);
  return await db.getAll('stations');
}