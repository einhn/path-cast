// api/weather.js
export default async function handler(req, res) {
  const { stationId, nx, ny, base_date, base_time } = req.query;
  const key = process.env.KMA_ENCODED_API_KEY;

  const targetNx = nx || '60'; // fallback 좌표
  const targetNy = ny || '127';

  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${key}&numOfRows=60&pageNo=1&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${targetNx}&ny=${targetNy}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text);
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: 'API 호출 실패', detail: err.message });
  }
}