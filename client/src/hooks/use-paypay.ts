import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';

type PayPayPaymentStatus = 'CREATED' | 'AUTHORIZED' | 'COMPLETED' | 'FAILED' | 'CANCELED';

type PayPayQRCodeResponse = {
  status: string;
  resultInfo: {
    code: string;
    message: string;
  };
  data: {
    paymentId: string;
    merchantPaymentId: string;
    url: string; // QRコードURL
    deepLink: string; // アプリ起動用リンク
  };
};

type PayPayStatusResponse = {
  status: string;
  data: {
    status: PayPayPaymentStatus;
    paymentId: string;
    merchantPaymentId: string;
  };
};

/**
 * PayPay決済機能を使用するためのカスタムフック
 * QRコード生成と支払い状態確認の機能を提供します
 */
export function usePayPay() {
  const [merchantPaymentId, setMerchantPaymentId] = useState<string | null>(null);

  // PayPay QRコード生成
  const createPaymentMutation = useMutation({
    mutationFn: async ({ orderId }: {
      orderId: string;
    }) => {
      const response = (await apiRequest('POST', '/api/payments/paypay/create', {
        orderId
      })) as { BODY: PayPayQRCodeResponse };

      if (response.BODY.resultInfo.code !== 'SUCCESS') {
        throw new Error(response.BODY.resultInfo.message || 'PayPayでの支払い処理中にエラーが発生しました');
      }

      return response;
    },
    onSuccess: (data) => {
      if (data.BODY.data?.url) {
        window.location.href = data.BODY.data?.url;
      }
    }
  });

  // 支払い状態チェック
  const paymentStatus = useQuery({
    queryKey: ['/api/payments/paypay/status', merchantPaymentId],
    queryFn: async () => {
      if (!merchantPaymentId) {
        throw new Error('支払いIDが設定されていません');
      }

      const response = await apiRequest('GET', `/api/payments/paypay/status/${merchantPaymentId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '支払い状態確認中にエラーが発生しました');
      }

      return response.json() as Promise<PayPayStatusResponse>;
    },
    enabled: !!merchantPaymentId,
    refetchInterval: (data) => {
      // data自体がundefinedの場合は3秒ごとに更新
      const responseData = data.state.data;
      if (!responseData) return 3000;

      // 支払いが完了またはキャンセルされたら更新を停止
      if (responseData.data?.status === 'COMPLETED' ||
        responseData.data?.status === 'CANCELED' ||
        responseData.data?.status === 'FAILED') {
        return false;
      }
      // それ以外は3秒ごとに更新
      return 3000;
    }
  });

  // 支払い状態のリセット
  const resetPaymentStatus = () => {
    setMerchantPaymentId(null);
    queryClient.invalidateQueries({ queryKey: ['/api/payments/paypay/status'] });
  };

  return {
    createPayment: createPaymentMutation.mutate,
    isCreating: createPaymentMutation.isPending,
    paymentError: createPaymentMutation.error?.message,
    paymentData: createPaymentMutation.data?.BODY,

    paymentStatus: paymentStatus.data?.data?.status,
    isCheckingStatus: paymentStatus.isLoading,
    statusError: paymentStatus.error?.message,

    resetPaymentStatus,
  };
}