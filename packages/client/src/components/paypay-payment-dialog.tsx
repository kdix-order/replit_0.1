/**
 * PayPay決済ダイアログコンポーネント
 * PayPay APIを使用したモバイル決済機能を提供します
 * QRコード表示や、決済状態の処理、成功/失敗の表示を含みます
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { FoodSpinner, BouncingFoodSpinner } from "@/components/ui/food-spinner";
import { usePayPay } from '@/hooks/use-paypay';

/**
 * PayPay決済ダイアログのProps型定義
 *
 * @property isOpen - ダイアログの表示状態
 * @property onClose - ダイアログを閉じる時のコールバック
 * @property amount - 支払い金額
 * @property callNumber - 呼出番号（注文成功時に表示、オプション）
 * @property orderId - 注文ID（PayPay API連携用、オプション）
 */
type PayPayPaymentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  callNumber?: number; // 呼出番号（注文成功時に表示）
  orderId?: string; // 注文ID（PayPay API連携用）
};

/**
 * PayPay決済ダイアログコンポーネント
 * PayPay APIを使用した決済処理とUI表示を担当します
 *
 * @param isOpen - ダイアログの表示/非表示状態
 * @param onClose - ダイアログを閉じる際のコールバック関数
 * @param amount - 決済金額
 * @param callNumber - 注文の呼出番号（注文完了時に表示）
 * @param orderId - PayPay APIに渡す注文ID
 */
export function PayPayPaymentDialog({
  isOpen,
  onClose,
  amount,
  callNumber,
  orderId
}: PayPayPaymentDialogProps) {
  /**
   * PayPayフック - 決済に関連する関数と状態を提供
   */
  const {
    createPayment,      // 決済作成API呼び出し関数
    isCreating,         // 決済作成中フラグ 
    paymentData,        // 作成された決済データ（QRコードURL含む）
    paymentError,       // 決済作成エラー
    paymentStatus,      // 決済状態（'COMPLETED', 'FAILED', 'CANCELED'など）
    isCheckingStatus,   // 決済状態確認中フラグ
    statusError,        // 決済状態確認エラー
    resetPaymentStatus  // 決済状態リセット関数
  } = usePayPay();

  /**
   * 決済処理開始ハンドラー
   * 「支払いを確定する」ボタンクリック時に実行されます
   */
  const handleSubmit = async () => {
    console.log("Starting PayPay payment processing");

    if (orderId) {
      createPayment({
        orderId
      });
    }
  };

  /**
   * PayPay決済ダイアログのレンダリング
   * 処理状態（initial, processing, success, error）に応じた画面を表示します
   */
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // 処理中の場合はダイアログを閉じさせない
        if (!open && !isCreating) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md border-2 border-[#fe0032] shadow-lg p-6">
        {/* ダイアログヘッダー */}
        <DialogHeader className="pb-3 mb-4 border-b border-gray-100">
          <DialogTitle className="text-center text-2xl font-bold text-[#fe0032]">
            {/* 状態に応じてタイトルを変更 */}
            {callNumber ? '注文完了' : 'PayPay決済'}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-1">
            {/* 状態に応じて説明文を変更 */}
            {callNumber ? 'お呼び出し番号をご確認ください' : '以下の金額を支払います'}
          </DialogDescription>
        </DialogHeader>

        {/* メインコンテンツエリア */}
        <div className="flex flex-col items-center justify-center py-6">
          {/* PayPayロゴ付き円形バッジ */}
          <div className="w-24 h-24 bg-gradient-to-br from-[#fe0032] to-red-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/PayPay_Logo.svg/512px-PayPay_Logo.svg.png"
              alt="PayPay"
              className="w-16 h-16 drop-shadow-md"
            />
          </div>

          {/* 金額表示 */}
          <div className="text-4xl font-bold mb-6 bg-gray-50 px-8 py-4 rounded-xl border border-gray-200 shadow-sm">
            ¥{amount.toLocaleString()}
          </div>

          {/* 初期状態: 支払い確定ボタン表示 */}
          {(!isCreating && !paymentError) && (
            <Button
              className="w-full bg-[#fe0032] hover:bg-[#cc0029] text-white py-6 text-lg font-bold rounded-xl shadow-md transform transition-transform duration-300 hover:scale-[1.02]"
              onClick={handleSubmit}
            >
              支払いを確定する
            </Button>
          )}

          {/* 処理中状態（ローディング中）: APIからQRコードデータ待ち */}
          {isCreating && !paymentData && (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-2 flex items-center justify-center rounded-full bg-[#fe0032] text-white">
                <p className="text-xl font-bold">処理中</p>
              </div>
              <p className="mt-2 font-medium">決済処理中...</p>
            </div>
          )}

          {/* エラー状態: エラーメッセージとリトライボタン表示 */}
          {paymentError && (
            <div className="flex flex-col items-center text-red-600">
              {/* エラーアイコン（✕マーク） */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p className="text-xl font-semibold mt-2">エラーが発生しました</p>
              {/* リトライボタン */}
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleSubmit}
              >
                やり直す
              </Button>
            </div>
          )}
        </div>

        {/* ダイアログフッター（キャンセルボタン - 初期状態のみ表示） */}
        <DialogFooter className="flex justify-between sm:justify-between">
          {!isCreating && (
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              キャンセル
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}