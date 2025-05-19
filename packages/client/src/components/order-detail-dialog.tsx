/**
 * 注文詳細ダイアログコンポーネント
 * ユーザーが注文の詳細、ステータス、受取情報を確認できるダイアログを提供します
 * 注文進捗のビジュアルトラッカーやアニメーションも表示します
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { OrderStatusTracker } from "./order-status-tracker";
import { Separator } from "@/components/ui/separator";
import { getCustomizationLabel } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, ChefHat, AlertCircle, Ticket } from "lucide-react";

/**
 * 注文アイテムの型定義
 * 注文内の各商品の情報を格納します
 * 
 * @property id - 注文アイテムのID
 * @property name - 商品名
 * @property price - 価格
 * @property quantity - 数量
 * @property size - サイズ（オプション）
 * @property customizations - カスタマイズオプションの配列（オプション）
 */
type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  customizations?: string[];
};

/**
 * 注文データの型定義
 * 注文の全情報を格納します
 * 
 * @property id - 注文ID
 * @property userId - ユーザーID
 * @property callNumber - 呼出番号（201-300の範囲）
 * @property status - 注文ステータス（new:新規, preparing:調理中, completed:完了）
 * @property total - 合計金額
 * @property timeSlot - 受取時間枠情報
 * @property createdAt - 注文作成日時
 * @property items - 注文アイテムの配列
 */
type Order = {
  id: string;
  userId: number;
  callNumber: number;
  status: "new" | "preparing" | "completed";
  total: number;
  timeSlot: {
    id: string;
    time: string;
  };
  createdAt: string;
  items: OrderItem[];
};

/**
 * 注文詳細ダイアログのProps
 * 
 * @property isOpen - ダイアログの表示状態
 * @property onClose - ダイアログを閉じる際のコールバック
 * @property order - 表示する注文データ（nullの場合は何も表示しない）
 */
type OrderDetailDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
};

/**
 * 注文詳細ダイアログコンポーネント
 * 注文の詳細情報、ステータス、進捗状況を表示するモーダルダイアログを提供します
 * 
 * @param isOpen - ダイアログの表示/非表示を制御
 * @param onClose - ダイアログを閉じる際のコールバック関数
 * @param order - 表示する注文データ
 */
export function OrderDetailDialog({ isOpen, onClose, order }: OrderDetailDialogProps) {
  // コンフェティアニメーション表示状態
  const [showConfetti, setShowConfetti] = useState(false);
  // 画面遷移用のフック
  const [, setLocation] = useLocation();

  /**
   * 注文ステータスが「完了」に変わった時にコンフェティアニメーションを表示する効果
   * 完了ステータスになると3秒間だけアニメーションを表示します
   */
  useEffect(() => {
    if (order?.status === "completed") {
      setShowConfetti(true);
      // 3秒後にアニメーションを終了
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      // コンポーネントのアンマウント時にタイマーをクリア
      return () => clearTimeout(timer);
    }
  }, [order?.status]);

  /**
   * 注文ステータスに対応するアイコン、メッセージ、背景色を返す関数
   * 各ステータスごとに適切な視覚的フィードバックを提供します
   * 
   * @param status - 注文ステータス（new, preparing, completed）
   * @returns アイコン、メッセージテキスト、CSS色クラスを含むオブジェクト
   */
  const getStatusIndicator = (status: "new" | "preparing" | "completed") => {
    switch(status) {
      case "new":
        return {
          icon: <AlertCircle className="w-6 h-6 text-[#fee10b]" />,
          message: "新規注文を受け付けました",
          color: "bg-[#fee10b]/10 text-[#e80113]"
        };
      case "preparing":
        return {
          icon: <ChefHat className="w-6 h-6 text-[#e80113]" />,
          message: "現在調理中です",
          color: "bg-[#e80113]/10 text-[#e80113]"
        };
      case "completed":
        return {
          icon: <ClipboardCheck className="w-6 h-6 text-green-600" />,
          message: "お料理が完成しました",
          color: "bg-green-100 text-green-800"
        };
      default:
        return {
          icon: <AlertCircle className="w-6 h-6 text-[#fee10b]" />,
          message: "処理中",
          color: "bg-gray-100 text-gray-800"
        };
    }
  };

  // 注文データがない場合は何も表示しない
  if (!order) return null;

  // 注文ステータスに応じた表示情報を取得
  const statusInfo = getStatusIndicator(order.status);
  // 注文日時のフォーマット用に日付オブジェクトに変換
  const orderDate = new Date(order.createdAt);

  /**
   * 注文詳細ダイアログの表示コンポーネント
   * ヘッダー、ステータスインジケーター、アイテムリスト、ボタンなどを含みます
   */
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md md:max-w-2xl p-0 overflow-hidden">
        {/* ダイアログヘッダー - 赤色のグラデーション背景 */}
        <DialogHeader className="bg-gradient-to-r from-[#e80113] to-[#d10010] text-white p-4">
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>注文詳細</span>
            {/* 呼出番号 - 強調表示（黄色） */}
            <span className="text-[#fee10b]">#{order.callNumber}</span>
          </DialogTitle>
          <DialogDescription className="text-white/80 mt-1">
            {/* 注文日時の表示 */}
            {format(orderDate, "yyyy年MM月dd日 HH:mm")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          {/* ステータスインジケーター - 注文状態に応じた色とアイコンを表示 */}
          <div className={`rounded-md p-3 flex items-center gap-2 mb-4 ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="font-medium">{statusInfo.message}</span>
          </div>

          {/* 注文進捗トラッカー - 視覚的な進捗状況表示 */}
          <div className="mb-6">
            <OrderStatusTracker status={order.status} />
          </div>

          <Separator className="my-4" />

          {/* 注文アイテム一覧 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">注文内容</h3>
            <ul className="space-y-2">
              {/* アニメーション付きアイテムリスト - 順番にフェードイン */}
              <AnimatePresence>
                {order.items.map((item, index) => (
                  <motion.li 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between p-2 rounded-md border border-gray-100 bg-gray-50"
                  >
                    {/* 商品情報（名前、サイズ、カスタマイズ） */}
                    <div>
                      <div className="font-medium">
                        {item.name} {item.size && `(${item.size})`}
                      </div>
                      {/* カスタマイズがある場合のみ表示 */}
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {item.customizations.map(getCustomizationLabel).join(", ")}
                        </div>
                      )}
                    </div>
                    {/* 数量と価格表示 */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">x{item.quantity}</span>
                      <span className="font-semibold">{item.price.toLocaleString()}円</span>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {/* 合計金額表示 */}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold">合計</span>
              <span className="font-bold text-lg">{order.total.toLocaleString()}円</span>
            </div>
          </div>

          {/* アクションボタンエリア */}
          <div className="mt-6 flex flex-col gap-3">
            {/* 呼出番号表示ページへのリンクボタン */}
            <Button 
              className="w-full bg-[#e80113] hover:bg-[#d10010] text-white"
              onClick={() => {
                onClose();
                setLocation(`/pickup/${order.id}`);
              }}
            >
              <Ticket className="h-4 w-4 mr-2" />
              呼出番号を表示
            </Button>
            
            {/* 受取時間表示と閉じるボタン */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">受取時間：{order.timeSlot.time}</p>
              <Button variant="outline" onClick={onClose}>閉じる</Button>
            </div>
          </div>
        </div>

        {/* 注文完了時のコンフェティアニメーション（お祝い効果） */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* 複数のコンフェティ粒子をランダムに生成 */}
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  top: "-5%",
                  left: `${Math.random() * 100}%`,
                  background: `hsl(${Math.random() * 360}, 100%, 50%)`,
                }}
                animate={{
                  y: ["0vh", "100vh"],
                  x: [`0%`, `${(Math.random() - 0.5) * 50}%`],
                  rotate: [0, Math.random() * 360],
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  ease: "easeOut",
                  delay: Math.random() * 0.5,
                }}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}