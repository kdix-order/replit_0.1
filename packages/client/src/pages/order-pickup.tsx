/**
 * 注文ピックアップページ
 * 注文の受け取り画面を表示し、呼び出し番号を大きく表示するマクドナルドスタイルのUIを提供します
 * 注文状態の追跡機能も含まれています
 */
import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ClockIcon, ArrowRight, Home, History, Ticket, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { FoodSpinner } from "@/components/ui/food-spinner";
import { OrderStatusTracker } from "@/components/order-status-tracker";

/**
 * 注文ピックアップページコンポーネント
 * 注文の受け取り情報を表示し、大きな呼び出し番号と呼び出し番号を提供します
 * 注文状況のリアルタイム表示とマクドナルドスタイルのインターフェースを実装しています
 */
export default function OrderPickup() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const id = params.id;
  const [currentTime, setCurrentTime] = useState(new Date());

  // 現在時刻を1分ごとに更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 注文情報をAPIから取得
  const {
    data: order,
    isLoading,
    error
  } = useQuery<{
    id: string;
    callNumber: number;
    status: "new" | "paid" | "preparing" | "completed";
    total: number;
    timeSlot: {
      id: string;
      time: string;
    };
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      size?: string;
      customizations?: string[];
    }>;
  }>({
    queryKey: [`/api/orders/${id}`],
    enabled: !!id && isAuthenticated,
    retry: 1,
    staleTime: 30000, // 30秒
  });

  // 15分後を受け取り目安時間とする
  const estimatedPickupTime = new Date(currentTime.getTime() + 15 * 60000);
  const formattedPickupTime = `${estimatedPickupTime.getHours()}:${String(estimatedPickupTime.getMinutes()).padStart(2, '0')}`;

  if (!id) {
    setLocation("/");
    return null;
  }

  // ログインしていない場合
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Ticket className="h-10 w-10 text-[#e80113]" />
        </div>
        <h2 className="text-xl font-bold mb-3">ログインが必要です</h2>
        <p className="text-gray-600 mb-6">注文情報を表示するにはログインしてください</p>
        <Button
          onClick={() => setLocation("/")}
          className="bg-[#e80113] hover:bg-red-700 text-white"
        >
          <Home className="mr-2 h-4 w-4" />
          ホームに戻る
        </Button>
      </div>
    );
  }

  // エラーが発生した場合
  if (error) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-[#e80113]" />
        </div>
        <h2 className="text-xl font-bold mb-3">注文情報を読み込めませんでした</h2>
        <p className="text-gray-600 mb-6">正しい注文番号にアクセスしているか確認してください</p>
        <Button
          onClick={() => setLocation("/history")}
          className="bg-[#e80113] hover:bg-red-700 text-white mb-2"
        >
          <History className="mr-2 h-4 w-4" />
          注文履歴を確認する
        </Button>
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
        >
          <Home className="mr-2 h-4 w-4" />
          ホームに戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* 上部の受け取り番号表示ヘッダー - マクドナルドスタイル */}
      <div className="bg-white py-6 px-4 text-center border-b border-gray-200">
        <div className="flex justify-center items-center mb-3">
          <div className="bg-[#e80113] text-white text-2xl font-bold py-2 px-6 rounded-full inline-flex items-center shadow-md">
            <Ticket className="h-5 w-5 mr-2" />
            <span>受け取り</span>
          </div>
        </div>
        <h2 className="font-bold text-lg mb-1">お料理のお受け取り</h2>
        <p className="text-sm text-gray-600">この画面をスタッフにご提示ください</p>
      </div>

      {/* 呼び出し番号 - マクドナルドスタイルの大きな表示 */}
      <div className="bg-[#e80113] px-4 py-8 text-center">
        <h3 className="text-lg font-medium text-white mb-1">お呼び出し番号</h3>
        {order ? (
          <div className="text-[100px] leading-none font-bold text-white py-6">
            {order.callNumber}
          </div>
        ) : (
          <Loader2 className="animate-spin h-16 w-16 mx-auto mb-4" />
        )}
        <p className="text-sm text-white/80">この番号が呼ばれたらカウンターでお受け取りください</p>
      </div>

      {/* 注文ステータストラッカー */}
      {order && (
        <div className="bg-white px-6 py-4">
          <OrderStatusTracker status={order.status || "new"} />
        </div>
      )}

      {/* 呼出番号のステータス説明 */}
      <div className="px-6 py-4 bg-white border-t border-gray-100">
        <div className="text-center text-sm text-gray-600 py-2">
          <p>カウンターで呼出番号をお伝えください</p>
          <p className="mt-1">スタッフがお料理をお渡しします</p>
        </div>
      </div>

      <Card className="mx-4 mt-4 shadow-md border-none">
        <CardContent className="p-6">
          {/* 受け取り予想時間 */}
          <div className="flex items-center mb-4">
            <div className="bg-[#fee10b] rounded-full p-2 mr-3">
              <ClockIcon className="h-6 w-6 text-black" />
            </div>
            <div>
              <h3 className="font-bold text-lg">受け取り予想時間</h3>
              <p className="text-gray-500 text-sm">約15分後（{formattedPickupTime}頃）</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* 注文内容のサマリー */}
          <div className="mb-4">
            <h3 className="font-bold mb-3">注文内容</h3>
            <ul className="space-y-2">
              {order?.items?.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span className="text-gray-700">
                    {item.name} {item.size && `(${item.size})`} × {item.quantity}
                  </span>
                  <span className="font-medium">¥{item.price * item.quantity}</span>
                </li>
              ))}
              {isLoading && (
                <li className="flex flex-col items-center justify-center py-4">
                  <div className="w-10 h-10 bg-[#e80113] rounded-full flex items-center justify-center text-white font-bold mb-2">
                    読込中
                  </div>
                </li>
              )}
            </ul>
          </div>

          <Separator className="my-4" />

          {/* 支払い情報 */}
          <div className="flex justify-between font-bold">
            <span>合計</span>
            <span>¥{order?.total || '-'}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">PayPay決済済み</div>
        </CardContent>

        <CardFooter className="bg-gray-50 p-4 flex flex-col gap-2">
          <Button
            className="w-full bg-[#e80113] hover:bg-red-700 text-white"
            onClick={() => setLocation("/history")}
          >
            <History className="mr-2 h-4 w-4" />
            注文履歴を確認する
          </Button>

          <Button
            variant="outline"
            className="w-full border-gray-300"
            onClick={() => setLocation("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            メニューに戻る
          </Button>
        </CardFooter>
      </Card>

      {/* スペーサー */}
      <div className="flex-grow"></div>
    </div>
  );
}