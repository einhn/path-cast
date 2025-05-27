import { useEffect, useRef, useState } from 'react';
import { initBikePathDB } from '../utils/initBikePathDB';
import { initStationDB } from '../utils/initStationDB';
import { getStationsFromDB } from '../utils/getStationsFromDB';
import { sampleRouteWithStations } from '@/lib/geo/sampleRouteWithStations';
import { fetchForecastByStation } from '@/lib/weather/fetchForecastByStation';
import { getBaseDateTime } from '@/utils/getBaseDateTime';
import { Autocomplete, TextField, Stack, Box, Button } from '@mui/material';

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

  useEffect(() => {
    initBikePathDB();
    initStationDB();
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      console.log('[Kakao SDK] Script loaded');
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 5,
        });
        mapObj.current = map;
      });
    };
    script.onerror = () => {
    console.error('[Kakao SDK] Script failed to load');
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!originKeyword || !window.kakao) return;
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(originKeyword, (result, status) => {
      setOriginOptions(status === window.kakao.maps.services.Status.OK ? result : []);
    });
  }, [originKeyword]);

  useEffect(() => {
    if (!destinationKeyword || !window.kakao) return;
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(destinationKeyword, (result, status) => {
      setDestinationOptions(status === window.kakao.maps.services.Status.OK ? result : []);
    });
  }, [destinationKeyword]);

  const handleSearchRoute = async () => {
    const map = mapObj.current;
    if (!map || !originPlace || !destinationPlace) return;

    const from = new window.kakao.maps.LatLng(originPlace.y, originPlace.x);
    const to = new window.kakao.maps.LatLng(destinationPlace.y, destinationPlace.x);

    new window.kakao.maps.Marker({ map, position: from });
    new window.kakao.maps.Marker({ map, position: to });

    if (polylineRef.current) polylineRef.current.setMap(null);

    const polyline = new window.kakao.maps.Polyline({
      path: [from, to],
      strokeWeight: 5,
      strokeColor: '#007BFF',
      strokeOpacity: 0.7,
    });
    polyline.setMap(map);
    polylineRef.current = polyline;
    map.setCenter(from);

    const route = [
      { lat: originPlace.y, lng: originPlace.x },
      { lat: destinationPlace.y, lng: destinationPlace.x },
    ];

    const stations = await getStationsFromDB();
    const { base_date, base_time } = getBaseDateTime();

    const sampled = sampleRouteWithStations(route, stations, 500);
    const filtered = sampled.filter(p => p.id && p.gridX && p.gridY);

    const { renderWeatherMarkers } = await import('@/lib/weather/renderWeatherMarkers');
    await renderWeatherMarkers(map, filtered, base_date, base_time, fetchForecastByStation);
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