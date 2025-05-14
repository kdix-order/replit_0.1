/**
 * PayPay返金ダイアログコンポーネント
 * PayPay APIを使用した返金機能を提供します
 */
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { usePayPay } from '@/hooks/use-paypay';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * PayPay返金ダイアログのProps型定義
 *
 * @property isOpen - ダイアログの表示状態
 * @property onClose - ダイアログを閉じる時のコールバック
 * @property orderId - 注文ID
 * @property amount - 返金金額（デフォルトは注文の合計金額）
 */
type PayPayRefundDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
};

/**
 * PayPay返金ダイアログコンポーネント
 */
export function PayPayRefundDialog({
  isOpen,
  onClose,
  orderId,
  amount
}: PayPayRefundDialogProps) {
  const [reason, setReason] = useState<string>('');
  const [status, setStatus] = useState<'initial' | 'success' | 'error'>('initial');

  /**
   * PayPayフック - 返金に関連する関数と状態を提供
   */
  const {
    refundPayment,
    isRefunding,
    refundError
  } = usePayPay();

  /**
   * 返金処理実行ハンドラー
   */
  const handleRefund = async () => {
    try {
      await refundPayment({
        orderId,
        amount: amount, // 注文の合計金額を固定で使用
        reason
      });
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  /**
   * ダイアログを閉じる
   */
  const handleClose = () => {
    setStatus('initial');
    setReason('');
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isRefunding) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {status === 'success' ? '返金処理完了' : '返金処理'}
          </DialogTitle>
          <DialogDescription>
            {status === 'success'
              ? '返金処理が正常に完了しました'
              : '注文の返金処理を行います'}
          </DialogDescription>
        </DialogHeader>

        {status === 'initial' && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                返金金額
              </Label>
              <div className="col-span-3 flex items-center">
                <span className="font-medium text-lg">¥{amount}</span>
                <span className="ml-2 text-xs text-gray-500">（注文の合計金額で固定）</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                返金理由
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="返金理由を入力してください（任意）"
                className="col-span-3"
              />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-center">返金処理が完了し、注文ステータスが「返金済み」に更新されました。</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-4">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-center text-red-500">返金処理中にエラーが発生しました</p>
            <p className="text-sm text-gray-500">{refundError}</p>
          </div>
        )}

        <DialogFooter className="flex justify-between sm:justify-between">
          {status === 'initial' ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                キャンセル
              </Button>
              <Button
                onClick={handleRefund}
                disabled={isRefunding}
                className="bg-red-600 hover:bg-red-700"
              >
                {isRefunding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  '返金処理を実行'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              閉じる
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
