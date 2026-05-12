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

const IMAGES = [img00, img01, img02, img03, img04, img05, img06, img07, img08, img09, img10, img11, img12, img13, img14, img15, img16, img17, img18, img19, img20, img21];

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

export function drawCard(): TarotCard {
  const index = Math.floor(Math.random() * MAJOR_ARCANA.length);
  return MAJOR_ARCANA[index];
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
