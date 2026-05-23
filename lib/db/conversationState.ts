import { supabase } from "./supabase"; // 共通の「鍵（接続設定）」を読み込む

/**
 * --- 【今の会話状態を保存する】 ---
 * ユーザーが次にどの質問（ステップ）を受けるべきかを記録します。
 * @param userId LINEのユーザーID
 * @param state Bさんのコードから渡される、stepとanswersが入った塊
 */
export const updateConversationState = async (userId: string, state: any) => {
  // 1. Supabaseの「conversation_state」テーブルに対して操作を開始する
  const { data, error } = await supabase
    .from("conversation_state") // 操作する箱（テーブル）の名前を指定
    .upsert({
      // 2. データの詰め込み（upsertは「上書き更新」または「新規作成」）
      line_user_id: userId, // 誰の会話状態か
      step: state.step, // 次のステップ（'time', 'genre'など）
      answers: state.answers, // これまでの回答内容をJSON形式でまとめて保存
      updated_at: new Date(), // 更新日時を「今この瞬間」にセット
    });

  // 3. エラーが起きたらコンソールに表示して「だめだった」と報告する
  if (error) {
    console.error("状態更新エラー:", error.message);
    return null;
  }

  // 4. 成功したら保存されたデータを返す
  return data;
};

/**
 * --- 【今の会話状態を思い出す】 ---
 * Bさんのプログラムが「今どのステップだっけ？」と確認するために使います。
 */
export const getConversationState = async (userId: string) => {
  // 1. DBからデータを1行だけ「選ぶ（select）」
  const { data, error } = await supabase
    .from("conversation_state")
    .select("*") // 全ての列（stepやanswers）を持ってくる
    .eq("line_user_id", userId) // 今話しているこのユーザーのデータに絞り込む
    .maybeSingle(); // 1人分だけ取得する（データがなくてもエラーにしない）

  // 2. エラー（まだ一度も話してなくてデータがない等）ならnullを返す
  if (error) return null;

  // 3. 無事に見つかったら、今のステップや回答内容をBさん側に渡す
  return data;
};

/**
 * --- 【今の会話状態をリセットする】 ---
 * app/api/conversation/next/route.ts内のコード内容から追記
 * ユーザーが「リセット」と打った時や、提案が終わった時にDBを掃除。
 * 💡 これで水曜午後の「リセット処理の実装」タスクが完了。
 */
export const resetConversationState = async (userId: string) => {
  // 1. 初期状態のデータを作成
  const initialState = {
    step: "location",
    answers: {},
    updatedAt: Date.now(),
  };

  // 2. updateConversationStateを呼んでDBを初期状態で上書き（リセット）する
  await updateConversationState(userId, initialState);

  // 3. 初期状態を返す
  return initialState;
};

/**
 * --- 【物理削除が必要な場合のリセット】 ---
 */
export const deleteConversationState = async (userId: string) => {
  // 1. Supabaseのテーブルから、このユーザーの行を探して削除（delete）する
  const { error } = await supabase
    .from("conversation_state") // .from("テーブル名")： どのテーブルを操作するか指定
    .delete() // .delete()： 「この行を消して！」という命令
    .eq("line_user_id", userId); // .eq("列名", 値)： 「line_user_id が userId と一致する行だけ」に絞り込み

  if (error) {
    // 2. エラーが起きたらコンソールに表示して「だめだった」と報告する
    console.error("状態削除エラー:", error.message);
    throw error;
  }
};
