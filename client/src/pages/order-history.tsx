/**
 * 注文履歴ページ
 * ユーザーの過去の注文を一覧表示し、各注文の詳細や状態を確認できる機能を提供します
 * 注文のステータス表示、QRコード表示への遷移機能も含まれています
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Clock, ChevronRight, Receipt, Eye, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { OrderDetailDialog } from "@/components/order-detail-dialog";
import { getStatusLabelInfo, type OrderStatus } from "@/utils/orderStatus";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  customizations?: string[];
};

type Order = {
  id: string;
  userId: number;
  callNumber: number;
  status: "pending" | "paid" | "ready" | "completed" | "cancelled" | "refunded";
  total: number;
  timeSlot: {
    id: string;
    time: string;
  };
  createdAt: string;
  items: OrderItem[];
};


/**
 * 注文履歴ページコンポーネント
 * ユーザーの注文履歴を一覧表示し、各注文の詳細確認機能を提供します
 * 注文ステータスのカラーコーディングやQRコードへの遷移機能も実装しています
 */
export default function OrderHistory() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">注文履歴</h1>
        
        <Card>
          <CardContent className="p-0">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full mr-4" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen">
      <div className="bg-[#fee10b] py-6 px-4 text-center shadow-md">
        <h1 className="text-2xl font-bold text-black">注文履歴</h1>
      </div>
      
      {(!orders || orders.length === 0) ? (
        <div className="mt-8 p-8 text-center">
          <Receipt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">注文履歴がありません</p>
          <Button 
            onClick={() => setLocation("/")} 
            className="mt-6 bg-[#e80113] hover:bg-red-700 text-white"
          >
            メニューに戻る
          </Button>
        </div>
      ) : (
        <div className="mt-4 px-4">
          <ul className="space-y-4">
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedOrder(order);
                  setDetailDialogOpen(true);
                }}
              >
                <div className={cn(
                  "h-2 w-full",
                  order.status === "new" ? "bg-yellow-500" : 
                  order.status === "preparing" ? "bg-blue-500" : 
                  "bg-green-500"
                )} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center">
                        <div className="bg-[#fee10b] rounded-full p-1 mr-2">
                          <Receipt className="h-4 w-4 text-black" />
                        </div>
                        <p className="font-bold text-lg">お呼び出し番号: {order.callNumber}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">注文日時: {new Date(order.createdAt).toLocaleString('ja-JP')}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusLabelInfo(order.status as OrderStatus).className}`}>
                      {getStatusLabelInfo(order.status as OrderStatus).text}
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-3">
                    <div className="bg-[#fee10b] rounded-full p-1 mr-2">
                      <Clock className="h-4 w-4 text-black" />
                    </div>
                    <p className="text-sm">受取時間: <span className="font-medium">{order.timeSlot.time}</span></p>
                  </div>
                  
                  <div className="mt-3 pb-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">注文内容:</p>
                    <ul className="mt-1">
                      {order.items.slice(0, 2).map((item, index) => (
                        <li key={index} className="text-sm flex justify-between">
                          <span>
                            {item.name}
                            {item.size && <span className="text-xs text-gray-500"> ({item.size})</span>}
                            <span className="text-gray-500"> × {item.quantity}</span>
                          </span>
                          <span className="text-gray-700">¥{item.price * item.quantity}</span>
                        </li>
                      ))}
                      {order.items.length > 2 && (
                        <li className="text-xs text-gray-500 mt-1">他 {order.items.length - 2} 品</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <p className="font-bold">合計: ¥{order.total}</p>
                      <p className="text-xs text-gray-500">PayPay決済</p>
                    </div>
                    <div className="flex items-center">
                      <AnimatedButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/pickup/${order.id}`);
                        }}
                        className="mr-2 px-2 py-1 bg-[#e80113] hover:bg-red-600 text-white rounded-md"
                        animationType="scale"
                        size="sm"
                        intensity="medium"
                      >
                        <Ticket className="h-4 w-4 mr-1" />
                        <span className="text-xs">番号</span>
                      </AnimatedButton>
                      
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ul>
          
          <div className="my-8 text-center">
            <Button 
              onClick={() => setLocation("/")} 
              variant="outline"
              className="border-gray-300"
            >
              メニューに戻る
            </Button>
          </div>
        </div>
      )}
      <OrderDetailDialog
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}
