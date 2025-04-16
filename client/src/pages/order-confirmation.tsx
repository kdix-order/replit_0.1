/**
 * 注文確認ページ
 * 注文完了後の確認画面を表示し、注文状況の追跡と受け取り情報を提供します
 */
import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ClockIcon, ArrowRight, Home, History, Ticket } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { FoodSpinner } from "@/components/ui/food-spinner";
import { OrderStatusTracker } from "@/components/order-status-tracker";

/**
 * 注文確認ページコンポーネント
 * 注文完了後に表示され、注文番号、ステータス、受け取り情報などを表示します
 * ユーザーは注文状態の確認やQRコード表示ページへの遷移が可能です
 */
export default function OrderConfirmation() {
  const params = useParams<{ callNumber: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const callNumber = params.callNumber;
  const [currentTime, setCurrentTime] = useState(new Date());

  // 現在時刻を1分ごとに更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 注文情報をAPIから取得
  const { data: order } = useQuery<{
    id: number;
    callNumber: number;
    status: "new" | "preparing" | "completed";
    total: number;
    items: Array<{
      id: number;
      name: string;
      price: number;
      quantity: number;
      size?: string;
      customizations?: string[];
    }>;
  }>({
    queryKey: [`/api/orders/${callNumber}`],
    enabled: !!callNumber && isAuthenticated,
  });

  // 15分後を受け取り目安時間とする
  const estimatedPickupTime = new Date(currentTime.getTime() + 15 * 60000);
  const formattedPickupTime = `${estimatedPickupTime.getHours()}:${String(estimatedPickupTime.getMinutes()).padStart(2, '0')}`;

  if (!callNumber) {
    setLocation("/");
    return null;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* 上部の注文確認ヘッダー */}
      <div className="bg-[#fee10b] text-black py-6 px-4 text-center">
        <CheckCircle className="h-16 w-16 mx-auto text-[#e80113] mb-4" />
        <h2 className="text-2xl font-bold mb-1">注文が完了しました！</h2>
        <p className="text-sm">これからお料理を準備します</p>
      </div>

      {/* 呼び出し番号 */}
      <div className="bg-white p-6 text-center">
        <h3 className="text-lg font-medium text-gray-500 mb-1">お呼び出し番号</h3>
        <div className="text-6xl font-bold text-[#e80113] py-4">{callNumber}</div>
        <p className="text-sm text-gray-600">この番号が呼ばれたらカウンターでお受け取りください</p>
        
        {/* 注文ステータストラッカー */}
        {order && (
          <div className="mt-6">
            <OrderStatusTracker status={order.status || "new"} />
          </div>
        )}
      </div>

      <Card className="mx-4 -mt-4 shadow-md border-none">
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
          
          {/* 受け取り用QRコード表示リンク */}
          <Button
            className="w-full mt-3 bg-[#e80113] hover:bg-[#d10010] text-white"
            onClick={() => setLocation(`/pickup/${callNumber}`)}
          >
            <Ticket className="mr-2 h-4 w-4" />
            受け取り用QRコードを表示する
          </Button>

          <Separator className="my-4" />

          {/* 注文内容のサマリー */}
          <div className="mb-4">
            <h3 className="font-bold mb-3">注文内容</h3>
            <ul className="space-y-2">
              {order?.items?.map((item: any, idx: number) => (
                <li key={idx} className="flex justify-between">
                  <span className="text-gray-700">
                    {item.name} {item.size && `(${item.size})`} × {item.quantity}
                  </span>
                  <span className="font-medium">¥{item.price * item.quantity}</span>
                </li>
              ))}
              {!order?.items && (
                <li className="flex flex-col items-center justify-center py-4">
                  <FoodSpinner 
                    size="md" 
                    foodType="rice-bowl" 
                    className="mb-2" 
                    text="注文内容を確認中..." 
                  />
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
          <div className="text-sm text-gray-500 mt-1">PayPay決済</div>
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

      {/* 店舗情報 */}
      <div className="bg-white p-6 mt-6 flex-grow">
        <h3 className="font-bold mb-2">味店焼マン 渋谷店</h3>
        <p className="text-sm text-gray-600 mb-4">東京都渋谷区渋谷1-23-45</p>
        <p className="text-xs text-gray-400">
          ご注文の変更・キャンセルについては店舗までお問い合わせください
        </p>
      </div>
    </div>
  );
}
