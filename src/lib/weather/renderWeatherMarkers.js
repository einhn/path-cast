// src/lib/weater/renderWeatherMarkers.js
/**
 * 온도에 따라 텍스트 색상 결정
 */
const getTemperatureColor = (temp) => {
  const t = parseFloat(temp);
  if (t >= 30) return 'red';
  if (t >= 20) return 'orange';
  if (t >= 10) return 'blue';
  return 'navy';
};

/**
 * 풍향에 따라 화살표 회전 각도 (기상청 기준은 북=0, 시계방향)
 */
const getArrowStyle = (vec) => {
  const degree = parseFloat(vec) || 0;
  return `transform: rotate(${degree}deg); display: inline-block; transition: 0.3s;`;
};

/**
 * 지도 위에 날씨 정보를 CustomOverlay로 생성하고 반환
 *
 * @param {kakao.maps.Map} map
 * @param {Array<{ lat: number, lng: number, id: string, gridX: number, gridY: number }>} points
 * @param {string} baseDate
 * @param {string} baseTime
 * @param {(station: { id: string, gridX: number, gridY: number }, baseDate: string, baseTime: string) => Promise<Object[]|null>} fetchForecastByStation
 * @returns {Promise<kakao.maps.CustomOverlay[]>} 날씨 오버레이 배열
 */

export function renderSingleWeatherMarker(map, station, forecast) {
  try {
    const position = new window.kakao.maps.LatLng(station.lat, station.lng);

    const temp = forecast.find(f => f.category === 'T1H')?.fcstValue ?? '?';
    const windDir = forecast.find(f => f.category === 'VEC')?.fcstValue ?? '0';
    const windSpd = forecast.find(f => f.category === 'WSD')?.fcstValue ?? '?';
    const popRaw = forecast.find(f => f.category === 'POP')?.fcstValue;
    const pop = popRaw !== undefined ? parseInt(popRaw, 10) : null;

    const rainText = (pop === null || isNaN(pop))
      ? '강수 확률 없음'
      : pop <= 10
        ? '강수 확률 없음'
        : `강수 확률: ${pop}%`;

    const arrow = `<span style="${getArrowStyle(windDir)}">⬆️</span>`;
    const tempColor = getTemperatureColor(temp);

    const content = `
      <div style="padding:5px; background:#fff; border:1px solid #999; border-radius:8px;">
        <div style="color:${tempColor}; font-weight:bold;">🌡 ${temp}℃</div>
        <div style="color:black;">💨 ${arrow} ${windSpd} m/s</div>
        <div style="color:#0288d1;">💧 ${rainText}</div>
      </div>
    `;

    const customOverlay = new window.kakao.maps.CustomOverlay({
      map,
      position,
      content,
      yAnchor: 1.5,
    });

    return customOverlay;
  } catch (err) {
    console.error('❌ Error rendering marker:', station, forecast, err);
    return null;
  }
}