# ☯ Vibe

macOS 메뉴바에서 매일 아침 확인하는 나만의 운세 앱

사주명리학 + 서양 별자리 + 타로를 결합해 개인 맞춤 운세를 제공합니다.

![Tauri](https://img.shields.io/badge/Tauri_2-FFC131?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?logo=typescript&logoColor=white)
![Claude](https://img.shields.io/badge/Claude_CLI-CC785C?logo=anthropic&logoColor=white)

## Features

**운세**
- 사주 운세 — 일간(日干) 기반 십신 관계 해석
- 별자리 운세 — 태양궁 트랜짓 기반 해석
- 종합 운세 — 사주 + 별자리 통합, 럭키 컬러/넘버/푸드

**타로**
- 메이저 아르카나 22장 (Rider-Waite 1909 퍼블릭 도메인)
- 카드 뒤집기 3D 애니메이션
- AI 기반 1일 1카드 해석

**개인화**
- 직군별 비유 — 기본 / 개발자 / 디자이너 / 기획자(PM)
- 말투 선택 — 따뜻한 / 독설 / 하이텐션 / 차분한 / 기본
- 다크모드 자동 지원

**UX**
- 메뉴바 트레이 앱 (macOS)
- 창 고정/떼어내기 모드 (Pin 버튼)
- 크리스탈 볼 로딩 애니메이션 + 단계별 재미있는 메시지
- 클립보드 복사로 간편 공유

## Tech Stack

| Layer | Stack |
|-------|-------|
| Desktop | Tauri 2 (Rust) |
| Frontend | React 18 + TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand |
| AI | Claude CLI (Claude Max) |
| Storage | Tauri Plugin Store (JSON) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)
- [Rust](https://rustup.rs/)
- [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) — Claude Max 플랜 로그인 필요

```bash
# Claude CLI 설치 확인
claude --version
```

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
vibe/
├── src/                    # Frontend (React)
│   ├── assets/tarot/       # 타로 카드 이미지 (22장)
│   ├── components/ui/      # UI 컴포넌트 (Button, Input, etc.)
│   ├── lib/                # 코어 로직
│   │   ├── saju.ts         # 사주 계산 (일주, 십신, 오행)
│   │   ├── zodiac.ts       # 별자리 판별
│   │   ├── fortune.ts      # 운세 생성 + Claude CLI 연동
│   │   ├── tarot.ts        # 타로 카드 + AI 해석
│   │   └── store.ts        # Tauri 로컬 스토리지
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── HomePage.tsx    # 메인 허브
│   │   ├── FortuneCard.tsx # 운세 (사주/별자리/종합 탭)
│   │   ├── TarotPage.tsx   # 타로 카드 뽑기
│   │   ├── OnboardingPage.tsx
│   │   └── SettingsPage.tsx
│   ├── stores/appStore.ts  # Zustand 글로벌 스토어
│   └── types/index.ts      # 타입 정의
├── src-tauri/              # Backend (Rust)
│   ├── src/lib.rs          # Claude CLI 호출, 트레이 관리
│   └── tauri.conf.json     # Tauri 설정
└── package.json
```

## How It Works

1. **온보딩** — 생년월일시, 출생지역 입력 → 일간(日干)과 별자리 자동 계산
2. **운세 생성** — 오늘의 일진과 사용자 일간의 십신 관계 + 별자리 트랜짓을 Claude CLI로 해석
3. **타로** — 메이저 아르카나 22장 중 랜덤 1장 → Claude CLI로 카드 의미 해석
4. **캐싱** — 같은 날 재조회 시 로컬 캐시에서 즉시 로드

## License

MIT
