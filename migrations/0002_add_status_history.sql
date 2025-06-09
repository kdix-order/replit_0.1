-- ステータス変更履歴テーブルの作成
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  reason TEXT
);

-- インデックスの作成
CREATE INDEX idx_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_status_history_changed_at ON order_status_history(changed_at);

-- コメントの追加
COMMENT ON TABLE order_status_history IS '注文ステータス変更履歴';
COMMENT ON COLUMN order_status_history.from_status IS '変更前のステータス';
COMMENT ON COLUMN order_status_history.to_status IS '変更後のステータス';
COMMENT ON COLUMN order_status_history.changed_by IS '変更実施者のユーザーID';
COMMENT ON COLUMN order_status_history.reason IS '変更理由（返金理由など）';