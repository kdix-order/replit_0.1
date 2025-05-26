/**
 * フィードバック機能カスタムフック
 * 
 * このフックは顧客フィードバックの送信と取得に関する機能を提供します。
 * 顧客はポジティブ/ネガティブな感情と1-4の数値評価、自由記述コメントを送信できます。
 * 管理者は全てのフィードバックを閲覧・分析することができます。
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

/**
 * フィードバック送信データの型定義
 * フィードバックダイアログから送信されるデータ形式
 * 
 * @property orderId - フィードバック対象の注文ID（オプショナル）
 * @property sentiment - 感情評価（"positive"または"negative"）
 * @property rating - 数値評価（1-4、オプショナル）
 * @property comment - テキストによる詳細コメント（オプショナル）
 */
type FeedbackData = {
  orderId?: string;
  sentiment: "positive" | "negative";
  rating?: number;
  comment?: string;
};

/**
 * フィードバック基本データの型定義
 * APIから返されるフィードバックデータの基本形式
 * 
 * @property id - フィードバックID
 * @property userId - フィードバックを送信したユーザーのID
 * @property orderId - 関連する注文ID（null可）
 * @property sentiment - 感情評価（"positive"または"negative"）
 * @property rating - 数値評価（1-4、またはnull）
 * @property comment - テキストによる詳細コメント（またはnull）
 * @property createdAt - フィードバック作成日時
 */
type Feedback = {
  id: string;
  userId: string;
  orderId: string | null;
  sentiment: "positive" | "negative";
  rating: number | null;
  comment: string | null;
  createdAt: string;
};

/**
 * 管理者向けフィードバックデータの型定義
 * 管理者画面表示用に拡張されたフィードバック情報
 * 
 * @extends Feedback - 基本フィードバック情報を拡張
 * @property userName - フィードバックを送信したユーザー名
 * @property orderDetails - 関連する注文の詳細情報（オプショナル）
 */
type AdminFeedback = Feedback & {
  userName: string;
  orderDetails?: {
    id: string;
    callNumber: number;
    status: "new" | "preparing" | "completed";
    total: number;
    createdAt: string;
  };
};

/**
 * フィードバック機能のカスタムフック
 * 
 * このフックは以下の機能を提供します：
 * - フィードバックの送信（顧客）
 * - ユーザー別フィードバック履歴の取得（顧客）
 * - 注文ごとのフィードバック取得（顧客）
 * - 全フィードバックの取得と分析（管理者）
 * 
 * @returns フィードバック関連の機能を含むオブジェクト
 */
export function useFeedback() {
  /**
   * フィードバック送信ミューテーション
   * 顧客からのフィードバックをAPIに送信します
   */
  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackData) => {
      const response = await apiRequest("POST", "/api/feedback", data);
      return response.json();
    },
    // 送信成功時の処理
    onSuccess: () => {
      // 成功メッセージをトーストで表示
      toast({
        title: "フィードバックを送信しました",
        description: "ご意見ありがとうございます！",
      });
      // フィードバックデータをリフレッシュ
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    },
    // 送信エラー時の処理
    onError: () => {
      // エラーメッセージをトーストで表示
      toast({
        title: "エラーが発生しました",
        description: "フィードバックの送信に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
  });

  /**
   * ユーザーのフィードバック一覧取得クエリ
   * 現在ログインしているユーザーが過去に送信したフィードバック履歴を取得します
   */
  const getUserFeedbackQuery = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    enabled: false, // 明示的に呼び出すまで実行しない（オンデマンド取得）
  });

  /**
   * 特定の注文に対するフィードバック取得クエリを生成する関数
   * @param orderId - フィードバックを取得したい注文ID
   * @returns 指定した注文IDに関連するフィードバックを取得するクエリ
   */
  const getOrderFeedbackQuery = (orderId: string) => {
    return useQuery<Feedback>({
      queryKey: ["/api/feedback/order", orderId],
      enabled: !!orderId, // 注文IDが存在する場合のみ有効化
    });
  };

  /**
   * 管理者向け - 全フィードバック取得クエリ
   * 全ユーザーから送信されたフィードバックを取得します（管理者のみアクセス可能）
   */
  const getAdminFeedbackQuery = useQuery<AdminFeedback[]>({
    queryKey: ['/api/admin/feedback'],
    enabled: false, // 明示的に呼び出すまで実行しない（管理者画面表示時に実行）
  });

  // フックから提供する機能をまとめて返却
  return {
    // 顧客向け機能
    submitFeedback: submitFeedbackMutation.mutate,   // フィードバック送信関数
    isSubmitting: submitFeedbackMutation.isPending,  // 送信中フラグ
    getUserFeedback: getUserFeedbackQuery.refetch,   // ユーザーフィードバック取得関数
    userFeedback: getUserFeedbackQuery.data || [],   // ユーザーフィードバックデータ
    isLoadingUserFeedback: getUserFeedbackQuery.isLoading, // ロード中フラグ
    getOrderFeedback: getOrderFeedbackQuery,         // 注文別フィードバック取得関数
    
    // 管理者向け機能
    getAdminFeedback: getAdminFeedbackQuery.refetch, // 全フィードバック取得関数
    adminFeedback: getAdminFeedbackQuery.data || [], // 全フィードバックデータ
    isLoadingAdminFeedback: getAdminFeedbackQuery.isLoading, // ロード中フラグ
  };
}