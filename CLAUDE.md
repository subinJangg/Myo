# 묘 (Myo) — Tauri App

> Claude Code 가 이 프로젝트에 들어오면 **가장 먼저 `../.claude/README.md` 부터** 읽으세요.
> 모든 브랜드/디자인/작업 컨텍스트는 거기에 정리되어 있습니다.

---

## 🚀 빠른 시작

```bash
pnpm install
pnpm dev          # Vite 개발 서버
pnpm tauri dev    # Tauri 데스크탑 실행
pnpm tauri build  # 프로덕션 빌드
```

---

## 📌 핵심 컨텍스트 위치

| 무엇 | 어디 |
| --- | --- |
| 시작점 (반드시 먼저) | `../.claude/README.md` |
| 현재 진행 중 작업 | `../.claude/tasks/01-design-v2-apply.md` |
| 디자인 시안 (정답) | `../.claude/references/myo_design_v2.png` |
| 브랜드 가이드 | `../.claude/brand.md` |
| 디자인 시스템 | `../.claude/design-language.md` |
| 컬러 토큰 | `../.claude/colors.md` |
| Production 일러스트 | `../assets/illustrations/` |
| HTML mockup | `../mockups/` |

---

## 📁 이 프로젝트 구조

```
myo/
├── src/
│   ├── pages/          # HomePage, FortuneCard, TarotPage, SettingsPage, OnboardingPage
│   ├── components/ui/  # shadcn 기반 공용 UI
│   ├── lib/            # zodiac.ts (Claude 프롬프트), slack.ts, utils.ts
│   ├── stores/         # Zustand state
│   └── types/
├── src-tauri/          # Rust 백엔드 (Tauri)
└── tailwind.config.js  # 컬러 토큰 + fontFamily
```

---

## ⚠️ 작업 전 확인

1. `../.claude/README.md` 읽었음
2. 현재 진행 TASK 파일 (`../.claude/tasks/01-*.md`) 읽었음
3. reference 이미지 (`../.claude/references/myo_design_v2.png`) 직접 봤음
4. acceptance criteria 확인했음

→ 그 다음에 작업 시작.

**의심스러우면 사용자에게 묻기. 조용히 추측하지 말 것.**
