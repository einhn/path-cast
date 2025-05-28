// MapPage.jsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { initBikePathDB } from '../utils/initBikePathDB';
import { initStationDB } from '../utils/initStationDB';
import { getStationsFromDB } from '../utils/getStationsFromDB';
import { sampleRouteWithStations } from '@/lib/geo/sampleRouteWithStations';
import { fetchForecastByStation } from '@/lib/weather/fetchForecastByStation';
import { getBaseDateTime } from '@/utils/getBaseDateTime';
import {
  Autocomplete, TextField, Stack, Box, Button,
  IconButton, Tooltip, CssBaseline, ThemeProvider, createTheme,
} from '@mui/material';
import { WbSunny, DarkMode } from '@mui/icons-material';

const MapPage = () => {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const polylineRef = useRef(null);
  const markerRefs = useRef([]); // ✅ 출발지/도착지 마커 저장
  const weatherOverlaysRef = useRef([]); // ✅ 기상 오버레이 저장
  const forecastCache = useRef(new Map());

  const [originPlace, setOriginPlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [originKeyword, setOriginKeyword] = useState(localStorage.getItem('originKeyword') || '');
  const [destinationKeyword, setDestinationKeyword] = useState(localStorage.getItem('destinationKeyword') || '');
  const [originOptions, setOriginOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved ? saved === 'true' : prefersDark;
  });

  const theme = useMemo(() => createTheme({
    palette: { mode: isDark ? 'dark' : 'light' },
  }), [isDark]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', isDark.toString());
  }, [isDark]);

  useEffect(() => {
    initBikePathDB();
    initStationDB();
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=8419604bc286ea9fea55a35ef3f8fe53&autoload=false&libraries=services`;
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
    script.onerror = () => console.error('[Kakao SDK] Script failed to load');
    document.head.appendChild(script);
  }, []);

  const fetchPlaceOptions = (keyword, setOptions) => {
    if (!keyword || !window.kakao) return;
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (result, status) => {
      const seen = new Set();
      const unique = result?.filter(r => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });
      setOptions(status === window.kakao.maps.services.Status.OK ? unique : []);
    });
  };

  useEffect(() => {
    localStorage.setItem('originKeyword', originKeyword);
    fetchPlaceOptions(originKeyword, setOriginOptions);
  }, [originKeyword]);

  useEffect(() => {
    localStorage.setItem('destinationKeyword', destinationKeyword);
    fetchPlaceOptions(destinationKeyword, setDestinationOptions);
  }, [destinationKeyword]);

  const handleSearchRoute = async () => {
    const map = mapObj.current;
    if (!map || !originPlace || !destinationPlace) return;

    // ✅ 이전 마커, 오버레이, 경로 제거
    markerRefs.current.forEach(m => m.setMap(null));
    weatherOverlaysRef.current.forEach(o => o.setMap(null));
    if (polylineRef.current) polylineRef.current.setMap(null);

    markerRefs.current = [];
    weatherOverlaysRef.current = [];
    polylineRef.current = null;

    // ✅ 새 출발/도착 마커
    const from = new window.kakao.maps.LatLng(originPlace.y, originPlace.x);
    const to = new window.kakao.maps.LatLng(destinationPlace.y, destinationPlace.x);
    markerRefs.current.push(
      new window.kakao.maps.Marker({ map, position: from }),
      new window.kakao.maps.Marker({ map, position: to })
    );

    // ✅ 경로 폴리라인
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
    const sampled = await sampleRouteWithStations(route, stations, 500);
    const filtered = sampled.filter(p => p.id && p.gridX && p.gridY);

    const { renderWeatherMarkers } = await import('@/lib/weather/renderWeatherMarkers');
    const overlays = await renderWeatherMarkers(
      map, filtered, base_date, base_time,
      async (station, baseDate, baseTime) => {
        const cacheKey = `${station.id}_${baseDate}_${baseTime}`;
        if (forecastCache.current.has(cacheKey)) {
          return forecastCache.current.get(cacheKey);
        }
        const result = await fetchForecastByStation(station, baseDate, baseTime);
        if (result) forecastCache.current.set(cacheKey, result);
        return result;
      }
    );

    // ✅ 새 오버레이 저장 및 추후 제거를 위해 등록
    overlays?.forEach(o => o.setMap(map));
    weatherOverlaysRef.current = overlays || [];
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100vw', height: '100vh' }}>
        {/* 검색 UI */}
        <Stack direction="row" spacing={2} sx={{ p: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Autocomplete
            sx={{ width: '30%' }}
            freeSolo
            options={originOptions}
            getOptionLabel={(opt) => opt?.place_name || ''}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            onInputChange={(e, value) => setOriginKeyword(value)}
            onChange={(e, value) => value && setOriginPlace(value)}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>{option.place_name}</li>
            )}
            renderInput={(params) => <TextField {...params} label="출발지" size="small" variant="outlined" />}
          />

          <Autocomplete
            sx={{ width: '30%' }}
            freeSolo
            options={destinationOptions}
            getOptionLabel={(opt) => opt?.place_name || ''}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            onInputChange={(e, value) => setDestinationKeyword(value)}
            onChange={(e, value) => value && setDestinationPlace(value)}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>{option.place_name}</li>
            )}
            renderInput={(params) => <TextField {...params} label="도착지" size="small" variant="outlined" />}
          />

          <Button variant="contained" onClick={handleSearchRoute} sx={{ height: 40 }}>
            경로 생성
          </Button>

          {/* 테마 전환 버튼 */}
          <Tooltip title={isDark ? 'Use Light Mode' : 'Use Dark Mode'}>
            <IconButton onClick={() => setIsDark(!isDark)}>
              {isDark ? '🌞' : '🌛'}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* 지도 표시 영역 */}
        <Box ref={mapRef} sx={{ width: '100vw', height: 'calc(100vh - 64px)' }} />
      </Box>
    </ThemeProvider>
  );
};

export default MapPage;