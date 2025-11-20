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

## 📦 기술 스택 및 리팩토링 (Refactoring)

이번 리팩토링을 통해 최신 React 생태계의 표준 기술들을 도입하여 유지보수성과 사용자 경험을 대폭 개선했습니다.

### 1. Core Framework
- **React 19 + TypeScript**: 최신 React 기능과 타입 안정성을 통해 견고한 애플리케이션 구축.
- **Vite 7**: 빠른 빌드 속도와 HMR(Hot Module Replacement)을 통한 개발 생산성 향상.

### 2. Routing & State Management
- **React Router v7**: SPA(Single Page Application)의 라우팅을 선언적으로 관리하며, 페이지 간 전환을 매끄럽게 처리.
- **React Query (TanStack Query) v5**:
  - **도입 이유**: 기존의 `useEffect` 기반 데이터 페칭의 복잡성(로딩, 에러, 캐싱 처리)을 해결하기 위함.
  - **장점**: 서버 상태 관리 자동화, 강력한 캐싱, 자동 재시도(Retry) 기능 제공.
- **Zustand**: 전역 UI 상태(모달, 테마 등)를 관리하기 위한 가볍고 직관적인 상태 관리 라이브러리.

### 3. Form & Validation
- **React Hook Form**:
  - **도입 이유**: 제어 컴포넌트(Controlled Component)의 리렌더링 이슈를 최소화하고 퍼포먼스를 최적화.
  - **장점**: 간결한 API, 비제어 컴포넌트 기반의 고성능 폼 처리.
- **Zod**:
  - **도입 이유**: 런타임 타입 검증과 스키마 정의를 위해 도입.
  - **장점**: TypeScript와 완벽한 호환, 직관적인 스키마 정의로 폼 유효성 검사 로직을 분리.

### 4. UI & Styling
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크로, 빠르고 일관된 스타일링 적용.
- **shadcn/ui**:
  - **도입 이유**: 재사용 가능하고 접근성(Accessibility)이 보장된 고품질 컴포넌트 시스템 구축.
  - **장점**: Radix UI 기반의 Headless 컴포넌트에 Tailwind CSS 스타일을 입혀 커스터마이징이 용이함. (Calendar, Dialog, Popover, Form 등 적극 활용)
- **Lucide React**: 일관된 디자인 언어의 아이콘 세트.

### 5. Internationalization (i18n)
- **react-i18next**:
  - **도입 이유**: 체계적인 다국어 지원(한국어, 영어, 튀르키예어)을 위해 도입.
  - **장점**: JSON 기반의 리소스 관리, 브라우저 언어 감지 플러그인(`i18next-browser-languagedetector`) 연동.

### 6. Utilities
- **date-fns**: 날짜 포맷팅 및 연산 처리를 위한 경량 라이브러리.

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
