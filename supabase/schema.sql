-- ① usersテーブル：ユーザーの基本情報
CREATE TABLE users (
  line_user_id text PRIMARY KEY,      -- LINEのユーザーID
  created_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone DEFAULT now()
);

-- ② conversation_stateテーブル：会話の途中状態
CREATE TABLE conversation_state (
  line_user_id text PRIMARY KEY REFERENCES users(line_user_id), -- usersと1:1で紐付け
  step text DEFAULT 'time',           -- 現在の質問段階
  answers jsonb DEFAULT '{}'::jsonb,  -- ユーザーの選択内容をJSONで保持
  updated_at timestamp with time zone DEFAULT now()
);

-- ③ interaction_logsテーブル：過去の選択・提案ログ（RAG用）
CREATE TABLE interaction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), -- ログ一意のID
  line_user_id text REFERENCES users(line_user_id), -- どのユーザーか
  time text,                          -- 利用時間帯
  genre text,                         -- 選んだジャンル
  budget text,                         -- 価格帯
  shop_name text,                     -- 提案した店名
  created_at timestamp with time zone DEFAULT now()
);