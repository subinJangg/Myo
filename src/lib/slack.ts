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
              text: `✦ myo · ${fortune.date}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*"${fortune.combined.headline}"*\n묘 지수: ${fortune.combined.luckScore ?? "—"}/100`,
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
                text: `color: ${fortune.combined.luckyColor} · number: ${fortune.combined.luckyNumber} · food: ${fortune.combined.luckyFood}`,
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `⚠ ${fortune.combined.caution || fortune.combined.warning}`,
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
