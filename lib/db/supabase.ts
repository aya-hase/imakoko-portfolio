import { createClient } from "@supabase/supabase-js";

/**
 * Supabaseに接続するための「鍵（クライアント）」を作成してエクスポートする
 * これを export することで、他のファイルから読み込んでDB操作ができるようになります。
 */
export const supabase = createClient(
  // 💡 process.env は、.env.local ファイルに書いた「秘密のURLとキー」を読み込む魔法の言葉です
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  },
);
