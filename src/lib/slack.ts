import type { DailyFortune } from "@/types";
import { fetch } from "@tauri-apps/plugin-http";

export async function sendToSlack(
  webhookUrl: string,
  fortune: DailyFortune,
): Promise<boolean> {
  if (!webhookUrl) return false;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `오늘의 Vibe ✦ ${fortune.date}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${fortune.combined.headline}*`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: fortune.combined.body,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `🎨 ${fortune.combined.luckyColor} | 🔢 ${fortune.combined.luckyNumber} | 🍴 ${fortune.combined.luckyFood}`,
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `⚠️ ${fortune.combined.warning}`,
              },
            ],
          },
        ],
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
