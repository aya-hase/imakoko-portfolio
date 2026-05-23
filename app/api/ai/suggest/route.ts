import { NextResponse } from "next/server";
import { getAiCompletion } from "@/lib/ai/openai";
import { createSuggestPrompt } from "@/lib/ai/prompt";
import { getConversationState } from "@/lib/db/conversationState";

export async function POST(req: Request) {
  try {
    const { userId, answers, shops } = await req.json();

    if (!shops || shops.length === 0) {
      return NextResponse.json({ suggestion: "お店が見つかりませんでした。" });
    }

    // 1. Cさんの担当：DBから前回の記憶を取得
    const prevState = await getConversationState(userId);
    const lastInteraction = prevState?.answers
      ? `前回は「${prevState.answers.genre}」を「${prevState.answers.location?.value || "現在の場所"}」付近で探していました。`
      : "履歴なし";

    // 2. Aさんの担当：プロンプトの組み立て
    const prompt = createSuggestPrompt(
      answers.location?.value || "現在の場所",
      answers.time || "不明",
      answers.genre || "不明",
      answers.budget || "不明",
      lastInteraction,
      shops,
    );

    // 3. AIに相談
    const aiText = await getAiCompletion(prompt);

    return NextResponse.json({ suggestion: aiText });
  } catch (error: any) {
    console.error("AI Suggest Error:", error);
    return NextResponse.json(
      { error: "AI生成に失敗しました" },
      { status: 500 },
    );
  }
}
