# 妙 묘 Myo

> 묘하게 잘 맞는 하루

사주명리학 + 서양 별자리 + 타로를 하루치로 풀어주는 macOS 데스크탑 운세 앱

![Tauri](https://img.shields.io/badge/Tauri_2-FFC131?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?logo=typescript&logoColor=white)
![Claude](https://img.shields.io/badge/Claude_API-CC785C?logo=anthropic&logoColor=white)

## Features

**오늘의 묘** — 데일리 운세
- 사주 운세 — 만세력 기반 4기둥 8자 분석, 신강/신약 판정, 용신 산출, 십신 관계 해석
- 별자리 운세 — 태양궁 트랜짓 기반 해석 + 별자리 SVG 콘스텔레이션
- 럭키 컬러 / 넘버 / 푸드 제공

**묘한 카드** — 타로
- 메이저 아르카나 22장 + 마이너 아르카나 56장 (총 78장 풀덱)
- 부채꼴 카드 선택 + 3D 뒤집기 애니메이션
- AI 기반 1일 1카드 해석, 결과 로컬 저장

**개인화**
- 직군별 비유 — 기본 / 개발자 / 디자이너 / 기획자(PM)
- 말투 선택 — 따뜻한 / 독설 / 하이텐션 / 차분한
- Deep Navy + Muted Gold 디자인 시스템

**UX**
- 메뉴바 트레이 앱 (macOS)
- 창 떼어내기/붙이기 모드 (Pin 버튼)
- 첫 실행 시 자동 온보딩
- 클립보드 복사

## Tech Stack

| Layer | Stack |
|-------|-------|
| Desktop | Tauri 2 (Rust) |
| Frontend | React 18 + TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand |
| AI | Claude API (Rust 백엔드에서 호출) |
| Saju Engine | lunar-typescript (만세력) |
| Storage | Tauri Plugin Store (JSON) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)
- [Rust](https://rustup.rs/)
- Claude API key (Anthropic) — Rust 백엔드에서 사용

### Installation

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm tauri dev
```

### Build

```bash
pnpm tauri build
```

빌드 결과물은 `src-tauri/target/release/bundle/` 에 생성됩니다.

## Project Structure

```
myo/
├── src/                    # Frontend (React)
│   ├── assets/tarot/       # 타로 카드 이미지 (78장)
│   ├── components/         # 공용 컴포넌트
│   │   ├── ui/             # shadcn 기반 (Button, Input, etc.)
│   │   ├── ZodiacConstellation.tsx  # 별자리 SVG
│   │   ├── OrnateButton.tsx         # 장식 버튼
│   │   └── MoonPhaseBar.tsx         # 달 위상 표시
│   ├── lib/                # 코어 로직
│   │   ├── saju.ts         # 만세력 엔진 (4기둥 8자, 십신, 오행)
│   │   ├── scoring.ts      # 신강/신약 판정 + 용신 산출
│   │   ├── fortune.ts      # 운세 생성 + Claude API 프롬프트
│   │   ├── tarot.ts        # 타로 78장 풀덱 + AI 해석
│   │   ├── zodiac.ts       # 별자리 판별
│   │   ├── calendar.ts     # 날짜 유틸
│   │   ├── store.ts        # Tauri 로컬 스토리지
│   │   └── utils.ts        # 공용 유틸
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── HomePage.tsx    # 메인 허브
│   │   ├── FortuneCard.tsx # 오늘의 묘 (사주/별자리 탭)
│   │   ├── TarotPage.tsx   # 묘한 카드
│   │   ├── OnboardingPage.tsx
│   │   └── SettingsPage.tsx
│   ├── stores/appStore.ts  # Zustand 글로벌 스토어
│   └── types/index.ts      # 타입 정의
├── src-tauri/              # Backend (Rust)
│   ├── src/lib.rs          # Claude API 호출, 트레이/윈도우 관리
│   └── tauri.conf.json     # Tauri 설정
└── package.json
```

## How It Works

1. **온보딩** — 생년월일시, 출생지역 입력 → 만세력으로 4기둥 8자 계산 + 별자리 자동 판별
2. **사주 분석** — 신강/신약 판정 → 용신/기신 산출 → 오늘 일진과 비교하여 묘점(luckScore) 결정
3. **오늘의 묘** — 사주 분석 결과를 Claude API로 전달 → 직군/말투에 맞춘 해석 생성 (사주 탭 + 별자리 탭)
4. **묘한 카드** — 78장 풀덱에서 카드 선택 → Claude API로 카드 해석
5. **캐싱** — 같은 날 재조회 시 로컬 캐시에서 즉시 로드. 날짜 변경 시 자동 감지

## Roadmap

- **묘연 (妙緣)** — 연인/친구/직장 궁합 기능
- **묘리 (妙理)** — 전체 사주 풀이 리포트
- **묘년 (妙年)** — 신년 운세

## License

MIT
