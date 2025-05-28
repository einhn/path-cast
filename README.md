# 🚲 Path-Cast

**Path-Cast**는 사용자가 선택한 출발지와 도착지 사이의 **자전거길 경로 상 날씨 정보**를 실시간으로 지도 위에 표시해주는 웹 애플리케이션입니다.  
카카오 지도 API, 기상청 초단기예보 API, IndexedDB 및 Serverless API를 결합하여 브라우저에서 빠르게 기상 데이터를 시각화할 수 있도록 설계되었습니다.

---

## 🔧 기술 스택

| 분야 | 기술 |
|------|------|
|  프론트엔드  | React + Vite |
|    지도    | Kakao Maps JavaScript SDK |
|  날씨 API  | 기상청 초단기예보 API (UltraSrtFcst) |
|   백엔드   | Vercel Serverless Function (`/api/weather`) |
|    배포    | Vercel + GitHub Actions (CI/CD), EC2 + Docker + NGINX |
|    저장소   | IndexedDB (idb 라이브러리 활용) |
|   DevOps   | Terraform + Docker + GitHub Actions Runner |
| 데이터 전처리 | Python (관측소 ↔ 자전거길 매핑, 자전거길 연결 정보 생성) |
---

## 📁 주요 디렉토리 구조

```
path-cast/
├── public/
│   └── data/
│       ├── bike_paths_utf8.csv            # 자전거길 위치 원본 데이터
│       ├── WeatherStations.xlsx           # 기상청 관측소 위치 원본
│       ├── bike_path_weather_map.json     # 전처리된 자전거길-관측소 매핑
│       ├── path_connection.json           # 자전거길 구간 간 연결 정보
│       └── stations.json                  # 기상청 격자 좌표 관측소 정보
│
├── src/
│   ├── pages/
│   │   └── MapPage.jsx                    # 전체 UI 및 지도 기능 진입점
│   ├── lib/
│   │   ├── geo/
│   │   │   ├── sampleRouteWithStations.js # 구간 샘플링 + 관측소 반환
│   │   │   └── getWeatherPointsBetween.js # 출발-도착 경로 위 지점 추출
│   │   └── weather/
│   │       ├── fetchForecastByStation.js  # 기상청 예보 Serverless 호출
│   │       └── renderWeatherMarkers.js    # 날씨 오버레이 표시
│   ├── utils/
│   │   ├── initBikePathDB.js              # IndexedDB 초기화 (자전거길)
│   │   ├── initStationDB.js               # IndexedDB 초기화 (관측소)
│   │   └── getBaseDateTime.js             # 예보 요청용 날짜/시간 유틸
│   └── main.jsx, App.jsx                  # React 진입점
│
├── docker/
│   ├── Dockerfile                         # 정적 리소스용 nginx 이미지
│   └── nginx.conf                         # CORS + 프록시 설정
│
├── scripts/
│   ├── preprocess.py                      # 자전거길 ↔ 관측소 매핑 생성
│   └── generate_path_connection.py        # 자전거길 연결관계 JSON 생성
│
└── vite.config.js                         # alias 및 proxy 설정
```

---

## 🌍 실행 흐름 요약

1. 사용자가 **출발지/도착지 장소명을 입력**합니다.
2. Kakao Maps SDK를 통해 해당 위치를 검색하고 지도에 마커로 표시합니다.
3. 내부적으로 **출발지/도착지 근처 자전거길 지점을 계산**하고,
4. **그 구간에 해당하는 자전거길 + 기상 관측소 정보**를 전처리 JSON에서 추출합니다. (IndexedDB에 저장된 데이터 기반)
5. Vercel Serverless API(`/api/weather`)를 통해 각 관측소의 기상 예보를 가져옵니다.
6. 기상 예보가 비동기 작동을 통해 **도착 즉시** 지도 위에 오버레이로 하나씩 표시됩니다.

---

## 🛠️ 개발/배포 환경

- 로컬: `localhost:5173` (`npm run dev`)
- Vercel: [https://vercel-serverless-ebon.vercel.app](https://vercel-serverless-ebon.vercel.app)
- EC2 배포: [http://3.38.53.101](http://3.38.53.101)
- Docker Hub: [`einhn/path-cast`](https://hub.docker.com/r/einhn/path-cast)
- Serverless API: `/api/weather`

---

## 📦 로컬 실행

```bash
# 로컬에서 빌드
npm install
npm run dev
```
- 주소: [http://localhost:5173](http://localhost:5173)

---

## 🔭 향후 확장 계획

- 미래 예보 선택 UI 추가
- 날씨 기반 경고 알림 (예: 강풍, 호우 등)

---