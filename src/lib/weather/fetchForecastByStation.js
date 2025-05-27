// src/lib/weather/fetchForecastByStation.js

/**
 * @param {{ id: string, gridX: number, gridY: number }} station
 * @param {string} baseDate
 * @param {string} baseTime
 * @returns {Promise<Object|null>}
 */
export async function fetchForecastByStation(station, baseDate, baseTime) {
  const key = import.meta.env.VITE_KMA_ENCODED_API_KEY;

  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?` +
              `serviceKey=${key}&numOfRows=60&pageNo=1&dataType=JSON` +
              `&base_date=${baseDate}&base_time=${baseTime}` +
              `&nx=${station.gridX}&ny=${station.gridY}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json.response?.body?.items?.item) {
      return json.response.body.items.item;
    }

    console.warn(`📭 No forecast data for station ${station.id}`);
    return null;
  } catch (err) {
    console.error(`❌ ${station.id} 날씨 조회 실패`, err);
    return null;
  }
}