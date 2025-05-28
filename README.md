# 🚲 Path-Cast

기상청 초단기 예보 데이터를 기반으로 **자전거 경로 상의 날씨 정보**를 시각화하는 웹 애플리케이션입니다.  
카카오 지도 API와 Vercel Serverless Function, IndexedDB를 활용하여 클라이언트 중심의 빠른 날씨 정보 표시가 가능합니다.

---

## 🧱 시스템 아키텍처

```
사용자 브라우저
   │
   │ 1. 출발/도착지 입력 → 카카오 장소 검색 API
   │ 2. 샘플링된 경로를 기준으로 날씨 조회 요청
   ▼
React (Vite 기반 SPA)
   ├── Kakao Maps JavaScript SDK로 지도 렌더링
   ├── IndexedDB로 자전거길 + 관측소 데이터 캐시
   └── fetch("/api/weather?...") → 날씨 중계 API 호출
                                   │
                                   ▼
                         Vercel Serverless Function
                         └── 기상청 초단기예보 API 요청
                                   │
                                   ▼
                        기온/풍향/풍속/강수량 등 JSON 응답
                                   │
                                   ▼
         React 앱에서 지도 위 Custom Overlay로 날씨 시각화

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

배포 파이프라인 (CI/CD)
   ┌────────────────────────────┐
   │         GitHub Repo        │
   └────────────┬───────────────┘
                │ push/merge (main, develop 브랜치)
                ▼
     GitHub Actions (CI/CD workflow)
       ├── Docker build (프론트 + 정적 파일)
       ├── Docker Hub push (einhn/path-cast)
       └── EC2 SSH 접속 + Docker pull & restart
                ▼
         EC2 + Nginx Reverse Proxy
           ├── 정적 파일 제공 (프론트)
           └── /api/* → Vercel Serverless 프록시
```

---

## ⚙️ DevOps & 배포 스택

| 항목              | 기술 스택                                       | 설명 |
|-------------------|------------------------------------------------|------|
| **Frontend**      | React + Vite                                   | 자바스크립트 SPA, 카카오맵 기반 |
| **지도 API**      | Kakao Maps JavaScript SDK                      | 위치 검색, 지도 시각화 |
| **Weather API**   | 기상청 초단기예보 (UltraSrtFcst)               | JSON 응답, base_date/base_time 기준 |
| **API 중계**      | Vercel Serverless Function (`/api/weather`)    | 기상청 API → CORS 해결 및 캐싱 |
| **로컬 데이터 저장소** | IndexedDB (`idb` 라이브러리)             | 브라우저 내 자전거 경로, 관측소 저장 |
| **CI**            | GitHub Actions (`ci.yml`)                      | main/develop 브랜치에 push 시 Docker build |
| **CD**            | GitHub Actions (`cd.yml`) + EC2 + Docker       | EC2에서 Docker pull + 서비스 재시작 |
| **배포 서버**     | AWS EC2 + Nginx                                | 정적 호스팅 및 프록시 라우팅 |
| **컨테이너**      | Docker                                         | Vite 빌드 산출물 컨테이너화 |
| **인프라 관리**   | Terraform                                      | EC2, VPC, 보안 그룹 IaC 관리 |

---

## 📁 주요 디렉토리 구조

```
path-cast/
├── public/
│   └── data/
│       ├── bike_paths_utf8.csv               # 전체 자전거길 위치 데이터
│       ├── stations.json                     # 기상청 관측소 정보
│       └── bike_path_station_map.json        # 자전거길 ↔ 관측소 매핑
│
├── src/
│   ├── pages/
│   │   └── MapPage.jsx                       # 메인 지도 및 날씨 UI
│   ├── lib/
│   │   ├── db/
│   │   │   └── queryNearbyBikePath.js        # 특정 위치 주변 자전거길 쿼리
│   │   ├── geo/
│   │   │   └── sampleRouteWithStations.js    # 경로 샘플링 후 관측소 매핑
│   │   └── weather/
│   │       ├── fetchForecastByStation.js     # Serverless로 기상청 API 호출
│   │       └── renderWeatherMarkers.js       # 날씨 정보 오버레이 표시
│   ├── utils/
│   │   ├── initBikePathDB.js                 # 자전거길 DB 초기화
│   │   ├── initStationDB.js                  # 관측소 + 매핑 데이터 IndexedDB 저장
│   │   └── getBaseDateTime.js                # 기상청 API용 시각 계산 유틸
│   ├── App.jsx, main.jsx                     # React 진입점
│   └── assets/, components/                  # UI 자산 및 향후 확장용
│
├── docker/
│   ├── Dockerfile                            # nginx 정적 빌드용
│   └── nginx.conf                            # CORS 및 프록시 구성 포함
│
├── .github/workflows/
│   ├── ci.yml                                # Docker Hub 빌드 & 푸시
│   └── cd.yml                                # EC2에 도커 이미지 배포
│
├── .env                                      # VITE_KAKAO_JS_KEY 포함
├── vite.config.js                            # 프록시 및 alias 설정
└── README.md
```

---

## 🌍 실행 흐름 요약

1. **사용자 출발/도착지를 입력**
2. Kakao Maps에서 장소 검색 후 지도에 표시
3. 두 지점을 연결한 경로를 `sampleRouteWithStations()`로 500m 간격 샘플링
4. 각 지점과 가까운 기상청 관측소 매핑 (IndexedDB에 저장된 데이터 기반)
5. Vercel Serverless API(`/api/weather`)를 통해 각 관측소 날씨 예보 조회
6. 날씨 정보(기온, 풍향, 강수확률 등)를 지도 위에 커스텀 오버레이로 시각화

---

## 🛠️ 개발/배포 환경

- 로컬: `localhost:5173` (`npm run dev`)
- Vercel: [https://vercel-serverless-ebon.vercel.app](https://vercel-serverless-ebon.vercel.app)
- EC2 배포: [http://3.38.53.101](http://3.38.53.101)
- Docker Hub: [`einhn/path-cast`](https://hub.docker.com/r/einhn/path-cast)
- Serverless API: `/api/weather`

---

## ✅ 초기화 참고

```js
// 초기화 실행 (MapPage.jsx 내 useEffect)
initBikePathDB();   // 자전거길 csv → IndexedDB 저장
initStationDB();    // 관측소 및 매핑 정보 JSON → IndexedDB 저장
```

---

## 🔑 .env 예시

```env
VITE_KAKAO_JS_KEY=YOUR_KAKAO_JAVASCRIPT_KEY
```

---

## 📦 Docker 예시

```bash
# 로컬에서 빌드
npm run build
docker build -t einhn/path-cast -f docker/Dockerfile .

# 실행
docker run -d -p 80:80 --name path-cast einhn/path-cast
```

---

## 🔐 주의 사항

- `stations.json`, `bike_path_station_map.json`, `bike_paths_utf8.csv`는 초기화 시 IndexedDB에 저장되어 클라이언트에서 로드됩니다.
- Kakao Map API 키는 반드시 `.env`에 등록되어야 하며, Vercel 및 EC2 도메인을 카카오 API 콘솔에 허용 도메인으로 추가해야 합니다.

---

## ✨ 향후 개선 방향

- 자전거길 상세 경로 시각화 (Polyline + 스타일)
- 날짜/시간 기준 예보 선택 기능
- 날씨 기반 경고 알림 (예: 강풍, 호우 등)
- 지도 확대/축소 및 터치 최적화

---
