import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import introMessage from "@/lib/line/messages/intro";
import askLocation from "@/lib/line/messages/askLocation";
import askTime from "@/lib/line/messages/askTime";
import askGenre from "@/lib/line/messages/askGenre";
import askPrice from "@/lib/line/messages/askPrice";
import errorFlex from "@/lib/line/messages/error";
import searchingFlex from "@/lib/line/messages/searching";
import noResultFlex from "@/lib/line/messages/noResult";
import {
  buildResultCarousel,
  fixedIntroText,
  aiSelectionPointText,
} from "@/lib/line/messages/result";

export const runtime = "nodejs"; // crypto/Buffer を安定させる
export const dynamic = "force-dynamic";

const LINE_REPLY_API = "https://api.line.me/v2/bot/message/reply";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

// X-Line-Signature の検証
function verifySignature(
  rawBody: string,
  signature: string,
  channelSecret: string,
) {
  const digest = createHmac("sha256", channelSecret)
    .update(rawBody, "utf8")
    .digest("base64");
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function replyToLine(replyToken: string, message: any | any[]) {
  const token = mustEnv("LINE_CHANNEL_ACCESS_TOKEN");
  const messages = Array.isArray(message) ? message : [message];

  const res = await fetch(LINE_REPLY_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ replyToken, messages }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LINE reply failed: ${res.status} ${t}`);
  }
}

function baseUrl() {
  // 末尾スラッシュがあっても壊れないように整形
  return (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

// conversation/next を呼ぶ
async function callConversationNext(userId: string, input: any) {
  const res = await fetch(`${baseUrl()}/api/conversation/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, input }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      `conversation/next failed: ${res.status} ${JSON.stringify(data)}`,
    );
  }
  return data as any;
}

// search/shops を呼ぶ（HotPepper検索）
async function callSearchShops(answers: {
  location?: any;
  genre?: string;
  budget?: string;
}) {
  const res = await fetch(`${baseUrl()}/api/search/shops`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: answers.location,
      genre: answers.genre,
      budget: answers.budget,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      `search/shops failed: ${res.status} ${JSON.stringify(data)}`,
    );
  }

  return data as {
    ok: boolean;
    count: number;
    shops: Array<{
      id: string;
      name: string;
      access: string;
      photo?: string;
      budget?: string;
      genre?: string;
      url?: string;
    }>;
  };
}

// ✅ AI提案APIを呼ぶ
async function callAiSuggest(userId: string, answers: any, shops: any[]) {
  const res = await fetch(`${baseUrl()}/api/ai/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      answers,
      shops: shops.slice(0, 3), // 上位3件だけAIに渡す
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`ai/suggest failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data as { suggestion?: string };
}

export async function POST(req: Request) {
  try {
    const channelSecret = mustEnv("LINE_CHANNEL_SECRET");

    // 署名検証に必要なので raw body を文字列で読む
    const rawBody = await req.text();
    const signature = req.headers.get("x-line-signature") ?? "";

    // ✅ 本番仕様：署名検証は必ず行う
    if (!signature || !verifySignature(rawBody, signature, channelSecret)) {
      return NextResponse.json(
        { ok: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    const body = JSON.parse(rawBody);
    const events = Array.isArray(body.events) ? body.events : [];

    for (const ev of events) {
      const replyToken = ev.replyToken as string | undefined;
      const userId = ev?.source?.userId as string | undefined;
      const message = ev?.message;

      if (!replyToken || !userId) continue;

      // 入力の正規化（text / location）
      let input: any = null;

      if (message?.type === "text") {
        input = String(message.text ?? "").trim();
      } else if (message?.type === "location") {
        input = {
          type: "geo",
          lat: Number(message.latitude),
          lng: Number(message.longitude),
        };
      } else if (ev?.postback?.data) {
        input = ev.postback.data;
      }

      if (!input) {
        await replyToLine(replyToken, errorFlex);
        continue;
      }

      const result = await callConversationNext(userId, input);

      if (result?.type === "question") {
        const replies: any[] = [];

        switch (result.step) {
          case "location":
            replies.push(introMessage);
            replies.push(askLocation);
            break;
          case "time":
            replies.push(askTime);
            break;
          case "genre":
            replies.push(askGenre);
            break;
          case "budget":
            replies.push(askPrice);
            break;
          default:
            replies.push(errorFlex);
        }

        await replyToLine(replyToken, replies);
        continue;
      }

      if (result?.type === "final") {
        const a = result.answers;

        // ✅ ここで店舗検索
        const shopsResult = await callSearchShops(a);
        const shops = shopsResult?.shops ?? [];

        if (shops.length === 0) {
          await replyToLine(replyToken, noResultFlex);
          continue;
        }

        // ✅ AI提案文を生成
        let suggestion = "条件に合いそうなお店をピックアップしました！";

        try {
          const ai = await callAiSuggest(userId, a, shops);
          if (ai?.suggestion && ai.suggestion.trim()) {
            suggestion = ai.suggestion;
          }
        } catch (e) {
          console.warn("ai/suggest error:", e);
        }

        // ✅ replyToken はここで1回だけ使う
        await replyToLine(replyToken, [
          searchingFlex, // ← 先頭に置けば表示される
          fixedIntroText,
          aiSelectionPointText(suggestion),
          buildResultCarousel(shops),
        ]);
        continue;
      }

      await replyToLine(replyToken, errorFlex);
    }

    return NextResponse.json({ ok: true, events: events.length });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "unknown" },
      { status: 500 },
    );
  }
}
