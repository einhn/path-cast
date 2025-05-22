import { useEffect } from 'react';

const MapPage = () => {
  useEffect(() => {
    const kakaoScript = document.createElement('script');
    kakaoScript.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false`;
    kakaoScript.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 3,
        };
        new window.kakao.maps.Map(container, options);
      });
    };
    document.head.appendChild(kakaoScript);
  }, []);

  return <div id="map" style={{ width: '100%', height: '500px' }} />;
};

export default MapPage;