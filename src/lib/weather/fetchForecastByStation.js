// src/lib/weather/fetchForecastByStation.js
/**
 * 기상청 초단기예보 데이터를 서버리스 프록시를 통해 조회
 *
 * @param {{ id: string, gridX: number, gridY: number }} station
 * @param {string} baseDate - 'YYYYMMDD'
 * @param {string} baseTime - 'HHmm'
 * @returns {Promise<Object[]|null>} - 예보 항목 배열 or null
 */
export async function fetchForecastByStation(station, baseDate, baseTime) {
  if (!station?.gridX || !station?.gridY) {
    console.warn('⚠️ station 정보 부족:', station);
    return null;
  }

  const query = new URLSearchParams({
    id: station.id,
    gridX: station.gridX.toString(),
    gridY: station.gridY.toString(),
    base_date: baseDate,
    base_time: baseTime,
  });

  const url = `https://vercel-serverless-ebon.vercel.app/api/weather?${query.toString()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (Array.isArray(data)) {
      return data;
    } else {
      console.warn(`📭 ${station.id} 응답 형식 이상`, data);
      return null;
    }
  } catch (err) {
    console.error(`❌ ${station.id} 날씨 조회 실패`, err);
    return null;
  }
}