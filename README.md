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

## 🛠️ 개발/배포 환경

- Vercel: [https://vercel-serverless-ebon.vercel.app](https://vercel-serverless-ebon.vercel.app)
- EC2 배포: [http://3.38.53.101](http://3.38.53.101)
- Serverless API: `/api/weather`

---

## ✨ 향후 개선 방향

- 자전거길 상세 경로 시각화 (Polyline + 스타일)
- 날짜/시간 기준 예보 선택 기능
- 날씨 기반 경고 알림 (예: 강풍, 호우 등)
- 지도 확대/축소 및 터치 최적화

---
