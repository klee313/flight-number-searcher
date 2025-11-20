# ✈️ Flight Number Searcher

항공편 번호를 검색하고 조회할 수 있는 웹 애플리케이션입니다. FlightAPI.io를 통해 실시간 항공편 스케줄 정보를 제공합니다.

## 🌟 주요 기능

- **항공편 검색**: 날짜, 항공사, 출발지, 목적지를 기준으로 항공편 검색
- **자동완성**: 공항 및 항공사 IATA 코드 입력 시 자동완성 지원
- **다국어 지원**: 한국어, 영어, 일본어 인터페이스 제공
- **캐싱**: localStorage를 활용한 API 응답 캐싱 (1시간 유효)
- **상세 정보**: 각 항공편의 상세 정보 모달 표시
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 환경 지원

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 20 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview

# 린트 검사
npm run lint
```

## 📦 기술 스택

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **State Management**: Zustand
- **Styling**: Vanilla CSS
- **Icons**: Lucide React
- **API**: FlightAPI.io Schedule API
- **Deployment**: GitHub Pages (GitHub Actions)

## 🔑 API 키 설정

1. [FlightAPI.io](https://flightapi.io/)에서 무료 API 키 발급
2. 애플리케이션 실행 후 우측 상단 설정(⚙️) 버튼 클릭
3. API 키 입력 및 저장 (localStorage에 저장됨)

## 📚 문서

자세한 프로젝트 구조 및 개발 가이드는 [프로젝트 문서](./docs/ARCHITECTURE.md)를 참고하세요.

## 🌐 배포

`main` 브랜치에 푸시하면 GitHub Actions를 통해 자동으로 GitHub Pages에 배포됩니다.

- **배포 URL**: `https://<username>.github.io/flight-number-searcher/`
- **워크플로우**: `.github/workflows/deploy.yml`

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 🤝 기여

이슈 및 풀 리퀘스트는 언제나 환영합니다!
