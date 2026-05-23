//「ユーザーとAIが過去にどんなやり取りをしたか」という「思い出」を記録・管理

import { supabase } from "./supabase";
//昨日あなたが作成した「Supabase接続用の設定」を読み込む

/**
 * AIの提案内容をDBに保存する関数
 * @param userId LINEのユーザーID
 */

// export: 他のファイル（Bさんのコードなど）からこの関数を呼べるようにする
// async: 「時間がかかる処理（通信）」を裏側で実行するための宣言
export const saveAiResponse = async (
  userId: string,
  time: string, // 【追記】何時ごろの希望か（ER図のtime列用）
  genre: string, // 【追記】何のジャンルか（ER図のgenre列用）
  budget: string, // 【追記】予算はいくらか（ER図のbudget列用）
  shopName: string, // 【追記】AIが見つけた店名（ER図のshop_name列用）
) => {
  // 1. Supabaseの特定のテーブル（箱）に対して「挿入（insert）」を開始する
  const { data, error } = await supabase
    .from("interaction_logs") // SQLで作成した「interaction_logs」テーブルを指定
    .insert([
      {
        // 左側がDBの列名、右側がこの関数に渡されたデータ
        line_user_id: userId, //「どのユーザーに」
        time: time, // 希望時間を保存
        genre: genre, // 料理ジャンルを保存
        budget: budget, // 予算を保存（priceから変更）
        shop_name: shopName, // お店の名前を保存
      },
    ]);
  // 2. もし保存中にエラー（DBが落ちてる、名前が違う等）が起きた場合の処理
  if (error) {
    console.error("保存エラー:", error.message); // 黒い画面（コンソール）にエラー内容を出す
    return null; // 失敗したので「空っぽ」を返す
  }
  return data; // 3. 無事に保存できたら、保存したデータそのものを返す
};

/**
 * 特定のユーザーの最新の履歴を1件だけ取得する
 */

export const getLastInteraction = async (userId: string) => {
  // 1. Supabaseのテーブルからデータを「選ぶ（select）」を開始する
  const { data, error } = await supabase
    .from("interaction_logs") // 「interaction_logs」という名前の箱（テーブル）を見る
    .select("shop_name") // 箱の中から「店名」の列だけを取り出す
    .eq("line_user_id", userId) // ただし、いま話している「このユーザーID」のデータだけに絞り込む
    .order("created_at", { ascending: false }) // 日付が「新しい順（降順）」に並び替える
    .limit(1) // 一番新しい「1件だけ」に限定する
    .single(); // 1つの塊としてデータを受け取る

  // 2. もしデータが1件もなかったり、エラーが起きたりした場合の処理
  if (error) {
    return null; // 初めて使うユーザーの場合は履歴がないので、ここを通って null（空）が返る
  }
  // 3. 無事に見つかったら、その「店名」だけをBさんやプロンプト側に返す
  return data.shop_name;
};

/**
 * 【AさんのUI用】特定のユーザーの「前回選んだジャンル」を1件だけ取得する
 * 💡 SQLのgenre列から直接データを取るので、正確に「和食」などが取得できます
 */
export const getLastGenre = async (userId: string) => {
  // 1. Supabaseからデータを「選ぶ」
  const { data, error } = await supabase
    .from("interaction_logs") // 「interaction_logs」という名前の箱（テーブル）を見る
    .select("genre") // genre列を指定！
    .eq("line_user_id", userId) // ★列名もSQLに合わせて line_user_id に修正
    .order("created_at", { ascending: false }) // ★dありに修正
    .limit(1)
    .single();

  // 2. 履歴がない、またはエラーの場合は「未設定」と返す
  if (error || !data) {
    return "未設定";
  }

  // 3. 取得したジャンル名（例：「和食」）を返す
  return data.genre;
};

/**
 * 【AさんのUI用】特定のユーザーの「前回選んだ予算」を1件だけ取得する
 * 💡追記: Aさんの画面で「前回の予算を表示」できるように新しく作りました
 */
export const getLastBudget = async (userId: string) => {
  // 1. Supabaseの履歴テーブル（interaction_logs）からデータを探す
  const { data, error } = await supabase
    .from("interaction_logs") // 「interaction_logs」という名前の箱（テーブル）を見る
    .select("budget") // 「予算（budget）」の列だけを指定して取得
    .eq("line_user_id", userId) // 操作しているユーザー自身のデータに絞り込む
    .order("created_at", { ascending: false }) // 日時が新しい順に並べる（最新を知りたいので）
    .limit(1) // 一番上の1件だけを取り出す
    .single(); // データの塊として1つだけ受け取る

  // 2. まだ一度も使っていないユーザーなどで、履歴が見つからない場合の処理
  if (error || !data) {
    return "未設定";
    // 履歴がない時は「未設定」と返し、Aさんのボタンに反映させる
  }
  return data.budget; // 3. 無事に見つかったら、保存されていた予算の値（例: 「1,000〜3,000円」）を返す
};
