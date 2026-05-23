import { NextResponse } from "next/server";
import {
  getConversationState,
  updateConversationState,
  resetConversationState,
} from "@/lib/db/conversationState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Steps
 */
type Step = "location" | "time" | "genre" | "budget" | "done";

const now = () => Date.now();

/**
 * state
 */
type State = {
  step: Step;
  answers: {
    location?: any;
    time?: string;
    genre?: string;
    budget?: string;
  };
  updatedAt: number;
};

function nextStep(step: Step): Step {
  if (step === "location") return "time";
  if (step === "time") return "genre";
  if (step === "genre") return "budget";
  if (step === "budget") return "done";
  return "done";
}

function isComplete(state: State) {
  return (
    !!state.answers.location &&
    !!state.answers.time &&
    !!state.answers.genre &&
    !!state.answers.budget
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = String(body.userId || "").trim();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "userId is required" },
        { status: 400 },
      );
    }

    const input = body.input;

    // 🔹 共通関数から state を取得
    let state = (await getConversationState(userId)) as State | null;

    // 🔹 初回ユーザーの場合は初期 state を作る
    if (!state) {
      state = {
        step: "location",
        answers: {},
        updatedAt: now(),
      };

      await updateConversationState(userId, state);
    }

    // ✅ postback JSON を value に変換
    let parsedInput = input;

    if (typeof input === "string") {
      try {
        const obj = JSON.parse(input);
        if (obj?.action === "set") {
          parsedInput = obj.value;
        }
      } catch {
        // JSONじゃなければ普通のテキストなのでそのまま
      }
    }

    // done ならリセット
    if (state.step === "done") {
      state = (await resetConversationState(userId)) as State;
    }

    // 👇 ここでは step を進めるかどうかをフラグで管理
    let shouldAdvance = false;

    if (state.step === "location") {
      if (typeof parsedInput === "object" && parsedInput?.type === "geo") {
        state.answers.location = parsedInput;
        shouldAdvance = true;
      }
    } else if (state.step === "time") {
      state.answers.time = parsedInput;
      shouldAdvance = true;
    } else if (state.step === "genre") {
      state.answers.genre = parsedInput;
      shouldAdvance = true;
    } else if (state.step === "budget") {
      state.answers.budget = parsedInput;
      shouldAdvance = true;
    }

    // ✅ 進めるときだけ進める
    if (shouldAdvance) {
      state.step = nextStep(state.step);
    }

    state.updatedAt = now();
    await updateConversationState(userId, state);

    // 完了
    if (state.step === "done" && isComplete(state)) {
      return NextResponse.json({
        ok: true,
        type: "final",
        step: state.step,
        answers: state.answers,
      });
    }

    // 次の質問
    return NextResponse.json({
      ok: true,
      type: "question",
      step: state.step,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "unknown" },
      { status: 500 },
    );
  }
}
