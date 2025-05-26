import { useEffect, useRef, useState } from 'react';
import { Autocomplete, TextField, Stack, Box, Button } from '@mui/material';

const MapPage = () => {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const polylineRef = useRef(null);

  const [originPlace, setOriginPlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [originKeyword, setOriginKeyword] = useState('');
  const [destinationKeyword, setDestinationKeyword] = useState([]);
  const [originOptions, setOriginOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);

  // ✅ Kakao SDK 삽입 및 지도 초기화
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

  // ✅ 출발지 검색
  useEffect(() => {
    if (!originKeyword || !window.kakao) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(originKeyword, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setOriginOptions(result);
      } else {
        setOriginOptions([]);
      }
    });
  }, [originKeyword]);

  // ✅ 도착지 검색
  useEffect(() => {
    if (!destinationKeyword || !window.kakao) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(destinationKeyword, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setDestinationOptions(result);
      } else {
        setDestinationOptions([]);
      }
    });
  }, [destinationKeyword]);

  // ✅ 경로 생성
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
        sx={{
          width: '100vw',
          height: '80vh',
          borderTop: '1px solid #ccc',
        }}
      />
    </>
  );
};

export default MapPage;