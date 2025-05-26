import { useEffect, useRef } from 'react';
import { Box, Button, Container, Stack } from '@mui/material';
import AutocompleteInput from '../components/AutocompleteInput';
import { usePlaceStore } from '../stores/usePlaceStore';

const MapPage = () => {
  const mapRef = useRef(null);
  const mapObj = useRef(null);

  const {
    fromKeyword, toKeyword,
    fromSelected, toSelected,
    setFromKeyword, setToKeyword,
    setFromSelected, setToSelected,
  } = usePlaceStore();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        mapObj.current = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 3,
        });
      });
    };
    document.head.appendChild(script);
  }, []);

  const handleDrawRoute = () => {
    const map = mapObj.current;
    if (!map || !fromSelected || !toSelected) return;

    const fromLatLng = new window.kakao.maps.LatLng(fromSelected.y, fromSelected.x);
    const toLatLng = new window.kakao.maps.LatLng(toSelected.y, toSelected.x);

    new window.kakao.maps.Marker({ map, position: fromLatLng });
    new window.kakao.maps.Marker({ map, position: toLatLng });

    new window.kakao.maps.Polyline({
      map,
      path: [fromLatLng, toLatLng],
      strokeWeight: 5,
      strokeColor: '#007BFF',
      strokeOpacity: 0.7,
    });

    map.setCenter(fromLatLng);
  };

  return (
    <Container>
      <Stack spacing={2} direction="row" sx={{ mb: 2, width: '100%' }}>
        <AutocompleteInput
          label="출발지"
          keyword={fromKeyword}
          onKeywordChange={setFromKeyword}
          onPlaceSelect={setFromSelected}
        />
        <AutocompleteInput
          label="도착지"
          keyword={toKeyword}
          onKeywordChange={setToKeyword}
          onPlaceSelect={setToSelected}
        />
        <Button onClick={handleDrawRoute} variant="contained" sx={{ minWidth: '120px' }}>
          경로 생성
        </Button>
      </Stack>
      <Box
        ref={mapRef}
        sx={{
          border: '1px solid #ccc',
          width: '100vw',
          height: '80vh',
        }}
      />
    </Container>
  );
};

export default MapPage;