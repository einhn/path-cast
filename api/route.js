// api/route.js
export default async function handler(req, res) {
  const { origin, destination } = req.query;

  const response = await fetch(`https://apis-navi.kakaomobility.com/v1/directions?origin=${origin}&destination=${destination}&priority=BIKE`, {
    method: 'GET',
    headers: {
      Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
    },
  });

  if (!response.ok) {
    return res.status(500).json({ error: 'Kakao API 호출 실패' });
  }

  const data = await response.json();
  return res.status(200).json(data);
}