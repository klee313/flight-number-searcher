# ✈️ Flight Number Searcher

항공편 번호를 검색하고 조회할 수 있는 웹 애플리케이션입니다. AirLabs를 통해 실시간 항공편 스케줄 정보를 제공합니다.

## 기능

- **항공편 검색**: 날짜, 항공사, 출발지, 도착지를 선택하여 항공편 번호를 검색할 수 있습니다.
- **실시간 데이터**: AirLabs API를 사용하여 최신 스케줄 정보를 가져옵니다.
- **다국어 지원**: 한국어, 영어, 터키어를 지원합니다.
- **반응형 디자인**: PC와 모바일 환경 모두에 최적화되어 있습니다.
- **설정 관리**: API 키와 언어 설정을 관리할 수 있습니다.

## 시작하기

### 필수 조건

- Node.js (v18 이상 권장)
- npm 또는 yarn

### 설치

1. 저장소를 클론합니다.

```bash
git clone https://github.com/your-username/flight-number-searcher.git
cd flight-number-searcher
```

2. 의존성을 설치합니다.

```bash
npm install
```

3. 개발 서버를 실행합니다.

```bash
npm run dev
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

1. [AirLabs](https://airlabs.co/)에서 무료 API 키 발급
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
