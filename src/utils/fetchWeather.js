/**
 * 관측소의 격자 정보(nx, ny)를 이용해 기상청 날씨 예보를 가져옴
 * @param {{ id: string, gridX: number, gridY: number }} station - 관측소 정보
 * @param {string} baseDate - 기준 날짜 (예: '20250527')
 * @param {string} baseTime - 기준 시간 (예: '1230')
 * @returns {Promise<Object[] | null>} - 날씨 예보 항목 배열
 */
export const fetchWeatherFromStation = async (station, baseDate, baseTime) => {
  const { gridX, gridY } = station;

  try {
    const response = await fetch(
      `/api/weather?nx=${gridX}&ny=${gridY}&stationId=${station.id}&base_date=${baseDate}&base_time=${baseTime}`
    );

    const data = await response.json();
    return data.response?.body?.items?.item ?? null;

  } catch (err) {
    console.error(`❌ ${station.id} 날씨 조회 실패`, err);
    return null;
  }
};