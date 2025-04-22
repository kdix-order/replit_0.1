/**
 * フィードバックダイアログコンポーネント
 * ユーザーから注文に関するフィードバックを収集するためのダイアログを提供します
 * 感情評価（ポジティブ/ネガティブ）、4段階評価、詳細コメントの入力ができます
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { useFeedback } from "@/hooks/use-feedback";

/**
 * フィードバックダイアログのProps
 * @property isOpen - ダイアログの表示状態
 * @property onClose - ダイアログを閉じる際のコールバック関数
 * @property orderId - フィードバックする注文ID（オプション）
 */
type FeedbackDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
};

/**
 * 感情評価の型定義
 * positive: 良い評価
 * negative: 悪い評価
 * null: 未選択
 */
type Sentiment = "positive" | "negative" | null;

/**
 * 数値評価の型定義
 * 4段階評価（1〜4）またはnull（未選択）
 */
type Rating = 1 | 2 | 3 | 4 | null;

/**
 * フィードバックダイアログコンポーネント
 * ユーザーから注文体験に関するフィードバックを収集する機能を提供します
 * 
 * @param isOpen - ダイアログの表示/非表示を制御
 * @param onClose - ダイアログを閉じる際のコールバック関数
 * @param orderId - フィードバック対象の注文ID（オプション）
 */
export function FeedbackDialog({
  isOpen,
  onClose,
  orderId
}: FeedbackDialogProps) {
  // 状態管理
  const [sentiment, setSentiment] = useState<Sentiment>(null); // 感情評価（良い/悪い）
  const [rating, setRating] = useState<Rating>(null);         // 数値評価（1-4）
  const [comment, setComment] = useState("");                 // 詳細コメント
  const { submitFeedback, isSubmitting } = useFeedback();     // フィードバック送信機能

  /**
   * フィードバックを送信する処理
   * 必須項目（感情評価）が選択されていることを確認し、APIに送信します
   */
  const handleSubmit = () => {
    if (!sentiment) return; // 感情評価は必須
    
    // フィードバックデータの構築
    const feedbackData: any = {
      orderId,
      sentiment
    };
    
    // 数値評価があれば追加
    if (rating !== null) {
      feedbackData.rating = rating;
    }
    
    // コメントがあれば追加（空白は除去）
    if (comment.trim()) {
      feedbackData.comment = comment.trim();
    }
    
    // フィードバック送信
    submitFeedback(feedbackData);
    
    // リセットして閉じる
    resetForm();
    onClose();
  };

  /**
   * フォームの状態をリセットする関数
   * すべての入力項目を初期状態に戻します
   */
  const resetForm = () => {
    setSentiment(null);  // 感情評価をリセット
    setRating(null);     // 数値評価をリセット
    setComment("");      // コメントをリセット
  };

  /**
   * ダイアログを閉じる処理
   * フォームをリセットしてから閉じるコールバックを実行します
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * フィードバックダイアログのレンダリング
   * ダイアログ内に感情評価（良い/悪い）、数値評価（1-4）、コメント欄を表示します
   */
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {/* ダイアログヘッダー - タイトルと説明 */}
        <DialogHeader>
          <DialogTitle>注文の評価</DialogTitle>
          <DialogDescription>
            味店焼マンの注文体験はいかがでしたか？ご意見をお聞かせください。
          </DialogDescription>
        </DialogHeader>

        {/* フィードバック入力フォーム */}
        <div className="space-y-6 py-4">
          {/* 感情評価セクション（良い/悪い） */}
          <div className="space-y-2">
            <p className="text-sm font-medium">注文は満足でしたか？</p>
            <div className="flex gap-4">
              {/* 「良かった」ボタン */}
              <AnimatedButton
                onClick={() => setSentiment("positive")}
                className={`flex-1 py-6 ${
                  sentiment === "positive"
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
                variant="outline"
                animationType="scale"
              >
                <div className="flex flex-col items-center">
                  <ThumbsUp className="h-8 w-8 mb-2" />
                  <span>良かった</span>
                </div>
              </AnimatedButton>

              {/* 「改善して欲しい」ボタン */}
              <AnimatedButton
                onClick={() => setSentiment("negative")}
                className={`flex-1 py-6 ${
                  sentiment === "negative"
                    ? "bg-red-100 border-red-500 text-red-700"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
                variant="outline"
                animationType="scale"
              >
                <div className="flex flex-col items-center">
                  <ThumbsDown className="h-8 w-8 mb-2" />
                  <span>改善して欲しい</span>
                </div>
              </AnimatedButton>
            </div>
          </div>

          {/* 数値評価セクション（1-4段階評価、感情評価が選択されている場合のみ表示） */}
          {sentiment && (
            <div className="space-y-2">
              <p className="text-sm font-medium">評価をつける</p>
              <div className="flex flex-col space-y-2">
                {/* 4段階評価ボタンを生成 */}
                {[
                  { value: 4, label: "とても良い", icon: "🎉" },
                  { value: 3, label: "良い", icon: "👍" },
                  { value: 2, label: "普通", icon: "😐" },
                  { value: 1, label: "改善が必要", icon: "🤔" }
                ].map((item) => (
                  <AnimatedButton
                    key={item.value}
                    onClick={() => setRating(item.value as Rating)}
                    className={`p-3 flex items-center ${
                      rating === item.value
                        ? "bg-[#e80113] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    variant="outline"
                    animationType="scale"
                  >
                    <div className="flex items-center w-full">
                      <span className="mr-2 text-xl">{item.icon}</span>
                      <span className="flex-grow text-left">{item.label}</span>
                      {/* 選択された評価に点数バッジを表示 */}
                      {rating === item.value && (
                        <span className="text-sm bg-white text-[#e80113] rounded-full px-2 py-1">
                          {item.value}点
                        </span>
                      )}
                    </div>
                  </AnimatedButton>
                ))}
              </div>
            </div>
          )}

          {/* コメント入力セクション（感情評価が選択されている場合のみ表示） */}
          {sentiment && (
            <div className="space-y-2">
              <p className="text-sm font-medium">ご意見を詳しくお聞かせください</p>
              {/* コメント例のガイド - 感情評価に応じて異なる例を表示 */}
              <div className="bg-yellow-50 p-3 rounded-md text-sm mb-2">
                <p className="text-yellow-800 mb-1 font-medium">💡 参考になるコメントの例：</p>
                <ul className="text-gray-700 list-disc pl-5 space-y-1">
                  {sentiment === "positive" ? (
                    <>
                      <li>「から丼の味付けが絶妙で美味しかった」</li>
                      <li>「注文から受け取りまでスムーズだった」</li>
                    </>
                  ) : (
                    <>
                      <li>「注文がなかなか呼ばれなかった」</li>
                      <li>「品数をもう少し増やしてほしい」</li>
                    </>
                  )}
                </ul>
              </div>
              {/* コメント入力エリア - 感情評価に応じてプレースホルダーが変化 */}
              <Textarea
                placeholder={sentiment === "positive" ? 
                  "特に良かった点や気に入ったメニューなどをお聞かせください..." : 
                  "改善してほしい点や不便だと感じた点などをお聞かせください..."}
                className="resize-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>

        {/* ダイアログフッター - キャンセル/送信ボタン */}
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!sentiment || isSubmitting}
            className="bg-[#e80113] hover:bg-red-700 text-white"
          >
            {isSubmitting ? "送信中..." : "送信する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}