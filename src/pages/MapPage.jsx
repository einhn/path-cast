// src/pages/MapPage.jsx
import { useEffect, useRef, useState } from 'react';
import { initBikePathDB } from '../utils/initBikePathDB';
import { Autocomplete, TextField, Stack, Box, Button } from '@mui/material';

const getBaseDateTime = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const base_date = `${yyyy}${mm}${dd}`;
  const minutes = now.getMinutes();
  let hour = now.getHours();
  if (minutes < 30) hour -= 1;
  const base_time = `${String(hour).padStart(2, '0')}30`;
  return { base_date, base_time };
};

const MapPage = () => {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const polylineRef = useRef(null);

  const [originPlace, setOriginPlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [originKeyword, setOriginKeyword] = useState('');
  const [destinationKeyword, setDestinationKeyword] = useState('');
  const [originOptions, setOriginOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);

  // ✅ 0. 자전거길 데이터 IndexedDB에 저장 (한 번만 실행)
  useEffect(() => {
    initBikePathDB();
  }, []);

  // ✅ 1. Kakao SDK 삽입 및 지도 초기화
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 5,
        });
        mapObj.current = map;
      });
    };
    document.head.appendChild(script);
  }, []);

  // ✅ 2. 기상청 API 호출 (1번만!)
  useEffect(() => {
    const fetchWeather = async () => {
      const { base_date, base_time } = getBaseDateTime();
      const nx = 60, ny = 127;
      const key = import.meta.env.VITE_KMA_ENCODED_API_KEY;

      const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${key}&numOfRows=60&pageNo=1&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}`;

      try {
        const response = await fetch(url);
        const text = await response.text();
        console.log('📦 raw:', text);

        const json = JSON.parse(text);
        console.log('✅ JSON 파싱 성공:', json);

        if (json.response?.body?.items?.item) {
          console.log('🌤 날씨 항목:', json.response.body.items.item);
        }
      } catch (err) {
        console.error('❌ weather fetch 실패:', err);
      }
    };

    fetchWeather();
  }, []);

  // ✅ 3. 출발지 검색
  useEffect(() => {
    if (!originKeyword || !window.kakao) return;
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(originKeyword, (result, status) => {
      setOriginOptions(status === window.kakao.maps.services.Status.OK ? result : []);
    });
  }, [originKeyword]);

  // ✅ 4. 도착지 검색
  useEffect(() => {
    if (!destinationKeyword || !window.kakao) return;
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(destinationKeyword, (result, status) => {
      setDestinationOptions(status === window.kakao.maps.services.Status.OK ? result : []);
    });
  }, [destinationKeyword]);

  // ✅ 5. 경로 생성
  const handleSearchRoute = () => {
    const map = mapObj.current;
    if (!map || !originPlace || !destinationPlace) return;

    const from = new window.kakao.maps.LatLng(originPlace.y, originPlace.x);
    const to = new window.kakao.maps.LatLng(destinationPlace.y, destinationPlace.x);

    new window.kakao.maps.Marker({ map, position: from });
    new window.kakao.maps.Marker({ map, position: to });

    if (polylineRef.current) polylineRef.current.setMap(null);

    polylineRef.current = new window.kakao.maps.Polyline({
      path: [from, to],
      strokeWeight: 5,
      strokeColor: '#007BFF',
      strokeOpacity: 0.7,
    });

    polylineRef.current.setMap(map);
    map.setCenter(from);
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ p: 2 }}>
        <Autocomplete
          freeSolo
          options={originOptions}
          getOptionLabel={(opt) => opt?.place_name || ''}
          onInputChange={(e, value) => setOriginKeyword(value)}
          onChange={(e, value) => value && setOriginPlace(value)}
          renderInput={(params) => (
            <TextField {...params} label="출발지" fullWidth size="small" />
          )}
        />
        <Autocomplete
          freeSolo
          options={destinationOptions}
          getOptionLabel={(opt) => opt?.place_name || ''}
          onInputChange={(e, value) => setDestinationKeyword(value)}
          onChange={(e, value) => value && setDestinationPlace(value)}
          renderInput={(params) => (
            <TextField {...params} label="도착지" fullWidth size="small" />
          )}
        />
        <Button variant="contained" onClick={handleSearchRoute}>
          경로 생성
        </Button>
      </Stack>

      <Box
        ref={mapRef}
        sx={{ width: '100vw', height: '80vh', borderTop: '1px solid #ccc' }}
      />
    </>
  );
};

export default MapPage;