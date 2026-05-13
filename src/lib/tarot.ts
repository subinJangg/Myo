import type { TarotCard, JobRole, Tone } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { buildStyleGuide } from "./fortune";

import img00 from "@/assets/tarot/00.jpg";
import img01 from "@/assets/tarot/01.jpg";
import img02 from "@/assets/tarot/02.jpg";
import img03 from "@/assets/tarot/03.jpg";
import img04 from "@/assets/tarot/04.jpg";
import img05 from "@/assets/tarot/05.jpg";
import img06 from "@/assets/tarot/06.jpg";
import img07 from "@/assets/tarot/07.jpg";
import img08 from "@/assets/tarot/08.jpg";
import img09 from "@/assets/tarot/09.jpg";
import img10 from "@/assets/tarot/10.jpg";
import img11 from "@/assets/tarot/11.jpg";
import img12 from "@/assets/tarot/12.jpg";
import img13 from "@/assets/tarot/13.jpg";
import img14 from "@/assets/tarot/14.jpg";
import img15 from "@/assets/tarot/15.jpg";
import img16 from "@/assets/tarot/16.jpg";
import img17 from "@/assets/tarot/17.jpg";
import img18 from "@/assets/tarot/18.jpg";
import img19 from "@/assets/tarot/19.jpg";
import img20 from "@/assets/tarot/20.jpg";
import img21 from "@/assets/tarot/21.jpg";
import img22 from "@/assets/tarot/22.jpg";
import img23 from "@/assets/tarot/23.jpg";
import img24 from "@/assets/tarot/24.jpg";
import img25 from "@/assets/tarot/25.jpg";
import img26 from "@/assets/tarot/26.jpg";
import img27 from "@/assets/tarot/27.jpg";
import img28 from "@/assets/tarot/28.jpg";
import img29 from "@/assets/tarot/29.jpg";
import img30 from "@/assets/tarot/30.jpg";
import img31 from "@/assets/tarot/31.jpg";
import img32 from "@/assets/tarot/32.jpg";
import img33 from "@/assets/tarot/33.jpg";
import img34 from "@/assets/tarot/34.jpg";
import img35 from "@/assets/tarot/35.jpg";
import img36 from "@/assets/tarot/36.jpg";
import img37 from "@/assets/tarot/37.jpg";
import img38 from "@/assets/tarot/38.jpg";
import img39 from "@/assets/tarot/39.jpg";
import img40 from "@/assets/tarot/40.jpg";
import img41 from "@/assets/tarot/41.jpg";
import img42 from "@/assets/tarot/42.jpg";
import img43 from "@/assets/tarot/43.jpg";
import img44 from "@/assets/tarot/44.jpg";
import img45 from "@/assets/tarot/45.jpg";
import img46 from "@/assets/tarot/46.jpg";
import img47 from "@/assets/tarot/47.jpg";
import img48 from "@/assets/tarot/48.jpg";
import img49 from "@/assets/tarot/49.jpg";
import img50 from "@/assets/tarot/50.jpg";
import img51 from "@/assets/tarot/51.jpg";
import img52 from "@/assets/tarot/52.jpg";
import img53 from "@/assets/tarot/53.jpg";
import img54 from "@/assets/tarot/54.jpg";
import img55 from "@/assets/tarot/55.jpg";
import img56 from "@/assets/tarot/56.jpg";
import img57 from "@/assets/tarot/57.jpg";
import img58 from "@/assets/tarot/58.jpg";
import img59 from "@/assets/tarot/59.jpg";
import img60 from "@/assets/tarot/60.jpg";
import img61 from "@/assets/tarot/61.jpg";
import img62 from "@/assets/tarot/62.jpg";
import img63 from "@/assets/tarot/63.jpg";
import img64 from "@/assets/tarot/64.jpg";
import img65 from "@/assets/tarot/65.jpg";
import img66 from "@/assets/tarot/66.jpg";
import img67 from "@/assets/tarot/67.jpg";
import img68 from "@/assets/tarot/68.jpg";
import img69 from "@/assets/tarot/69.jpg";
import img70 from "@/assets/tarot/70.jpg";
import img71 from "@/assets/tarot/71.jpg";
import img72 from "@/assets/tarot/72.jpg";
import img73 from "@/assets/tarot/73.jpg";
import img74 from "@/assets/tarot/74.jpg";
import img75 from "@/assets/tarot/75.jpg";
import img76 from "@/assets/tarot/76.jpg";
import img77 from "@/assets/tarot/77.jpg";

const IMAGES = [
  img00, img01, img02, img03, img04, img05, img06, img07, img08, img09,
  img10, img11, img12, img13, img14, img15, img16, img17, img18, img19,
  img20, img21, img22, img23, img24, img25, img26, img27, img28, img29,
  img30, img31, img32, img33, img34, img35, img36, img37, img38, img39,
  img40, img41, img42, img43, img44, img45, img46, img47, img48, img49,
  img50, img51, img52, img53, img54, img55, img56, img57, img58, img59,
  img60, img61, img62, img63, img64, img65, img66, img67, img68, img69,
  img70, img71, img72, img73, img74, img75, img76, img77,
];

export const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, name: "The Fool", nameKo: "광대", symbol: "0", keywords: "새로운 시작, 모험, 자유", image: IMAGES[0] },
  { id: 1, name: "The Magician", nameKo: "마법사", symbol: "I", keywords: "창조, 의지, 능력", image: IMAGES[1] },
  { id: 2, name: "The High Priestess", nameKo: "여사제", symbol: "II", keywords: "직관, 지혜, 신비", image: IMAGES[2] },
  { id: 3, name: "The Empress", nameKo: "여황제", symbol: "III", keywords: "풍요, 모성, 자연", image: IMAGES[3] },
  { id: 4, name: "The Emperor", nameKo: "황제", symbol: "IV", keywords: "권위, 안정, 리더십", image: IMAGES[4] },
  { id: 5, name: "The Hierophant", nameKo: "교황", symbol: "V", keywords: "전통, 가르침, 신념", image: IMAGES[5] },
  { id: 6, name: "The Lovers", nameKo: "연인", symbol: "VI", keywords: "사랑, 선택, 조화", image: IMAGES[6] },
  { id: 7, name: "The Chariot", nameKo: "전차", symbol: "VII", keywords: "승리, 의지, 전진", image: IMAGES[7] },
  { id: 8, name: "Strength", nameKo: "힘", symbol: "VIII", keywords: "용기, 인내, 내면의 힘", image: IMAGES[8] },
  { id: 9, name: "The Hermit", nameKo: "은둔자", symbol: "IX", keywords: "성찰, 고독, 탐구", image: IMAGES[9] },
  { id: 10, name: "Wheel of Fortune", nameKo: "운명의 수레바퀴", symbol: "X", keywords: "변화, 운명, 전환점", image: IMAGES[10] },
  { id: 11, name: "Justice", nameKo: "정의", symbol: "XI", keywords: "공정, 균형, 진실", image: IMAGES[11] },
  { id: 12, name: "The Hanged Man", nameKo: "매달린 사람", symbol: "XII", keywords: "희생, 새 관점, 기다림", image: IMAGES[12] },
  { id: 13, name: "Death", nameKo: "죽음", symbol: "XIII", keywords: "변환, 끝과 시작, 재탄생", image: IMAGES[13] },
  { id: 14, name: "Temperance", nameKo: "절제", symbol: "XIV", keywords: "균형, 조화, 인내", image: IMAGES[14] },
  { id: 15, name: "The Devil", nameKo: "악마", symbol: "XV", keywords: "집착, 유혹, 속박", image: IMAGES[15] },
  { id: 16, name: "The Tower", nameKo: "탑", symbol: "XVI", keywords: "급변, 파괴, 깨달음", image: IMAGES[16] },
  { id: 17, name: "The Star", nameKo: "별", symbol: "XVII", keywords: "희망, 영감, 치유", image: IMAGES[17] },
  { id: 18, name: "The Moon", nameKo: "달", symbol: "XVIII", keywords: "불안, 환상, 잠재의식", image: IMAGES[18] },
  { id: 19, name: "The Sun", nameKo: "태양", symbol: "XIX", keywords: "기쁨, 성공, 활력", image: IMAGES[19] },
  { id: 20, name: "Judgement", nameKo: "심판", symbol: "XX", keywords: "부활, 각성, 결단", image: IMAGES[20] },
  { id: 21, name: "The World", nameKo: "세계", symbol: "XXI", keywords: "완성, 성취, 통합", image: IMAGES[21] },
];

const SUIT_SYMBOLS: Record<string, string> = { Wands: "🔥", Cups: "💧", Swords: "💨", Pentacles: "🌍" };
const SUIT_KO: Record<string, string> = { Wands: "완드", Cups: "컵", Swords: "소드", Pentacles: "펜타클" };
const RANK_NAMES = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
const RANK_KO = ["에이스", "2", "3", "4", "5", "6", "7", "8", "9", "10", "시종", "기사", "여왕", "왕"];
const RANK_SYMBOLS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Pg", "Kn", "Q", "K"];

const MINOR_KEYWORDS: Record<string, string[]> = {
  Wands: [
    "영감, 시작, 잠재력", "계획, 결정, 미래", "확장, 비전, 리더십", "축하, 안정, 가정", "갈등, 경쟁, 도전",
    "승리, 인정, 자신감", "방어, 끈기, 입장", "속도, 변화, 추진력", "경계, 회복, 인내", "부담, 책임, 한계",
    "모험심, 열정, 발견", "에너지, 행동, 대담함", "매력, 결단, 자신감", "비전, 통솔, 카리스마",
  ],
  Cups: [
    "새 감정, 사랑, 직관", "파트너십, 조화, 연결", "우정, 축하, 공동체", "무관심, 명상, 재평가", "상실, 슬픔, 후회",
    "향수, 추억, 순수", "환상, 선택, 상상", "전환, 떠남, 성장", "만족, 행복, 소원", "화합, 가족, 평화",
    "감수성, 창의력, 메시지", "로맨스, 이상, 매력", "공감, 직관, 헌신", "지혜, 균형, 관대함",
  ],
  Swords: [
    "진실, 명확함, 돌파", "균형, 선택, 교착", "이별, 슬픔, 해방", "휴식, 회복, 고요", "갈등, 패배, 자존심",
    "이동, 변화, 전환", "전략, 기지, 독립", "제한, 두려움, 속박", "걱정, 불안, 악몽", "끝, 마무리, 새벽",
    "호기심, 관찰, 정보", "결단, 직접성, 진전", "분석, 독립, 경험", "권위, 지성, 명확함",
  ],
  Pentacles: [
    "기회, 번영, 시작", "균형, 적응, 유연성", "장인정신, 팀워크, 숙련", "안정, 소유, 절약", "궁핍, 고립, 걱정",
    "관대, 나눔, 균형", "인내, 투자, 성장", "집중, 기술, 노력", "풍요, 자립, 정원", "유산, 가문, 영속",
    "학습, 시작, 기회", "꾸준함, 인내, 신뢰", "풍요, 안목, 편안함", "성공, 부, 안정",
  ],
};

function buildMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];
  const suits = ["Wands", "Cups", "Swords", "Pentacles"];
  let id = 22;

  for (const suit of suits) {
    for (let rank = 0; rank < 14; rank++) {
      cards.push({
        id,
        name: `${RANK_NAMES[rank]} of ${suit}`,
        nameKo: `${SUIT_KO[suit]}의 ${RANK_KO[rank]}`,
        symbol: `${RANK_SYMBOLS[rank]}${SUIT_SYMBOLS[suit]}`,
        keywords: MINOR_KEYWORDS[suit][rank],
        image: IMAGES[id],
      });
      id++;
    }
  }
  return cards;
}

export const MINOR_ARCANA: TarotCard[] = buildMinorArcana();
export const FULL_DECK: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export function drawCard(): TarotCard {
  const index = Math.floor(Math.random() * FULL_DECK.length);
  return FULL_DECK[index];
}

export async function interpretSingleCard(
  card: TarotCard,
  jobRole: JobRole,
  tone: Tone,
): Promise<string> {
  const prompt = `당신은 타로 카드 전문 해석가입니다.
오늘의 타로 카드 1장을 해석해주세요.

스타일 가이드: ${buildStyleGuide(jobRole, tone)}

오늘의 카드: ${card.nameKo} (${card.name}) - ${card.keywords}

이 카드가 오늘 하루에 대해 어떤 메시지를 전하는지 해석해주세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 순수 JSON만:
{
  "headline": "카드의 핵심 메시지 한 줄 (15자 이내)",
  "interpretation": "카드 해석 3-5줄",
  "advice": "오늘의 조언 한 줄"
}`;

  try {
    const result = await invoke<string>("call_claude", { prompt });
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    throw new Error("파싱 실패");
  } catch (e) {
    console.error("타로 해석 실패:", e);
    return JSON.stringify({
      headline: `${card.nameKo}의 메시지`,
      interpretation: `오늘 당신에게 ${card.nameKo} 카드가 나왔습니다. 이 카드는 ${card.keywords}의 의미를 담고 있어요. 오늘 하루 이 카드의 에너지가 당신과 함께할 거예요.`,
      advice: "카드의 메시지에 마음을 열어보세요.",
    });
  }
}
