# 묘 (Myo) 사주 엔진 리팩토링 계획

## 배경 & 목표

현재 묘 앱은 일간(日干) 하나만 가지고 십신을 계산하고, 점수는 클로드가 즉흥적으로 매기는 구조. 이로 인해:

- 점수가 사주 로직과 무관하게 나옴 (같은 날 다시 뽑으면 점수 바뀜)
- "정관=80점" 같은 단순화는 사주 원리에 어긋남 (십신은 그 사람의 신강/신약·용신에 따라 길흉이 뒤집힘)
- "묘리"(전체 사주) 기능을 추가하려면 만세력 + 8자 + 신강/신약/용신 인프라가 필요

이 문서는 **오늘의 묘 강화 + 묘리 화면 신규 구현**을 위한 리팩토링 계획. 두 기능은 **동일한 만세력 엔진** 위에서 깊이만 다르게 돌아감.

---

## 현재 상태 진단

### 코드 구조
- `src/lib/saju.ts` — 일주(60갑자) 계산 + 십신 관계만 있음. 년/월/시 기둥 없음.
- `src/lib/fortune.ts` — 클로드한테 luckScore 0~100 즉흥 생성 요청. fallback 은 `50 + (seed % 40)` 의사 랜덤.
- `src/pages/OnboardingPage.tsx` — 생년월일/시간/도시/직군/톤/알림 다 받음. **출생시간 default "12:00"** (모르는 사람도 그대로 진행 → 거짓 데이터).
- `src/pages/SettingsPage.tsx` — Onboarding 과 거의 같은 필드를 다른 UI 로 또 그림. 코드 중복.
- `src/pages/HomePage.tsx` — fortune 로드 후 headline + body 2줄 + 묘점 점수 + 자세히보기. "묘리" 버튼은 `coming soon` placeholder.

### 문제 요약
1. 사주 8자 중 2글자만 다룸 (일간 + 오늘 일간)
2. 점수가 결정론적이지 않음
3. 출생 시간 default 12:00 → 시주가 거짓
4. Onboarding/Settings 폼 중복

---

## 정책 결정사항

토론 끝에 확정한 정책. 구현 시 일관 적용.

| 영역 | 결정 |
|---|---|
| **자시 처리** | `lunar-typescript` 라이브러리 기본값 따름 |
| **시간대 보정 (경도 30분)** | KST 그대로 사용. 진태양시 보정 안 함. v3 advanced 설정 옵션으로 추후 추가 가능 |
| **출생 시간 모르는 유저** | "모름" 옵션 제공. 시주 제외하고 6자만 계산. 묘리 화면에서 시주 섹션은 비활성화/안내 |
| **출생 도시 모르는 유저** | "모름" 옵션 제공. (현재 시간대 보정 안 하니까 큰 영향 없음. 미래 확장용) |
| **명리 학파 (v1)** | **억부용신 5단계 분기** (자세한 규칙은 #6-D 참조). 오늘의 묘와 묘리 모두 동일한 단일 시스템 사용. 향후 묘리만 정밀화 가능 (격국/조후/통근 추가) |
| **Onboarding ↔ Settings** | **동일한 ProfileForm 공유**. 두 화면이 같은 필드, 같은 UI. wrapper (헤더/버튼) 만 컨텍스트별로 다름 |
| **점수 산출** | 코드가 사주 로직으로 결정. 클로드는 점수 받아서 그 톤에 맞는 해석만 생성 |
| **점수 표시** | 메인에서는 **5단계 달 위상 (🌑신월~🌕보름달)** + 작은 한자/아라비아 숫자. moon-cat 컨셉과 일치 |

---

## 만세력 라이브러리 선택

**`lunar-typescript` 사용.** 직접 천문 계산 구현은 비추.

이유:
- 24절기 시각 천문 계산이 검증된 라이브러리
- 입춘/12절기 기준 년주·월주 경계 처리 자동
- 자평명리 기반 = 한국 사주와 동일 체계
- 한자(子/丑/寅…)는 그대로 나오므로 한글 매핑 wrapper 만 우리가 짬

설치:
```bash
pnpm add lunar-typescript
```

기본 사용:
```ts
import { Solar } from "lunar-typescript";

const solar = Solar.fromYmdHms(1990, 6, 15, 14, 30, 0);
const bazi = solar.getLunar().getEightChar();
bazi.getYear();   // "庚午"
bazi.getMonth();  // "壬午"  ← 절기 보정 자동
bazi.getDay();    // "戊戌"
bazi.getTime();   // "己未"
```

---

## 작업 항목 (9개)

의존 관계는 맨 아래 그래프 참조.

### #1 만세력 엔진 — lunar-typescript + saju.ts wrapper

`src/lib/saju.ts` 에 wrapper 추가. 기존 함수는 유지하되, 새 API 가 main API 가 되도록 설계.

**추가할 타입/함수:**

```ts
export type Pillar = {
  stem: string;          // "갑" (한글)
  stemHanja: string;     // "甲"
  branch: string;        // "자"
  branchHanja: string;   // "子"
  element: string;       // "목" (오행)
  yinYang: "양" | "음";
  hiddenStems: string[]; // 지장간 (한글)
};

export type FullChart = {
  year:  Pillar;
  month: Pillar;
  day:   Pillar;
  hour:  Pillar | null;  // 시간 모르면 null
  dayMasterElement: string; // 일간 오행
  dayMasterYinYang: "양" | "음";
};

export function getFullChart(
  birthDate: string,   // "YYYY-MM-DD"
  birthTime?: string,  // "HH:MM" | undefined
): FullChart;
```

**구현 핵심:**
- `Solar.fromYmdHms(year, month, day, hour, minute, 0)` 로 변환
- `getLunar().getEightChar()` 에서 4기둥 추출
- 한자→한글 매핑 테이블 적용 (子→자, 寅→인, 甲→갑, 등)
- `birthTime` 이 undefined 면 hour = null
- 지장간은 lunar-typescript 의 `getYearHideGan()` 등 사용 (있는지 확인 필요. 없으면 직접 매핑 테이블)

**한자→한글 매핑 테이블:**
```ts
const STEM_HANJA_TO_HAN: Record<string, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
  己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
};
const BRANCH_HANJA_TO_HAN: Record<string, string> = {
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};
```

---

### #2 UserProfile 타입/스토어 옵셔널 필드 정리

`src/types/index.ts` 의 `UserProfile`:

```ts
// Before
type UserProfile = {
  birthDate: string;
  birthTime: string;
  birthLocation: BirthLocation;
  // ...
};

// After
type UserProfile = {
  birthDate: string;       // required
  birthTime?: string;      // optional, undefined = 모름
  birthLocation?: BirthLocation; // optional
  // ...
};
```

**마이그레이션:**
- 기존 유저가 이미 birthTime = "12:00" 으로 저장돼 있을 수 있음. 이건 그대로 두되, Settings UI 에서 "모름" 토글 명시적으로 추가
- 기존 `getBirthDayMaster()` 가 birthDate 만 쓰니까 호환 OK

**스토어 (`src/stores/appStore.ts`):**
- `setProfile` 시 옵셔널 필드 그대로 받음
- `fetchFortune` 호출 전에 `getFullChart` 로 chart 계산 후 fortune 생성 로직에 전달

---

### #3 ProfileForm 공통 컴포넌트 추출

`src/components/ProfileForm.tsx` 신규 생성.

**Props:**
```ts
type ProfileFormProps = {
  defaultValues: ProfileFormData;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  submitLabel: string; // "시작하기" or "저장"
};
```

**필드 구성 (Onboarding/Settings 공유):**
- 생년월일 (필수)
- 출생 시간 + "모름" 토글 (옵셔널)
- 출생 도시 + "모름" 토글 (옵셔널)
- 직군 (필수)
- 톤 (필수)
- 알림 시간 (필수)
- 테마 (옵셔널 — Settings 에서만? 아니면 공통? — 일단 공통으로 둠)

**"모름" 토글 동작:**
- 체크 시 input 비활성화 + 값 무시
- 폼 제출 시 체크되면 birthTime / birthLocation = undefined 로 저장

**스타일 정책:**
- 입력 컴포넌트 자체는 공통 (Label + Input + Select 등)
- 카드/섹션 wrapper 는 props 로 받거나 상위에서 제어 (Onboarding 은 더 화려, Settings 는 미니멀)

---

### #4 Onboarding 페이지 ProfileForm 으로 리팩토링

`src/pages/OnboardingPage.tsx`:
- 환영 헤더 (Sparkles 아이콘, "묘에 오신 걸 환영해요") 유지
- 기존 form 코드 제거 → `<ProfileForm>` 호출
- "시작하기" 버튼 라벨 전달

---

### #5 Settings 페이지 ProfileForm 으로 리팩토링 + 모름 토글

`src/pages/SettingsPage.tsx`:
- 기존 form 코드 제거 → `<ProfileForm>` 호출
- 헤더 (ArrowLeft + "설정") 유지
- "저장" 버튼 라벨 전달
- "초기화" 버튼은 페이지가 ProfileForm 밖에서 따로 렌더

**Zod 스키마 옵셔널 변경:**
```ts
const settingsSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  birthLocationName: z.string().optional(),
  // ...
});
```

---

### #6 사주 기반 점수 로직 (간이 신강/신약 + 용신)

`src/lib/scoring.ts` 신규 파일. 사주 로직과 점수 산출을 한 곳에.

#### 6-A. 오행 상생/상극 관계

```ts
// 오행 인덱스: 木=0, 火=1, 土=2, 金=3, 水=4
const ELEMENTS = ["목", "화", "토", "금", "수"] as const;
type Element = typeof ELEMENTS[number];

// A 가 B 를 생함: (A+1) % 5 === B  (목생화, 화생토, 토생금, 금생수, 수생목)
function generates(a: Element, b: Element): boolean {
  return (ELEMENTS.indexOf(a) + 1) % 5 === ELEMENTS.indexOf(b);
}

// A 가 B 를 극함: (A+2) % 5 === B  (목극토, 화극금, 토극수, 금극목, 수극화)
function controls(a: Element, b: Element): boolean {
  return (ELEMENTS.indexOf(a) + 2) % 5 === ELEMENTS.indexOf(b);
}
```

#### 6-B. 십신(十神) 관계 (이미 saju.ts 에 있음)

기준: 일간 vs 다른 천간/지지 오행 + 음양 동일 여부.

| 관계 | 음양 동일 (편) | 음양 다름 (정) | 영역 |
|---|---|---|---|
| 같은 오행 (비화) | 비견 | 겁재 | 비겁 |
| 일간이 생하는 오행 (설) | 식신 | 상관 | 식상 |
| 일간이 극하는 오행 (정복) | 편재 | 정재 | 재성 |
| 일간을 극하는 오행 (피극) | 편관(七殺) | 정관 | 관성 |
| 일간을 생하는 오행 (인) | 편인 | 정인 | 인성 |

#### 6-C. 간이 신강/신약 판정

월지 가중치를 가장 크게, 나머지 기둥은 보정.

**점수 계산 (strengthScore):**

```ts
function calcStrengthScore(chart: FullChart): {
  score: number;  // -10 ~ +10
  level: "신강" | "중화" | "신약";
  dayMaster: Element;
} {
  const dayMaster = chart.dayMasterElement;
  let score = 0;
  
  // 1. 월지 (가장 중요, 가중치 ×3)
  const monthBranch = chart.month.branch;
  const monthElement = chart.month.element;
  const monthRelation = relationToDayMaster(dayMaster, monthElement);
  // monthRelation: "비화" | "인" | "식" | "재" | "관"
  score += MONTH_WEIGHT[monthRelation];  // 아래 표 참조
  
  // 2. 년주 / 일지 / 시주 (각각 가중치 ×1)
  for (const pillar of [chart.year, chart.day, chart.hour].filter(Boolean)) {
    // 천간
    score += STEM_WEIGHT[relationToDayMaster(dayMaster, pillar.element)];
    // 지지 (메인 오행)
    score += BRANCH_WEIGHT[relationToDayMaster(dayMaster, pillar.element)];
  }
  
  // 3. 판정
  const level = score >= 3 ? "신강" : score <= -3 ? "신약" : "중화";
  return { score, level, dayMaster };
}
```

**가중치 테이블:**

| 관계 | 월지 (×3) | 천간 (×1) | 지지 (×1) |
|---|---|---|---|
| 비화 (비겁) | +6 | +1 | +2 |
| 인 (인성) | +6 | +1 | +2 |
| 식 (식상) | -3 | -1 | -1 |
| 재 (재성) | -3 | -1 | -1 |
| 관 (관성) | -6 | -1 | -2 |

> 노트: 월지가 인성·비겁이면 "월령을 얻었다" 라 함. 신강의 핵심 조건. 월지가 관성이면 "월령에 극받음" → 신약 경향.

> 시주 없는 케이스 (출생시간 모름): 시주 보정 생략. 신강/신약 판정 정확도 약간 떨어지지만 일관성은 유지.

#### 6-D. 용신 결정 (억부 5단계 분기)

**확정 정책: 신강 정도(strengthScore)에 따라 5단계로 용신 결정.**

```
strengthScore 범위: -10 ~ +10

매우 신강 (+6 이상)   → 관성 용신    (강력하게 일간 누름)
적당 신강 (+3~+5)    → 식상 용신    (자연스럽게 설기)
중화      (-2~+2)    → 인성 용신    (가벼운 보강)
약간 신약 (-5~-3)    → 비겁 용신    (동류로 도움)
매우 신약 (-6 이하)   → 인성 용신    (강력하게 보강)

기신 = 용신을 극하는 오행 (오행 상극 관계 자동 계산)
한신 = 나머지 3개 오행
```

```ts
function determineYongsin(strength: {
  score: number;
  level: "신강" | "중화" | "신약";
  dayMaster: Element;
}): {
  yongsin: Element;
  gisin: Element;
  hansin: Element[];
} {
  const { score, dayMaster } = strength;
  
  // 일간 기준 오행 관계
  const insung = findGenerator(dayMaster);   // 인성: 일간을 생하는 오행 (목→수, 화→목, ...)
  const bigup  = dayMaster;                   // 비겁: 일간과 같은 오행
  const sik    = findGeneratee(dayMaster);    // 식상: 일간이 생하는 오행 (목→화, 화→토, ...)
  const jae    = findControllee(dayMaster);   // 재성: 일간이 극하는 오행 (목→토, 화→금, ...)
  const gwan   = findController(dayMaster);   // 관성: 일간을 극하는 오행 (목→금, 화→수, ...)
  
  // 5단계 분기
  let yongsin: Element;
  if (score >= 6)        yongsin = gwan;
  else if (score >= 3)   yongsin = sik;
  else if (score >= -2)  yongsin = insung;
  else if (score >= -5)  yongsin = bigup;
  else                   yongsin = insung;
  
  // 기신: 용신을 극하는 오행
  const gisin = findController(yongsin);
  const hansin = ELEMENTS.filter(e => e !== yongsin && e !== gisin);
  
  return { yongsin, gisin, hansin };
}
```

**오행 헬퍼 함수:**

```ts
// 목→화, 화→토, 토→금, 금→수, 수→목
function findGeneratee(e: Element): Element {
  return ELEMENTS[(ELEMENTS.indexOf(e) + 1) % 5];
}
// 수→목, 목→화, ... (위의 반대 = 나를 생하는 오행)
function findGenerator(e: Element): Element {
  return ELEMENTS[(ELEMENTS.indexOf(e) + 4) % 5];
}
// 목→토, 화→금, 토→수, 금→목, 수→화
function findControllee(e: Element): Element {
  return ELEMENTS[(ELEMENTS.indexOf(e) + 2) % 5];
}
// 금→목, 수→화, ... (위의 반대 = 나를 극하는 오행)
function findController(e: Element): Element {
  return ELEMENTS[(ELEMENTS.indexOf(e) + 3) % 5];
}
```

**왜 이 규칙으로 결정했나 (설계 노트):**

- **단일 룰 (A안: 신강=관성, 신약=인성)** 은 "적당 신강" 케이스에 관성을 처방하는 게 너무 무거움. 명리적으로 식상이 자연스러운 설기.
- **오행 카운트 (C안)** 는 v1 에 과한 복잡도. 묘리 v2 에서 업그레이드 가능 (B 와 호환됨).
- **하이브리드 (B+C)** 는 오늘의 묘 / 묘리가 같은 사주에 다른 용신을 뱉어서 UX 혼란. 단일 시스템 유지.
- 중화/매우 신약 둘 다 인성 용신인 건 의도된 거. 가벼운 보강 (중화) vs 강한 보강 (매우 신약) 인데 용신 오행은 같음. 구분은 점수 산출 단계에서 가중치로.

> 향후 묘리 정밀화 (v2 이후): 격국 판정 → 통근/투간 카운트 → 조후 보조 → 변용신 등 추가. 이건 별도 task 로.

#### 6-E. 오늘 일진과 용신 관계 → 점수

```ts
function evaluateTodayAgainstYongsin(
  todayPillar: Pillar,
  yongsin: Element,
  gisin: Element,
): {
  stemRelation: "용신" | "기신" | "한신";
  branchRelation: "용신" | "기신" | "한신";
} {
  const stemRel  = todayPillar.element === yongsin ? "용신"
                 : todayPillar.element === gisin   ? "기신"
                 : "한신";
  
  // 지지의 element 는 lunar-typescript 에서 받은 main element 사용
  const branchEl = elementOfBranch(todayPillar.branch);
  const branchRel = branchEl === yongsin ? "용신"
                  : branchEl === gisin   ? "기신"
                  : "한신";
  
  return { stemRelation: stemRel, branchRelation: branchRel };
}
```

**지지의 main element 매핑:**

| 지지 | 한자 | 오행 |
|---|---|---|
| 자 | 子 | 수 |
| 축 | 丑 | 토 |
| 인 | 寅 | 목 |
| 묘 | 卯 | 목 |
| 진 | 辰 | 토 |
| 사 | 巳 | 화 |
| 오 | 午 | 화 |
| 미 | 未 | 토 |
| 신 | 申 | 금 |
| 유 | 酉 | 금 |
| 술 | 戌 | 토 |
| 해 | 亥 | 수 |

#### 6-F. 최종 점수 산출

```ts
function calcDailyScore(
  chart: FullChart,
  todayPillar: Pillar,
): {
  score: number;       // 5~95
  tier: "大吉" | "吉" | "中" | "小凶" | "凶";
  level: "신강" | "중화" | "신약";
  yongsin: Element;
  gisin: Element;
  stemRelation: "용신" | "기신" | "한신";
  branchRelation: "용신" | "기신" | "한신";
} {
  const strength = calcStrengthScore(chart);
  const yongsin = determineYongsin(strength);
  const today = evaluateTodayAgainstYongsin(todayPillar, yongsin.yongsin, yongsin.gisin);
  
  // 기본 점수 50
  let score = 50;
  
  // 천간 영향 (가중치 큼)
  if (today.stemRelation === "용신") score += 25;
  else if (today.stemRelation === "기신") score -= 25;
  // 한신은 ±0
  
  // 지지 영향 (가중치 작음)
  if (today.branchRelation === "용신") score += 12;
  else if (today.branchRelation === "기신") score -= 12;
  
  // 시드 기반 미세 무작위 (±3) — 같은 날은 같은 결과지만 매일 살짝 다른 느낌
  const seed = hashDate(today.date) % 7 - 3;
  score += seed;
  
  // clamp
  score = Math.max(5, Math.min(95, score));
  
  const tier = score >= 81 ? "大吉"
             : score >= 61 ? "吉"
             : score >= 41 ? "中"
             : score >= 21 ? "小凶"
             : "凶";
  
  return {
    score,
    tier,
    level: strength.level,
    yongsin: yongsin.yongsin,
    gisin: yongsin.gisin,
    stemRelation: today.stemRelation,
    branchRelation: today.branchRelation,
  };
}
```

#### 6-G. 점수 분포 가이드

이 알고리즘으로 1년치 시뮬레이션 시:
- 천간: 10개 중 평균적으로 2개가 용신, 2개가 기신, 6개가 한신
- 지지: 12개 중 비슷한 분포
- 결과 분포 예상: **30~70 사이에 몰림, 극단값 (5~20, 80~95) 은 드물게 등장**

이게 의도된 분포. "가끔 진짜 좋거나 진짜 나쁜 날" 이 있어야 묘점이 의미 있음.

만약 분포 검증 후 너무 가운데로 몰리면:
- 가중치 (±25, ±12) 를 ±30, ±15 로 키움
- 또는 무작위 폭 (±3) 을 ±7 로 키움

#### 6-H. 클로드 프롬프트 수정

기존 `"luckScore": 0~100 사이 정수` 요청 **제거**.

새 프롬프트 구조:
```
당신은 "묘(Myo)" 운세 앱의 해석가입니다.

[사주 정보 — 코드가 이미 계산한 결과]
- 일간: 갑목(甲木) — 큰 나무 타입
- 신강/신약: 신강
- 용신: 화(火) — 필요한 오행
- 오늘 일진: 庚午 (경금/오화) — 천간 庚金 은 기신, 지지 午火 는 용신
- 십신 관계: 편관(七殺)
- 오늘 묘점: 58점 (中)

[해석 요청]
위 사주 정보를 바탕으로 오늘의 묘를 해석해주세요.
점수는 이미 정해졌으니 새로 매기지 마세요.
"58점 中" 의 톤에 맞게 (좋지도 나쁘지도 않은 균형) 해석해주세요.

[반환 JSON]
{
  "saju": { "headline", "body", "advice" },
  "astrology": { "headline", "body", "advice" },
  "combined": {
    "headline", "body", "caution", "warning",
    "luckyColor", "luckyColorHex", "luckyNumber", "luckyFood"
  }
}
```

클로드가 반환하는 데이터에서 `luckScore` 는 코드가 덮어씌움 (클로드가 매겨도 무시).

---

### #7 HomePage 디자인 — 달 위상 + 묘점 표시

`src/pages/HomePage.tsx` 의 fortune 로드 상태 UI 수정.

**5단계 달 위상 매핑:**

| 점수 | 달 모양 | tier | 묘사 |
|---|---|---|---|
| 81-100 | 🌕 보름달 | 大吉 | "묘하게 잘 풀리는 날" |
| 61-80  | 🌔 상현 | 吉 | "묘하게 흐름 좋은 날" |
| 41-60  | 🌓 반달 | 中 | "평범한 듯 묘한 하루" |
| 21-40  | 🌒 초승 | 小凶 | "조용히 흘러가는 하루" |
| 0-20   | 🌑 신월 | 凶 | "묘하게 조심해야 할 날" |

**UI 변경:**
- 기존 큰 점수 숫자 (28px) 제거
- moon-cat 옆이나 아래에 작은 달 위상 SVG (혹은 그라데이션 원)
- "묘점 八五" 같이 한자 숫자 + 작은 아라비아 숫자 (선택)
- "묘하게 잘 풀리는 날" tier 묘사 한 줄

**달 위상 SVG 예시:**
```tsx
function MoonPhase({ score }: { score: number }) {
  // score 0~100 → 0~1 비율로 변환
  // SVG 그라데이션 또는 마스크로 차오른 부분 표현
}
```

---

### #8 묘리 (전체 사주) 화면 신규 구현

`src/pages/MyoriPage.tsx` 신규 생성.

**페이지 구성:**

1. **헤더** — 뒤로가기 + "묘리 · 사주 풀이"
2. **8자 표** — 년주/월주/일주/시주 4기둥. 시주 없으면 비활성화 + "출생 시간 입력하면 시주도 풀어드려요"
3. **신강/신약 + 용신** — "당신은 신강한 갑목, 필요한 오행은 火"
4. **십성별 영역** — 재물(재성)/관운(관성)/연애(편재/정재)/건강(인성) 등 카드형
5. **대운 / 세운** — 10년 단위 + 올해 흐름 (lunar-typescript 의 운세 함수 확인 필요)
6. **클로드 해석** — 8자 정보 전부 프롬프트로 보내서 종합 해석 받음

**App.tsx 라우팅:**
```tsx
{currentView === "myori" && <MyoriPage />}
```

**HomePage 의 묘리 버튼:**
```tsx
<button onClick={() => setView("myori")} ...>  // showComingSoon 제거
```

---

### #9 만세력/사주 결과 검증

수동 검증 체크리스트:

1. **본인 생년월일/시간** 으로 `getFullChart` 결과 출력
2. **만세력.kr** 또는 **점신** 같은 외부 사이트 결과랑 4기둥 비교
3. **절기 경계일 케이스:**
   - 입춘 전후 (2/3, 2/4, 2/5 출생자) → 년주 바뀌는지
   - 경칩 전후 (3/5, 3/6 출생자) → 월주 바뀌는지
4. **자시 케이스:**
   - 23:00 출생 vs 00:30 출생 → 일주 어떻게 처리되는지 확인
5. **간이 신강/신약** 결과를 손계산이랑 비교 (몇 케이스)
6. **점수 분포** 시뮬레이션 — 1년치 점수 뽑아서 분포 확인. 5단계 달 위상이 골고루 나오는지

검증 후 발견된 이슈는 별도 task 로 추가.

---

## 의존 그래프

```
#1 만세력 (필수 베이스)
   │
   ├─→ #2 타입/스토어 (만세력 결과 담을 그릇)
   │      │
   │      ├─→ #3 ProfileForm
   │      │      │
   │      │      ├─→ #4 Onboarding 적용
   │      │      └─→ #5 Settings 적용 (병렬)
   │      │
   │      └─→ #6 점수 로직 (사주 데이터 + 옵셔널 필드)
   │             │
   │             ├─→ #7 HomePage 디자인 (점수 표시)
   │             └─→ #8 묘리 화면 (8자 표시) (병렬)
   │
   └─→ #9 검증 (#1 끝나면 바로 시작 가능, 다른 작업들과 병렬)
```

---

## 진행 가이드

- **#1 → #2 → #3 순서로** 한 단계씩 끝내고 다음 진행 (각 단계 끝나면 빌드 + 기본 동작 확인)
- **#4/#5** 는 ProfileForm 완성 후 병렬 가능 (서로 영향 안 줌)
- **#6** 은 점수 로직만이라 격리됨. 단위 테스트 작성 권장
- **#7/#8** 은 디자인+화면이라 병렬 가능
- **#9** 는 #1 끝나면 바로 시작 (별도 검증 스크립트 작성)

각 단계 끝나고 `pnpm tauri dev` 로 실제 동작 확인 후 다음 단계.

---

## 참고: 빠뜨리지 말 것

1. **기존 유저 마이그레이션** — birthTime = "12:00" 으로 저장된 유저 대응. Settings 첫 진입 시 "출생 시간 확인해주세요" 같은 안내 한 번 띄우거나, 그냥 두고 사용자가 알아서 수정하게 둘지 결정.
2. **lunar-typescript 사이즈 체크** — 번들 사이즈에 미치는 영향. Tauri 앱이라 큰 문제 없을 가능성 높지만 한 번 확인.
3. **타임존** — 라이브러리가 어떤 시간대 기준으로 동작하는지 확인. JS Date 가 로컬 타임존 기준이라 사용자 PC 시계에 의존. 필요시 명시적으로 KST 강제.
4. **테스트 케이스 작성** — `saju.ts` 의 신강/신약/용신/점수 함수는 단위 테스트 필수. 케이스 수가 적지 않음.
5. **fortune 캐싱** — 점수가 결정론적이 되니까 같은 날 다시 뽑아도 점수는 같아야 함. 캐시 키 = `${profileId}_${date}` 같은 구조 검토.

---

## 작성 시점: 2026-05-14

이 문서는 사용자 (숩인) 와의 토론을 통해 도출된 결정을 정리한 것. 구현 진행 중 추가 결정이 필요하면 이 문서 업데이트.
