import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ShoppingBag, Plus, Minus, Trash2, PauseCircle, Info } from "lucide-react";
import { TimeSlotSelector } from "@/components/time-slot-selector";
import { PayPayPaymentDialog } from "@/components/paypay-payment-dialog";
import { FoodSpinner } from "@/components/ui/food-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type CartItem = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  size: string;
  customizations: string[];
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
  };
};

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, login } = useAuth();
  const { removeItem, updateQuantity, clearCart } = useCart();

  // 店舗設定を取得
  const { isAcceptingOrders, refetch: refetchStoreSettings } = useStoreSettings();
  // 受け取り時間の選択画面が開いているか
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  // PayPay決済ダイアログが開いているか
  const [isPayPayOpen, setIsPayPayOpen] = useState(false);

  // ページマウント時に店舗設定を更新
  useEffect(() => {
    // カートページに入ったときに店舗設定を最新の状態に更新
    refetchStoreSettings();
  }, [refetchStoreSettings]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderCallNumber, setOrderCallNumber] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // カートページに入ったときに最上部にスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: cartItems, isLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (data: { timeSlotId: string; paymentMethod: string }) => {
      console.log("Placing order with data:", data);
      const response = await apiRequest("POST", "/api/orders", data);
      console.log("Order API response:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("Order success:", data);
      // clearCart();
      // queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setIsCheckoutOpen(false);
      setPaymentProcessing(true);

      // 呼出番号を設定
      // setOrderCallNumber(data.callNumber);
      setOrderId(data.id);

      // PayPayダイアログを再度開き、呼出番号を表示
      setIsPayPayOpen(true);
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "注文エラー",
        description: error.message || "注文を完了できませんでした。もう一度お試しください。",
        variant: "destructive",
      });
      setPaymentProcessing(false);
    },
  });

  const handlePlaceOrder = () => {
    if (!selectedTimeSlotId) return;

    // PayPayダイアログを開く
    placeOrderMutation.mutate({
      timeSlotId: selectedTimeSlotId,
      paymentMethod: "paypay"
    });
    setIsCheckoutOpen(false); // 注文確認ダイアログを閉じる
  };

  const handlePayPaySuccess = () => {
    console.log('PayPay payment successful, placing order...');
    // PayPay決済が成功したら注文処理を実行
    if (!selectedTimeSlotId) {
      toast({
        title: "エラー",
        description: "時間枠が選択されていません。もう一度お試しください。",
        variant: "destructive",
      });
      return;
    }

    setPaymentProcessing(true);

    // 成功メッセージを表示
    toast({
      title: "決済完了",
      description: "PayPayでの支払いが完了しました。注文を処理しています。",
      variant: "default",
    });

    // PayPayダイアログを閉じる
    setIsPayPayOpen(false);
  };

  const cartTotal = cartItems?.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0) || 0;

  const handleCheckout = () => {
    // 注文停止中は注文処理を進めない
    if (!isAcceptingOrders) {
      toast({
        title: "注文停止中",
        description: "申し訳ありませんが、現在注文の受付を一時的に停止しています。準備が整い次第、再開いたします。",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "ログインが必要です",
        description: "注文を続けるにはログインしてください",
        variant: "destructive",
      });
      login();
    } else if ((cartItems?.length || 0) > 0) {
      setIsCheckoutOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 bg-[#fee10b] py-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-black mb-2">ショッピングカート</h1>
          <div className="flex justify-center">
            <hr className="w-20 border-[#e80113] border-t-2 mb-3" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 bg-[#fee10b] rounded-full flex items-center justify-center text-black font-bold mb-4">
            読込中
          </div>
          <p className="text-gray-500 mb-4">カート情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10 bg-[#fee10b] py-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-black mb-2">ショッピングカート</h1>
        <div className="flex justify-center">
          <hr className="w-20 border-[#e80113] border-t-2 mb-3" />
        </div>
      </div>

      {/* 注文停止中の通知 */}
      {!isAcceptingOrders && (
        <Alert className="mb-6 border-[#e80113] bg-red-50">
          <PauseCircle className="h-5 w-5 text-[#e80113]" />
          <AlertTitle className="text-[#e80113] font-bold text-lg">現在、注文を停止しています</AlertTitle>
          <AlertDescription className="text-gray-800">
            申し訳ありませんが、現在注文の受付を一時的に停止しています。準備が整い次第、再開いたします。
            しばらく経ってからもう一度お試しください。
          </AlertDescription>
        </Alert>
      )}

      {(!cartItems || cartItems.length === 0) ? (
        <Card className="border-2 border-gray-100 shadow-md">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-[#fee10b] mb-4" />
            <p className="text-gray-500 mb-6">カートは空です</p>
            <Button
              onClick={() => setLocation("/")}
              className="bg-[#e80113] hover:bg-red-700 text-white px-6"
            >
              メニューに戻る
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-gray-100 shadow-md overflow-hidden">
          <div className="bg-[#e80113] text-white py-3 px-6 font-bold">
            注文内容
          </div>
          <CardContent className="divide-y divide-gray-200 p-0">
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="px-4 py-5 sm:px-8">
                  {/* 商品情報 */}
                  <div className="flex">
                    <div className="flex-shrink-0 h-20 w-20 rounded overflow-hidden bg-gray-100">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-20 w-20 object-cover"
                      />
                    </div>
                    <div className="ml-3 sm:ml-4 flex-grow">
                      <h3 className="text-base font-bold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">¥{item.product.price}</p>
                      <div className="mt-1 flex flex-col text-xs text-gray-500">
                        <span>サイズ: {item.size}</span>
                        {item.customizations.length > 0 && (
                          <span>
                            カスタマイズ: {item.customizations.join('、')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 数量調整と削除ボタン - モバイルでは下に配置 */}
                  <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end">
                    <div className="flex border rounded-md shadow-sm">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                        disabled={item.quantity <= 1}
                      >
                        <Minus />
                      </Button>
                      <div className="px-3 py-2 bg-white border-x border-gray-200">
                        {item.quantity}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="px-6 py-8 sm:px-8 bg-gradient-to-b from-gray-50 to-white">
              <div className="flex justify-between text-xl font-bold text-gray-900 border-b-2 border-[#fee10b] pb-4 mb-4">
                <p>合計金額</p>
                <p className="text-[#e80113]">¥{cartTotal}</p>
              </div>
              <div className="mt-6">
                <Button
                  className={`w-full py-6 text-lg font-bold rounded-xl shadow-lg transform transition-transform duration-300 ${isAcceptingOrders 
                    ? 'bg-[#e80113] hover:bg-red-700 text-white hover:scale-[1.02]' 
                    : 'bg-gray-400 text-white cursor-not-allowed'}`}
                  size="lg"
                  onClick={handleCheckout}
                  disabled={!isAcceptingOrders}
                >
                  {isAcceptingOrders ? (
                    "注文へ進む"
                  ) : (
                    <div className="flex items-center justify-center">
                      <PauseCircle className="h-5 w-5 mr-2" />
                      注文停止中
                    </div>
                  )}
                </Button>
              </div>
              <div className="mt-6 flex justify-center text-sm">
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="text-[#e80113] border-[#e80113] hover:bg-red-50 hover:text-[#e80113] hover:border-red-700 px-6"
                >
                  買い物を続ける
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md border-2 border-gray-100 shadow-lg max-h-[95vh] overflow-hidden flex flex-col p-0 sm:p-6">
          <DialogHeader className="border-b border-gray-200 pb-3 pt-4 px-4 sm:px-0 sm:pb-4 sm:mb-2">
            <DialogTitle className="text-lg sm:text-xl font-bold text-black">注文情報の確認</DialogTitle>
            <p className="text-gray-600 text-sm mt-1">
              下記の手順で注文を完了します：① 受け取り時間を選択 → ② 注文を確定する → ③ PayPay決済
            </p>
          </DialogHeader>

          <div className="overflow-y-auto px-4 sm:px-0 sm:pr-2 flex-grow">
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-base mb-2 pb-2 border-b border-gray-100 flex items-center">
                <span className="inline-flex items-center justify-center bg-[#e80113] text-white rounded-full w-6 h-6 mr-2 text-sm font-bold">1</span>
                受け取り時間を選択
              </h3>
              <TimeSlotSelector onSelect={setSelectedTimeSlotId} selectedId={selectedTimeSlotId} />
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-base mb-2 pb-2 border-b border-gray-100 flex items-center">
                <span className="inline-flex items-center justify-center bg-gray-700 text-white rounded-full w-6 h-6 mr-2 text-sm font-bold">2</span>
                注文内容の確認
              </h3>
              <ul className="divide-y divide-gray-200">
                {cartItems?.map((item) => (
                  <li key={item.id} className="py-2">
                    <div className="flex flex-wrap justify-between">
                      <span className="font-medium pr-2">{item.product.name} × {item.quantity}</span>
                      <span className="text-gray-700 font-medium">¥{item.product.price * item.quantity}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="block">サイズ: {item.size}</span>
                      {item.customizations.length > 0 && (
                        <span className="block">
                          カスタマイズ: {item.customizations.join('、')}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="pt-3 mt-2 flex justify-between font-bold text-lg border-t-2 border-[#fee10b]">
                <span>合計</span>
                <span className="text-[#e80113]">¥{cartTotal}</span>
              </div>
            </div>

            <div className="mt-3 py-3 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center">
                <span className="inline-flex items-center justify-center bg-[#fee10b] text-black rounded-full w-6 h-6 mr-2 text-sm font-bold">3</span>
                お支払い方法
              </h3>
              <div className="p-2 sm:p-3 border rounded-md border-[#fee10b] bg-yellow-50 flex items-center">
                <div className="bg-[#fee10b] rounded-full w-6 h-6 flex items-center justify-center mr-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6H4C2.9 6 2 6.9 2 8V16C2 17.1 2.9 18 4 18H20C21.1 18 22 17.1 22 16V8C22 6.9 21.1 6 20 6Z" fill="black"/>
                  </svg>
                </div>
                <span className="font-medium">PayPay決済</span>
              </div>

              <div className="mt-3 text-sm text-gray-500 italic">
                「注文を確定する」をクリックするとPayPay決済に進みます
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between mt-3 pt-3 px-4 sm:px-0 pb-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsCheckoutOpen(false)}
              disabled={paymentProcessing}
              className="border-[#e80113] text-[#e80113] hover:bg-red-50 hover:text-[#e80113] px-3 sm:px-5 py-2 rounded-lg text-sm sm:text-base"
            >
              キャンセル
            </Button>
            <div className="relative">
              <Button
                onClick={handlePlaceOrder}
                disabled={!selectedTimeSlotId || paymentProcessing}
                className={`bg-[#e80113] hover:bg-red-700 text-white font-bold px-3 sm:px-5 py-2 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-[1.02] text-sm sm:text-base ${!selectedTimeSlotId ? 'opacity-60' : 'animate-pulse-slow'}`}
              >
                {paymentProcessing ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-white rounded-full mr-2 flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#e80113] rounded-full"></div>
                    </div>
                    <span>処理中...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center bg-white text-[#e80113] rounded-full w-5 h-5 mr-2 text-sm font-bold">4</span>
                    <span>注文を確定する</span>
                  </div>
                )}
              </Button>
              {!selectedTimeSlotId && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#e80113] text-white text-xs py-1 px-3 rounded-md whitespace-nowrap">
                  <div className="absolute w-2 h-2 bg-[#e80113] transform rotate-45 left-1/2 -bottom-1 -translate-x-1/2"></div>
                  ↑ まず受取時間を選択してください ↑
                </div>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PayPay決済ダイアログ */}
      <PayPayPaymentDialog
        isOpen={isPayPayOpen}
        onClose={() => {
          setIsPayPayOpen(false);
          // 注文と決済が完了している場合は、ピックアップ画面に遷移
          if (orderCallNumber) {
            setLocation(`/pickup/${orderCallNumber}`);
          }
        }}
        onSuccess={handlePayPaySuccess}
        amount={cartTotal}
        orderId={orderId || undefined}
        callNumber={orderCallNumber as number | undefined}
      />
    </div>
  );
}
