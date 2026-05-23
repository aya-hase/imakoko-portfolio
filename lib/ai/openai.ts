import OpenAI from "openai";

// OpenAI接続用の設定（.env.localのキーを使用）
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AIに文章を作成させる共通関数
 */
export async function getAiCompletion(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: prompt }],
    temperature: 0.7,
  });
  return completion.choices[0].message.content;
}
