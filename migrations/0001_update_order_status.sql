-- Update existing order statuses to new status values
UPDATE orders 
SET status = CASE
  WHEN status = 'new' THEN 'pending'
  WHEN status = 'preparing' THEN 'paid'
  ELSE status
END
WHERE status IN ('new', 'preparing');

-- Add comment to document the new status values
COMMENT ON COLUMN orders.status IS 'Order status: pending (支払い待ち), paid (支払い済み), ready (受取可能), completed (受取完了), cancelled (キャンセル済み), refunded (返金済み)';