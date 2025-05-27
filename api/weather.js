// /api/weather.js (Vercel Serverless Function)

export default async function handler(req, res) {
  // ✅ CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ OPTIONS 프리플라이트 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { id, gridX, gridY, base_date, base_time } = req.query;

  if (!id || !gridX || !gridY || !base_date || !base_time) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const SERVICE_KEY = process.env.KMA_API_KEY;

  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst` +
              `?serviceKey=${SERVICE_KEY}` +
              `&numOfRows=60&pageNo=1&dataType=JSON` +
              `&base_date=${base_date}&base_time=${base_time}` +
              `&nx=${gridX}&ny=${gridY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'External API request failed',
        status: response.status,
      });
    }

    const text = await response.text();

    if (!text.trim().startsWith('{')) {
      return res.status(502).json({
        error: 'Unexpected response format from weather API',
        raw: text,
      });
    }

    const json = JSON.parse(text);

    if (json?.response?.body?.items?.item) {
      return res.status(200).json(json.response.body.items.item);
    }

    return res.status(502).json({
      error: 'Weather API returned unexpected structure',
      raw: json,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch weather data',
      details: err.message,
    });
  }
}