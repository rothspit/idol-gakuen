-- =============================================
-- messages テーブル: 匿名キーからの直接アクセスを遮断
-- （チャットは Next.js API + service role のみ）
-- =============================================
-- Supabase SQL Editor で実行してください。
-- 既存の "Allow all" ポリシーがある場合は削除されます。

ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to messages" ON messages;
DROP POLICY IF EXISTS "allow_all_messages" ON messages;

-- anon / authenticated 向けのポリシーを意図的に作らない = SELECT/INSERT 不可
-- service_role は RLS をバイパスするため API からのみ操作可能

COMMENT ON TABLE messages IS '匿名チャット（クライアント直アクセス禁止・API経由のみ）';
