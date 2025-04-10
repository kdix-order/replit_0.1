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

type FeedbackDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId?: number;
};

type Sentiment = "positive" | "negative" | null;
type Rating = 1 | 2 | 3 | 4 | 5 | null;

export function FeedbackDialog({
  isOpen,
  onClose,
  orderId
}: FeedbackDialogProps) {
  const [sentiment, setSentiment] = useState<Sentiment>(null);
  const [rating, setRating] = useState<Rating>(null);
  const [comment, setComment] = useState("");
  const { submitFeedback, isSubmitting } = useFeedback();

  const handleSubmit = () => {
    if (!sentiment) return;
    
    const feedbackData: any = {
      orderId,
      sentiment
    };
    
    if (rating !== null) {
      feedbackData.rating = rating;
    }
    
    if (comment.trim()) {
      feedbackData.comment = comment.trim();
    }
    
    submitFeedback(feedbackData);
    
    // リセットして閉じる
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSentiment(null);
    setRating(null);
    setComment("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>注文の評価</DialogTitle>
          <DialogDescription>
            味店焼マンの注文体験はいかがでしたか？ご意見をお聞かせください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* センチメント選択 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">注文は満足でしたか？</p>
            <div className="flex gap-4">
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

          {/* 評価 */}
          {sentiment && (
            <div className="space-y-2">
              <p className="text-sm font-medium">評価をつける</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <AnimatedButton
                    key={value}
                    onClick={() => setRating(value as Rating)}
                    className={`p-2 ${
                      rating === value
                        ? "bg-[#e80113] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    variant="outline"
                    animationType="jelly"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating !== null && value <= rating
                          ? "fill-current text-[#e80113]"
                          : ""
                      }`}
                    />
                  </AnimatedButton>
                ))}
              </div>
            </div>
          )}

          {/* コメント */}
          {sentiment && (
            <div className="space-y-2">
              <p className="text-sm font-medium">コメント (任意)</p>
              <Textarea
                placeholder="詳細なご意見をお聞かせください..."
                className="resize-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          )}
        </div>

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