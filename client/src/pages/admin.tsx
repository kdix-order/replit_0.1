/**
 * 管理者ページ
 * 注文の管理、ステータスの更新、および店舗設定を制御する管理画面を提供します
 */
import { useQuery, useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getCustomizationLabel } from "@/lib/utils";
import { BowlSteamSpinner } from "@/components/ui/food-spinner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, Clock, AlertCircle, PauseCircle, PlayCircle, Calendar, Search, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useStoreSettings, useUpdateStoreSettings } from "@/hooks/use-store-settings";
import { Switch } from "@/components/ui/switch";
import { OrderStatusTracker } from "@/components/order-status-tracker";
import { getValidNextStatuses, isFinalStatus, getStatusLabel, isUndoTransition, getStatusLabelInfo, type OrderStatus } from "@/utils/orderStatus";

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
  userId: string;
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

// ステータスごとのアイコンを定義
const statusIcons: Record<OrderStatus, JSX.Element | null> = {
  pending: <Clock className="w-4 h-4 mr-1" />,
  paid: <Clock className="w-4 h-4 mr-1" />,
  ready: null,
  completed: null,
  cancelled: null,
  refunded: null
};

/**
 * 注文アイテムコンポーネント
 * 各注文の表示と詳細の展開/折りたたみ機能を提供します
 */
const OrderItem = memo<{
  order: Order;
  handleStatusChange: (orderId: string, status: string) => void;
  updateOrderStatusMutation: UseMutationResult<any, Error, { id: string; status: string }, unknown>;
  setDetailOrder: (order: Order | null) => void;
  getCustomizationLabel: (customization: string) => string;
}>(function OrderItem({ 
  order, 
  handleStatusChange, 
  updateOrderStatusMutation, 
  setDetailOrder,
  getCustomizationLabel
}: { 
  order: Order; 
  handleStatusChange: (orderId: string, status: string) => void;
  updateOrderStatusMutation: UseMutationResult<any, Error, { id: string; status: string }, unknown>;
  setDetailOrder: (order: Order | null) => void;
  getCustomizationLabel: (customization: string) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div 
      className="hover:bg-gray-50 transition-colors"
    >
      {/* 注文概要セクション（常に表示） */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* 左側: 呼出番号 */}
          <div className="flex-shrink-0 w-2/5 md:w-1/4 lg:w-1/5">
            <div className="bg-[#fff9dc] px-4 py-3 rounded-lg border-2 border-[#e80113] shadow-sm flex flex-col items-center justify-center">
              <div className="text-xs text-gray-600">呼出番号</div>
              <div className="font-bold text-4xl text-[#e80113]">{order.callNumber}</div>
            </div>
          </div>
          
          {/* 中央: 注文内容の概要 */}
          <div className="flex-grow px-4 md:px-6">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">注文内容 <span className="text-[#e80113]">¥{order.total}</span></span>
                <Badge className={getStatusLabelInfo(order.status as OrderStatus).className}>
                  <div className="flex items-center">
                    {statusIcons[order.status as OrderStatus]}
                    {getStatusLabelInfo(order.status as OrderStatus).text}
                  </div>
                </Badge>
              </div>
              <div className="text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                {order.items.slice(0, 1).map((item: OrderItem) => (
                  <span key={item.id}>
                    {item.name}
                    {item.size && <span className="text-xs text-gray-500"> ({item.size})</span>}
                    <span className="text-gray-500"> ×{item.quantity}</span>
                  </span>
                ))}
                {order.items.length > 1 && <span className="text-gray-500"> 他{order.items.length - 1}点</span>}
              </div>
            </div>
          </div>
          
          {/* 右側: 受取時間 */}
          <div className="flex-shrink-0 text-right">
            <div className="bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-xs text-gray-500">受取</div>
              <div className="font-semibold text-sm text-[#e80113]">{order.timeSlot.time}</div>
            </div>
          </div>
        </div>
        
        {/* 展開アイコン */}
        <div className="flex justify-center mt-2">
          <span className="text-xs text-gray-500 flex items-center">
            {isExpanded ? '折りたたむ' : '詳細を表示'}
            <svg className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"></path>
            </svg>
          </span>
        </div>
      </div>
      
      {/* 展開時の詳細表示 */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-white">
          {/* 注文情報ヘッダー */}
          <div className="mb-3 bg-gray-50 p-3 rounded flex flex-wrap gap-3 lg:gap-4 text-sm">
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">注文ID:</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-500" />
              <span className="text-gray-700">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          {/* 進捗ステータストラッカー */}
          <div className="mb-4 transform scale-110 origin-top">
            <OrderStatusTracker status={order.status} />
          </div>
          
          {/* 注文内容詳細 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2 text-gray-700">注文内容</h4>
            <div className="space-y-2">
              {order.items.map((item: OrderItem, index: number) => (
                <div key={index} className="bg-white p-3 rounded-md border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm">
                      <span className="text-gray-500 mr-1">×{item.quantity}</span>
                      <span className="font-semibold text-[#e80113]">¥{item.price * item.quantity}</span>
                    </div>
                  </div>
                  {(item.size || (item.customizations && item.customizations.length > 0)) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.size && (
                        <span className="text-xs bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          {item.size}
                        </span>
                      )}
                      {item.customizations && item.customizations.map((customization, idx) => (
                        <span key={idx} className="text-xs bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          {getCustomizationLabel(customization)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-3">
              <div className="bg-[#fff9dc] px-3 py-1 rounded-md border border-[#e80113] text-[#e80113] font-semibold">
                合計: ¥{order.total}
              </div>
            </div>
          </div>
          
          {/* 操作ボタン */}
          <div className="flex justify-between items-center">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setDetailOrder(order)}
              className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 text-base min-h-[48px]"
            >
              詳細を表示
            </Button>
            
            {isFinalStatus(order.status as OrderStatus) ? (
              <Badge className={getStatusLabelInfo(order.status as OrderStatus).className}>
                {statusIcons[order.status as OrderStatus]}
                {getStatusLabelInfo(order.status as OrderStatus).text}
              </Badge>
            ) : (
              <Select
                value={order.status}
                onValueChange={(value: string) => handleStatusChange(order.id, value)}
                disabled={updateOrderStatusMutation.isPending}
              >
                <SelectTrigger className={`w-44 h-12 text-base 
                  ${order.status === 'pending' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                  order.status === 'paid' ? 'bg-[#fee10b] text-black border-[#e80113]' : 
                  order.status === 'ready' ? 'bg-green-100 text-green-800 border-green-300' :
                  order.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-300' :
                  'bg-red-100 text-red-800 border-red-300'}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getValidNextStatuses(order.status as OrderStatus).map((status: OrderStatus) => (
                    <SelectItem key={status} value={status} className="flex items-center">
                      {status === 'paid' && <><Clock className="w-4 h-4 mr-1 inline" /> 支払い済み</>}
                      {status === 'ready' && <><BowlSteamSpinner size="xs" className="mr-1 inline" /> 受取可能</>}
                      {status === 'completed' && <>
                        <svg className="w-4 h-4 mr-1 text-green-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg> 完了
                      </>}
                      {status === 'cancelled' && <><AlertCircle className="w-4 h-4 mr-1 inline text-red-600" /> キャンセル</>}
                      {status === 'refunded' && <><AlertCircle className="w-4 h-4 mr-1 inline text-red-600" /> 返金済み</>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // カスタム比較関数でレンダリングを最適化
  return prevProps.order.id === nextProps.order.id &&
         prevProps.order.status === nextProps.order.status &&
         prevProps.updateOrderStatusMutation.isPending === nextProps.updateOrderStatusMutation.isPending;
});


/**
 * 管理者ページコンポーネント
 * 注文状況の管理、ステータス更新、注文フィルタリング機能を提供します
 * 注文受付状態の切り替えや注文一覧の表示・自動更新機能も実装しています
 */
export default function Admin() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortNewest, setSortNewest] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);
  
  // 店舗設定の取得
  const { storeSettings, isAcceptingOrders, refetch: refetchStoreSettings } = useStoreSettings();
  const { updateStoreSettings } = useUpdateStoreSettings();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 最後の更新時間の状態
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [showRefreshAnimation, setShowRefreshAnimation] = useState(false);
  
  // Admin orders query
  const { 
    data: orders, 
    isLoading, 
    isFetching, 
    refetch 
  } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated && isAdmin,
    refetchInterval: 60000, // Auto-refresh every 1 minute
  });
  
  // useEffectを使用して更新を検出
  useEffect(() => {
    if (!isLoading && !isFetching && orders) {
      // 更新情報を記録
      setLastRefreshTime(new Date());
      
      // 更新アニメーションを表示
      setShowRefreshAnimation(true);
      setTimeout(() => setShowRefreshAnimation(false), 2000);
    }
  }, [isLoading, isFetching, orders]);

  // Mutation for status update
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${id}`, { status });
      return response;
    },
    onSuccess: (_, variables) => {
      // キャッシュを更新
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      
      // 注文情報を取得
      const order = orders?.find(o => o.id === variables.id);
      const callNumber = order ? order.callNumber : "不明";
      const statusText = getStatusLabelInfo(variables.status as OrderStatus).text;
      
      // 明示的にトーストを表示
      toast({
        title: `ステータスを「${statusText}」に更新しました`,
        description: `呼出番号 ${callNumber} の注文のステータスが正常に更新されました。`,
        duration: 5000, // 5秒間表示
      });
    },
    onError: (error: Error) => {
      console.error("Order status update error:", error);
      
      // エラートーストを表示
      toast({
        title: "エラーが発生しました",
        description: error.message || "ステータスの更新に失敗しました。もう一度お試しください。",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Handler for status change - useCallbackでメモ化
  const handleStatusChange = useCallback((orderId: string, newStatus: string) => {
    const order = orders?.find(o => o.id === orderId);
    if (!order) return;
    
    const currentStatus = order.status as OrderStatus;
    const isUndo = isUndoTransition(currentStatus, newStatus as OrderStatus);
    
    const message = isUndo 
      ? `誤操作の可能性があります。\n本当にステータスを「${getStatusLabel(currentStatus)}」から「${getStatusLabel(newStatus as OrderStatus)}」に戻しますか？`
      : `注文のステータスを「${getStatusLabel(newStatus as OrderStatus)}」に変更しますか？`;
    
    if (!confirm(message)) {
      return;
    }
    updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
  }, [orders, updateOrderStatusMutation]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let result = [...orders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((order: Order) => 
        order.callNumber.toString().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (filterStatus && filterStatus !== 'all') {
      result = result.filter((order: Order) => order.status === filterStatus);
    }
    
    // Apply urgent filter (orders waiting > 10 minutes)
    if (showOnlyUrgent) {
      result = result.filter((order: Order) => {
        const orderTime = new Date(order.createdAt).getTime();
        const now = new Date().getTime();
        const waitingMinutes = (now - orderTime) / 1000 / 60;
        return (order.status === 'paid' || order.status === 'ready') && waitingMinutes > 10;
      });
    }
    
    // Apply sorting
    result.sort((a: Order, b: Order) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortNewest ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [orders, filterStatus, sortNewest, searchQuery, showOnlyUrgent]);

  // Count orders by status
  const orderCounts = useMemo(() => {
    if (!orders) return { pending: 0, paid: 0, ready: 0, completed: 0, cancelled: 0, refunded: 0, total: 0, urgent: 0 };
    
    const now = new Date().getTime();
    return orders.reduce((acc: {
      pending: number;
      paid: number;
      ready: number;
      completed: number;
      cancelled: number;
      refunded: number;
      total: number;
      urgent: number;
    }, order: Order) => {
      if (acc[order.status] !== undefined) {
        acc[order.status]++;
      }
      acc.total++;
      
      // Count urgent orders
      const orderTime = new Date(order.createdAt).getTime();
      const waitingMinutes = (now - orderTime) / 1000 / 60;
      if ((order.status === 'paid' || order.status === 'ready') && waitingMinutes > 10) {
        acc.urgent++;
      }
      
      return acc;
    }, { pending: 0, paid: 0, ready: 0, completed: 0, cancelled: 0, refunded: 0, total: 0, urgent: 0 });
  }, [orders]);

  // Redirect if not admin
  if (!isAuthenticated || !isAdmin) {
    setLocation("/");
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <div className="text-center mb-8 bg-[#fee10b] py-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-black mb-2">味店焼マン - 管理画面</h1>
          <div className="flex justify-center">
            <hr className="w-20 border-[#e80113] border-t-2 mb-3" />
          </div>
          <div className="flex justify-center items-center">
            <span className="text-sm bg-[#e80113] text-white px-3 py-1 rounded-md">
              現在の時刻: {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        <Card className="border-2 border-gray-100 shadow-md overflow-hidden">
          <div className="bg-[#e80113] text-white py-3 px-6 font-bold">
            注文一覧を読み込み中...
          </div>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <BowlSteamSpinner 
              size="lg" 
              className="mb-6 text-[#e80113]" 
            />
            <h3 className="text-xl font-medium text-gray-700 mb-2">注文データを読み込んでいます</h3>
            <p className="text-gray-500">少々お待ちください...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="text-center mb-4 bg-[#fee10b] py-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-black mb-2">味店焼マン - 管理画面</h1>
        <div className="flex justify-center">
          <hr className="w-20 border-[#e80113] border-t-2 mb-3" />
        </div>
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex flex-wrap justify-center items-center gap-2">
            <span className="text-sm bg-[#e80113] text-white px-3 py-1 rounded-md flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              現在の時刻: {currentTime.toLocaleTimeString()}
            </span>
            
            <Button
              size="lg"
              onClick={() => {
                refetch();
                setShowRefreshAnimation(true);
                setTimeout(() => setShowRefreshAnimation(false), 2000);
              }}
              className="bg-white text-[#e80113] border-2 border-[#e80113] hover:bg-[#e80113] hover:text-white px-6 py-3 text-base"
              disabled={isFetching}
            >
              <RefreshCw className={`mr-2 h-5 w-5 ${isFetching || showRefreshAnimation ? 'animate-spin' : ''}`} />
              {isFetching ? '更新中...' : '最新の情報に更新'}
            </Button>
          </div>
          <div className="text-xs text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
            <span className={`transition-opacity duration-300 ${showRefreshAnimation ? 'opacity-100 font-bold text-[#e80113]' : 'opacity-80'}`}>
              最終更新: {lastRefreshTime.toLocaleTimeString()} 
              {showRefreshAnimation && <span className="ml-2 font-bold text-green-600">✓ 更新完了!</span>}
            </span>
            <span className="ml-2 text-gray-500">(1分ごとに自動更新)</span>
          </div>
        </div>
      </div>

      {/* Store settings section */}
      <Card className="border-2 border-gray-100 shadow-md overflow-hidden mb-6">
        <CardHeader className="bg-[#e80113] text-white py-4 px-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold">店舗設定</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold mb-2">注文受付の状態</h3>
              <p className="text-sm text-gray-500 mb-4">
                注文の受付を一時的に停止または再開します。停止中は新規注文ができなくなります。
              </p>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2 mb-2">
                  <Switch 
                    id="accepting-orders"
                    checked={isAcceptingOrders}
                    onCheckedChange={async (checked: boolean) => {
                      try {
                        await updateStoreSettings(checked);
                        await refetchStoreSettings();
                        // 店舗設定のトースト表示を削除
                      } catch (error) {
                        console.error("Store settings update error:", error);
                        // エラートースト表示を削除
                      }
                    }}
                  />
                  <Label htmlFor="accepting-orders" className="cursor-pointer">
                    {isAcceptingOrders 
                      ? <span className="flex items-center text-green-600 font-bold"><PlayCircle className="w-4 h-4 mr-1" /> 注文受付中</span> 
                      : <span className="flex items-center text-red-600 font-bold"><PauseCircle className="w-4 h-4 mr-1" /> 注文停止中</span>
                    }
                  </Label>
                </div>
                
                <div className="flex mt-2">
                  <Button 
                    size="lg" 
                    onClick={async () => {
                      try {
                        await updateStoreSettings(true);
                        await refetchStoreSettings();
                        // 受付開始のトースト表示を削除
                      } catch (error) {
                        console.error("Error enabling order acceptance:", error);
                        // エラートースト表示を削除
                      }
                    }}
                    className="mr-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-base min-h-[48px]"
                    disabled={isAcceptingOrders}
                  >
                    <PlayCircle className="w-5 h-5 mr-2" /> 受付開始
                  </Button>
                  
                  <Button 
                    size="lg"
                    onClick={async () => {
                      try {
                        await updateStoreSettings(false);
                        await refetchStoreSettings();
                        // 受付停止のトースト表示を削除
                      } catch (error) {
                        console.error("Error disabling order acceptance:", error);
                        // エラートースト表示を削除
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-base min-h-[48px]"
                    disabled={!isAcceptingOrders}
                  >
                    <PauseCircle className="w-5 h-5 mr-2" /> 受付停止
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${isAcceptingOrders ? 'text-green-600' : 'text-red-600'}`}>
                  {isAcceptingOrders ? '営業中' : '注文停止中'}
                </div>
                <p className="text-sm text-gray-500">
                  最終更新: {storeSettings ? new Date(storeSettings.updatedAt).toLocaleString() : ''}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders tab */}
      <Tabs defaultValue="orders" className="mb-8">
        <TabsList className="w-full bg-gray-100 p-1 mb-6">
          <TabsTrigger 
            value="orders" 
            className="flex-1 py-4 bg-white data-[state=active]:bg-[#e80113] data-[state=active]:text-white rounded-md text-base font-medium"
          >
            <div className="flex items-center justify-center">
              注文管理
              <Badge className="ml-2 bg-gray-100 text-black text-base px-3 py-1">{orderCounts.total}</Badge>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <Card className="border-2 border-gray-100 shadow-md overflow-hidden">
            <CardHeader className="bg-[#e80113] text-white py-4 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">
                  注文一覧
                  {orderCounts.urgent > 0 && (
                    <Badge className="ml-2 bg-red-600 text-white animate-pulse">
                      <Bell className="w-3 h-3 mr-1 inline" />
                      {orderCounts.urgent}件の急ぎの注文
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {/* 検索ボックス */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="番号・商品名で検索"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 py-3 rounded-md border-2 border-gray-300 text-gray-800 text-base w-full sm:w-64 min-h-[48px]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center"
                      >
                        <span className="text-2xl">×</span>
                      </button>
                    )}
                  </div>
                  
                  {/* 緊急フィルター */}
                  <Button
                    size="lg"
                    variant={showOnlyUrgent ? "default" : "outline"}
                    onClick={() => setShowOnlyUrgent(!showOnlyUrgent)}
                    className={`px-6 py-3 text-base min-h-[48px] border-2 ${
                      showOnlyUrgent 
                        ? "bg-red-600 hover:bg-red-700 text-white border-red-600" 
                        : "bg-white text-gray-800 border-gray-300"
                    }`}
                  >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    急ぎ
                  </Button>
                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger className="w-48 bg-white text-gray-800 border-2 border-gray-300 h-12 text-base">
                      <div className="flex items-center">
                        <Filter className="w-4 h-4 mr-1" />
                        <SelectValue placeholder="すべて表示" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての注文</SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          支払い待ち ({orderCounts.pending})
                        </div>
                      </SelectItem>
                      <SelectItem value="paid">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          支払い済み ({orderCounts.paid})
                        </div>
                      </SelectItem>
                      <SelectItem value="ready">
                        <div className="flex items-center">
                          <BowlSteamSpinner size="xs" className="mr-1" />
                          受取可能 ({orderCounts.ready})
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          完了 ({orderCounts.completed})
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setSortNewest(!sortNewest)}
                    className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 px-6 py-3 text-base min-h-[48px]"
                  >
                    {sortNewest ? "新しい順" : "古い順"}
                    <svg className={`ml-1 h-4 w-4 ${sortNewest ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">注文がありません</h3>
                  <p className="text-gray-500">
                    現在、選択されたフィルター条件に一致する注文はありません。フィルターを変更するか、新しい注文をお待ちください。
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <OrderItem 
                      key={order.id}
                      order={order}
                      handleStatusChange={handleStatusChange}
                      updateOrderStatusMutation={updateOrderStatusMutation}
                      setDetailOrder={setDetailOrder}
                      getCustomizationLabel={getCustomizationLabel}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* 注文詳細ダイアログ */}
      <Dialog open={!!detailOrder} onOpenChange={(open: boolean) => !open && setDetailOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {detailOrder && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <span className="text-xl">注文詳細</span>
                  <Badge className={`ml-3 ${getStatusLabelInfo(detailOrder.status as OrderStatus).className}`}>
                    <div className="flex items-center">
                      {statusIcons[detailOrder.status as OrderStatus]}
                      {getStatusLabelInfo(detailOrder.status as OrderStatus).text}
                    </div>
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  注文ID: #{detailOrder.id} | 呼出番号: <span className="font-bold text-[#e80113]">{detailOrder.callNumber}</span> | {new Date(detailOrder.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              
              {/* 呼出番号と受取時間のバナー */}
              <div className="bg-[#fff9dc] p-4 rounded-lg border border-[#e80113] my-4 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4 mb-3 lg:mb-0">
                  <div className="bg-white p-3 rounded-lg shadow-md border border-[#e80113]">
                    <div className="text-xs text-center text-gray-500">呼出番号</div>
                    <div className="text-4xl font-bold text-[#e80113] text-center">{detailOrder.callNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">注文ID: #{detailOrder.id}</div>
                    <div className="text-sm text-gray-600">{new Date(detailOrder.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow border border-[#e80113]">
                  <Calendar className="h-5 w-5 mr-2 text-[#e80113]" />
                  <div>
                    <div className="text-xs text-gray-500">受取予定時間</div>
                    <div className="font-semibold text-[#e80113]">{detailOrder.timeSlot.time}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                {/* ステータス更新パネル */}
                <div>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-[#e80113] text-white py-3 px-4">
                      <CardTitle className="text-sm">ステータス更新</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <RadioGroup
                        value={detailOrder.status}
                        onValueChange={(value: string) => handleStatusChange(detailOrder.id, value)}
                        className="space-y-3"
                      >
                        <div className={`flex items-center space-x-2 p-2 rounded ${detailOrder.status === 'pending' ? 'bg-gray-50 border border-gray-200' : ''}`}>
                          <RadioGroupItem value="pending" id={`detail-pending-${detailOrder.id}`} />
                          <Label htmlFor={`detail-pending-${detailOrder.id}`} className="flex items-center cursor-pointer">
                            <Clock className="w-4 h-4 mr-2 text-gray-600" />
                            支払い待ち
                          </Label>
                        </div>
                        
                        <div className={`flex items-center space-x-2 p-2 rounded ${detailOrder.status === 'paid' ? 'bg-yellow-50 border border-yellow-200' : ''}`}>
                          <RadioGroupItem value="paid" id={`detail-paid-${detailOrder.id}`} />
                          <Label htmlFor={`detail-paid-${detailOrder.id}`} className="flex items-center cursor-pointer">
                            <Clock className="w-4 h-4 mr-2 text-[#e80113]" />
                            支払い済み
                          </Label>
                        </div>
                        
                        <div className={`flex items-center space-x-2 p-2 rounded ${detailOrder.status === 'ready' ? 'bg-green-50 border border-green-200' : ''}`}>
                          <RadioGroupItem value="ready" id={`detail-ready-${detailOrder.id}`} />
                          <Label htmlFor={`detail-ready-${detailOrder.id}`} className="flex items-center cursor-pointer">
                            <BowlSteamSpinner size="xs" className="mr-2 text-green-600" />
                            受取可能
                          </Label>
                        </div>
                        
                        <div className={`flex items-center space-x-2 p-2 rounded ${detailOrder.status === 'completed' ? 'bg-green-50 border border-green-200' : ''}`}>
                          <RadioGroupItem value="completed" id={`detail-completed-${detailOrder.id}`} />
                          <Label htmlFor={`detail-completed-${detailOrder.id}`} className="flex items-center cursor-pointer">
                            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            完了
                          </Label>
                        </div>
                        
                        <div className={`flex items-center space-x-2 p-2 rounded ${detailOrder.status === 'cancelled' ? 'bg-red-50 border border-red-200' : ''}`}>
                          <RadioGroupItem value="cancelled" id={`detail-cancelled-${detailOrder.id}`} />
                          <Label htmlFor={`detail-cancelled-${detailOrder.id}`} className="flex items-center cursor-pointer">
                            <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                            キャンセル
                          </Label>
                        </div>
                        
                        <div className={`flex items-center space-x-2 p-2 rounded ${detailOrder.status === 'refunded' ? 'bg-red-50 border border-red-200' : ''}`}>
                          <RadioGroupItem value="refunded" id={`detail-refunded-${detailOrder.id}`} />
                          <Label htmlFor={`detail-refunded-${detailOrder.id}`} className="flex items-center cursor-pointer">
                            <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                            返金済み
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>
              
                {/* 注文内容テーブル */}
                <div className="lg:col-span-2">
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-[#e80113] text-white py-3 px-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm">注文内容</CardTitle>
                        <span className="font-bold">合計: ¥{detailOrder.total}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {detailOrder.items.map((item: OrderItem, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold">{item.name}</span>
                              <div className="text-right">
                                <span className="text-sm text-gray-500 mr-2">×{item.quantity}</span>
                                <span className="font-semibold text-[#e80113]">¥{item.price * item.quantity}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {item.size && (
                                <span className="text-xs bg-white px-2 py-0.5 rounded-md border border-gray-200">
                                  サイズ: {item.size}
                                </span>
                              )}
                              {item.customizations && item.customizations.map((customization, idx) => (
                                <span key={idx} className="text-xs bg-white px-2 py-0.5 rounded-md border border-gray-200">
                                  {getCustomizationLabel(customization)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="pt-2 flex justify-end mt-4">
                <Button size="lg" onClick={() => setDetailOrder(null)} className="px-6 py-3 text-base min-h-[48px]">閉じる</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}