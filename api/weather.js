// 📁 위치: /api/weather.js
export default async function handler(req, res) {
  const { nx, ny, base_date, base_time } = req.query;

  const key = process.env.KMA_API_KEY;
  if (!key) {
    console.error('[❌] KMA_API_KEY is missing.');
    return res.status(500).json({ error: 'API key missing' });
  }

  // ✅ 기상청 단기예보 초단기실황 API
  const apiUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst` +
    `?serviceKey=${key}` +
    `&numOfRows=60&pageNo=1&dataType=JSON` +
    `&base_date=${base_date}&base_time=${base_time}` +
    `&nx=${nx}&ny=${ny}`;

  try {
    const response = await fetch(apiUrl);
    const text = await response.text();

    // 예상치 못한 응답 (XML 등)에 대한 처리
    if (!response.headers.get('content-type')?.includes('application/json')) {
      console.warn('[⚠️] 비정상 content-type:', response.headers.get('content-type'));
      return res.status(502).json({ error: 'Expected JSON response', raw: text });
    }

    // JSON 파싱
    const json = JSON.parse(text);
    return res.status(200).json(json);
  } catch (err) {
    console.error('[❌] API 요청 실패:', err);
    return res.status(500).json({ error: 'Weather fetch failed', details: err.message });
  }
}