/**
 * エラーハンドリングユーティリティ
 * 統一的なエラー処理とトースト表示を提供します
 */
import { toast } from "@/hooks/use-toast";
import { TIME_CONSTANTS } from "@/constants/admin";

interface ErrorHandlerOptions {
  defaultMessage?: string;
  duration?: number;
  showToast?: boolean;
}

/**
 * 統一的なエラーハンドリング関数
 * @param error エラーオブジェクト
 * @param options オプション設定
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const {
    defaultMessage = "エラーが発生しました",
    duration = TIME_CONSTANTS.TOAST_DURATION.ERROR,
    showToast = true
  } = options;

  // エラーメッセージの取得
  let errorMessage = defaultMessage;
  
  if (error instanceof Error) {
    errorMessage = error.message || defaultMessage;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }

  // コンソールにエラーを記録
  console.error('Error:', error);

  // トースト表示
  if (showToast) {
    toast({
      title: "エラーが発生しました",
      description: errorMessage,
      variant: "destructive",
      duration: duration,
    });
  }
}

/**
 * 成功時のトースト表示を統一化
 * @param title タイトル
 * @param description 説明文
 * @param duration 表示時間（デフォルト: 3000ms）
 */
export function showSuccessToast(
  title: string,
  description?: string,
  duration: number = TIME_CONSTANTS.TOAST_DURATION.SUCCESS
): void {
  toast({
    title,
    description,
    duration,
  });
}

/**
 * 警告トーストの表示
 * @param title タイトル
 * @param description 説明文
 * @param duration 表示時間（デフォルト: 4000ms）
 */
export function showWarningToast(
  title: string,
  description?: string,
  duration: number = TIME_CONSTANTS.TOAST_DURATION.ERROR
): void {
  toast({
    title,
    description,
    duration,
    // variant: "warning" がない場合は通常のトーストとして表示
    className: "border-yellow-500 bg-yellow-50",
  });
}