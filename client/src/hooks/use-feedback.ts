import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

type FeedbackData = {
  orderId?: number;
  sentiment: "positive" | "negative";
  rating?: number;
  comment?: string;
};

type Feedback = {
  id: number;
  userId: number;
  orderId: number | null;
  sentiment: "positive" | "negative";
  rating: number | null;
  comment: string | null;
  createdAt: string;
};

export function useFeedback() {
  // 送信ミューテーション
  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackData) => {
      const response = await apiRequest("POST", "/api/feedback", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "フィードバックを送信しました",
        description: "ご意見ありがとうございます！",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    },
    onError: () => {
      toast({
        title: "エラーが発生しました",
        description: "フィードバックの送信に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
  });

  // ユーザーのフィードバック一覧取得
  const getUserFeedbackQuery = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    enabled: false, // 明示的に呼び出すまで実行しない
  });

  // 特定の注文に対するフィードバック取得
  const getOrderFeedbackQuery = (orderId: number) => {
    return useQuery<Feedback>({
      queryKey: ["/api/feedback/order", orderId],
      enabled: !!orderId,
    });
  };

  return {
    submitFeedback: submitFeedbackMutation.mutate,
    isSubmitting: submitFeedbackMutation.isPending,
    getUserFeedback: getUserFeedbackQuery.refetch,
    userFeedback: getUserFeedbackQuery.data || [],
    isLoadingUserFeedback: getUserFeedbackQuery.isLoading,
    getOrderFeedback: getOrderFeedbackQuery,
  };
}