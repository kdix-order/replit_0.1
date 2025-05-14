/**
 * 管理者ページ
 * 注文の管理、ステータスの更新、および店舗設定を制御する管理画面を提供します
 */
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getCustomizationLabel } from "@/lib/utils";
import { BowlSteamSpinner } from "@/components/ui/food-spinner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, Clock, AlertCircle, PauseCircle, PlayCircle, MessageSquare, ThumbsUp, ThumbsDown, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { useStoreSettings, useUpdateStoreSettings } from "@/hooks/use-store-settings";
import { useFeedback } from "@/hooks/use-feedback";
import { Switch } from "@/components/ui/switch";
import { OrderStatusTracker } from "@/components/order-status-tracker";
import { PayPayRefundDialog } from "@/components/paypay-refund-dialog";

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
  status: "new" | "preparing" | "completed" | "refunded";
  total: number;
  timeSlot: {
    id: string;
    time: string;
  };
  createdAt: string;
  items: OrderItem[];
};

const statusLabels = {
  new: { text: "受付済み", className: "bg-[#fee10b] text-black", icon: <Clock className="w-4 h-4 mr-1" /> },
  paid: { text: "支払い済み", className: "bg-[#fee10b] text-black", icon: <Clock className="w-4 h-4 mr-1" /> },
  preparing: { text: "準備中", className: "bg-blue-100 text-blue-800", icon: <BowlSteamSpinner size="xs" className="mr-1 text-blue-800" /> },
  completed: { text: "完了", className: "bg-green-100 text-green-800", icon: null },
  refunded: { text: "返金済み", className: "bg-gray-100 text-gray-800", icon: <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg> }
};

/**
 * 注文アイテムコンポーネント
 * 各注文の表示と詳細の展開/折りたたみ機能を提供します
 */
function OrderItem({ 
  order, 
  handleStatusChange, 
  updateOrderStatusMutation, 
  setDetailOrder, 
  statusLabels,
  getCustomizationLabel
}: { 
  order: Order; 
  handleStatusChange: (orderId: string, status: string) => void;
  updateOrderStatusMutation: any;
  setDetailOrder: (order: Order | null) => void;
  statusLabels: any;
  getCustomizationLabel: (customization: string) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div 
      className={`hover:bg-gray-50 transition-colors ${order.status === 'new' ? 'bg-yellow-50' : order.status === 'preparing' ? 'bg-blue-50' : ''}`}
    >
      {/* 注文概要セクション（常に表示） */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* 左側: 呼出番号 */}
          <div className="flex-shrink-0 w-1/3 md:w-1/5">
            <div className="bg-[#fff9dc] px-3 py-2 rounded-lg border border-[#e80113] shadow-sm flex flex-col items-center justify-center">
              <div className="text-xs text-gray-600">呼出番号</div>
              <div className="font-bold text-3xl text-[#e80113]">{order.callNumber}</div>
            </div>
          </div>
          
          {/* 中央: 注文内容の概要 */}
          <div className="flex-grow px-3">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">注文内容 <span className="text-[#e80113]">¥{order.total}</span></span>
                <Badge className={statusLabels[order.status].className}>
                  <div className="flex items-center">
                    {statusLabels[order.status].icon}
                    {statusLabels[order.status].text}
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
          <div className="mb-3 bg-gray-50 p-2 rounded flex flex-wrap gap-2 md:gap-4 text-sm">
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">注文ID:</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-500" />
              <span className="text-gray-700">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          {/* 進捗ステータストラッカー - 返金済み以外の場合のみ表示 */}
          {order.status !== 'refunded' && (
            <div className="mb-4">
              <OrderStatusTracker status={order.status as "new" | "paid" | "preparing" | "completed"} />
            </div>
          )}
          {/* 返金済みの場合のメッセージ */}
          {order.status === 'refunded' && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <p className="text-lg font-medium text-gray-700">この注文は返金処理が完了しています</p>
            </div>
          )}
          
          {/* 注文内容詳細 */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="font-medium mb-2 text-gray-700">注文内容</h4>
            <div className="space-y-2">
              {order.items.map((item: OrderItem, index: number) => (
                <div key={index} className="bg-white p-2 rounded-md border border-gray-100">
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
              size="sm" 
              variant="outline"
              onClick={() => setDetailOrder(order)}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              詳細ダイアログを開く
            </Button>
            
            <Select
              value={order.status}
              onValueChange={(value) => handleStatusChange(order.id, value)}
              disabled={updateOrderStatusMutation.isPending}
            >
              <SelectTrigger className={`w-36 h-9 
                ${order.status === 'new' ? 'bg-[#fee10b] text-black border-[#e80113]' : 
                order.status === 'preparing' ? 'bg-blue-100 text-blue-800 border-blue-300' : 
                'bg-green-100 text-green-800 border-green-300'}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new" className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 inline" /> 受付済み
                </SelectItem>
                <SelectItem value="preparing" className="flex items-center">
                  <BowlSteamSpinner size="xs" className="mr-1 inline" /> 準備中
                </SelectItem>
                <SelectItem value="completed" className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg> 完了
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * フィードバックタブコンポーネント
 * 顧客からのフィードバック一覧を表示します
 */
function FeedbackTab() {
  const { getAdminFeedback, adminFeedback, isLoadingAdminFeedback } = useFeedback();
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);

  // フィードバック一覧を取得
  useEffect(() => {
    getAdminFeedback();
  }, [getAdminFeedback]);

  if (isLoadingAdminFeedback) {
    return (
      <div className="text-center py-10">
        <BowlSteamSpinner size="lg" className="mx-auto text-[#e80113] mb-4" />
        <p className="text-gray-500">フィードバック情報を読み込んでいます...</p>
      </div>
    );
  }

  return (
    <Card className="border-2 border-gray-100 shadow-md overflow-hidden mb-8">
      <CardHeader className="bg-[#e80113] text-white py-4 px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">顧客フィードバック</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {adminFeedback.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">フィードバックはありません</h3>
            <p className="text-gray-500">まだ顧客からのフィードバックはありません。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {adminFeedback.map((feedback) => (
              <div 
                key={feedback.id} 
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className={`rounded-full p-2 mr-3 ${
                      feedback.sentiment === "positive" 
                        ? "bg-green-100 text-green-600" 
                        : "bg-red-100 text-red-600"
                    }`}>
                      {feedback.sentiment === "positive" 
                        ? <ThumbsUp className="h-4 w-4" /> 
                        : <ThumbsDown className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-gray-900">{feedback.userName}</h3>
                        {feedback.rating && (
                          <div className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {feedback.rating === 4 && "とても良い (4点)"}
                            {feedback.rating === 3 && "良い (3点)"}
                            {feedback.rating === 2 && "普通 (2点)"}
                            {feedback.rating === 1 && "改善が必要 (1点)"}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {feedback.orderDetails && (
                    <div className="flex items-center bg-[#fee10b]/10 px-3 py-1 rounded-full text-xs">
                      <span className="text-gray-700 mr-1">呼出番号:</span>
                      <span className="font-bold text-[#e80113]">{feedback.orderDetails.callNumber}</span>
                    </div>
                  )}
                </div>
                
                {feedback.comment && (
                  <div className="bg-gray-50 p-3 rounded-md mt-3 text-sm">
                    {feedback.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
  const [showRefundDialog, setShowRefundDialog] = useState<boolean>(false);
  
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
      try {
        const response = await apiRequest("PATCH", `/api/admin/orders/${id}`, { status });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "ステータス更新に失敗しました");
        }
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      
      // Show success message specific to the status change
      const statusText = statusLabels[variables.status as keyof typeof statusLabels].text;
      const order = orders?.find(o => o.id === variables.id);
      const callNumber = order ? order.callNumber : variables.id;
      
      // 通知を表示
      toast({
        title: `ステータスを「${statusText}」に更新しました`,
        description: `呼出番号 ${callNumber} の注文のステータスが正常に更新されました。`,
      });
    },
    onError: (error: any) => {
      console.error("Status update error:", error);
      toast({
        title: "エラーが発生しました",
        description: error.message || "ステータスの更新に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
  });

  // Handler for status change
  const handleStatusChange = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ id: orderId, status });
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let result = [...orders];
    
    // Apply status filter
    if (filterStatus && filterStatus !== 'all') {
      result = result.filter((order: Order) => order.status === filterStatus);
    }
    
    // Apply sorting
    result.sort((a: Order, b: Order) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortNewest ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [orders, filterStatus, sortNewest]);

  // Count orders by status
  const orderCounts = useMemo(() => {
    if (!orders) return { new: 0, preparing: 0, completed: 0, refunded: 0, total: 0 };
    
    return orders.reduce((acc: { new: number, preparing: number, completed: number, refunded: number, total: number }, order: Order) => {
      acc[order.status as keyof typeof acc]++;
      acc.total++;
      return acc;
    }, { new: 0, preparing: 0, completed: 0, refunded: 0, total: 0 });
  }, [orders]);

  // Redirect if not admin
  if (!isAuthenticated || !isAdmin) {
    setLocation("/");
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
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
      <div className="text-center mb-6 bg-[#fee10b] py-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-black mb-2">味店焼マン - 管理画面</h1>
        <div className="flex justify-center">
          <hr className="w-20 border-[#e80113] border-t-2 mb-3" />
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex flex-wrap justify-center items-center gap-2">
            <span className="text-sm bg-[#e80113] text-white px-3 py-1 rounded-md flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              現在の時刻: {currentTime.toLocaleTimeString()}
            </span>
            
            <Button
              size="sm"
              onClick={() => {
                refetch();
                setShowRefreshAnimation(true);
                setTimeout(() => setShowRefreshAnimation(false), 2000);
              }}
              className="bg-white text-[#e80113] border border-[#e80113] hover:bg-[#e80113] hover:text-white"
              disabled={isFetching}
            >
              <RefreshCw className={`mr-1 h-4 w-4 ${isFetching || showRefreshAnimation ? 'animate-spin' : ''}`} />
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
                    onCheckedChange={async (checked) => {
                      try {
                        console.log(`Request to change accepting orders to: ${checked}`);
                        await updateStoreSettings(checked);
                        await refetchStoreSettings();
                        toast({
                          title: checked ? "注文受付を再開しました" : "注文受付を停止しました",
                          description: checked 
                            ? "お客様からの新規注文を受け付けます。" 
                            : "お客様からの新規注文を停止しました。既存の注文は処理されます。",
                        });
                      } catch (error) {
                        console.error("Store settings update error:", error);
                        toast({
                          title: "エラーが発生しました",
                          description: "設定の更新に失敗しました。もう一度お試しください。",
                          variant: "destructive",
                        });
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
                    size="sm" 
                    onClick={async () => {
                      try {
                        await updateStoreSettings(true);
                        await refetchStoreSettings();
                        toast({
                          title: "注文受付を再開しました",
                          description: "お客様からの新規注文を受け付けます。",
                        });
                      } catch (error) {
                        console.error("Error enabling order acceptance:", error);
                        toast({
                          title: "エラーが発生しました",
                          description: "設定の更新に失敗しました。",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="mr-2 bg-green-600 hover:bg-green-700 text-white"
                    disabled={isAcceptingOrders}
                  >
                    <PlayCircle className="w-4 h-4 mr-1" /> 受付開始
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={async () => {
                      try {
                        await updateStoreSettings(false);
                        await refetchStoreSettings();
                        toast({
                          title: "注文受付を停止しました",
                          description: "お客様からの新規注文を停止しました。既存の注文は処理されます。",
                        });
                      } catch (error) {
                        console.error("Error disabling order acceptance:", error);
                        toast({
                          title: "エラーが発生しました",
                          description: "設定の更新に失敗しました。",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={!isAcceptingOrders}
                  >
                    <PauseCircle className="w-4 h-4 mr-1" /> 受付停止
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

      {/* Orders & Feedback tabs */}
      <Tabs defaultValue="orders" className="mb-8">
        <TabsList className="w-full bg-gray-100 p-0.5 mb-6">
          <TabsTrigger 
            value="orders" 
            className="flex-1 py-3 bg-white data-[state=active]:bg-[#e80113] data-[state=active]:text-white rounded-md"
          >
            <div className="flex items-center justify-center">
              注文管理
              <Badge className="ml-2 bg-gray-100 text-black">{orderCounts.total}</Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="feedback" 
            className="flex-1 py-3 bg-white data-[state=active]:bg-[#e80113] data-[state=active]:text-white rounded-md"
          >
            <div className="flex items-center justify-center">
              フィードバック
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <Card className="border-2 border-gray-100 shadow-md overflow-hidden">
            <CardHeader className="bg-[#e80113] text-white py-4 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">注文一覧</CardTitle>
                <div className="flex space-x-2">
                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger className="w-40 bg-white text-gray-800 border-none">
                      <div className="flex items-center">
                        <Filter className="w-4 h-4 mr-1" />
                        <SelectValue placeholder="すべて表示" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての注文</SelectItem>
                      <SelectItem value="new">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          受付済み ({orderCounts.new})
                        </div>
                      </SelectItem>
                      <SelectItem value="preparing">
                        <div className="flex items-center">
                          <BowlSteamSpinner size="xs" className="mr-1" />
                          準備中 ({orderCounts.preparing})
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
                      <SelectItem value="refunded">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          返金済み ({orderCounts.refunded})
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSortNewest(!sortNewest)}
                    className="bg-white hover:bg-gray-50 text-gray-800 border-none"
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
                      statusLabels={statusLabels}
                      getCustomizationLabel={getCustomizationLabel}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 顧客フィードバックタブ */}
        <TabsContent value="feedback">
          <FeedbackTab />
        </TabsContent>
      </Tabs>
      
      {/* 注文詳細ダイアログ */}
      <Dialog open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="max-w-3xl">
          {detailOrder && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <span className="text-xl">注文詳細</span>
                  <Badge className={`ml-3 ${statusLabels[detailOrder.status].className}`}>
                    <div className="flex items-center">
                      {statusLabels[detailOrder.status].icon}
                      {statusLabels[detailOrder.status].text}
                    </div>
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  注文ID: #{detailOrder.id} | 呼出番号: <span className="font-bold text-[#e80113]">{detailOrder.callNumber}</span> | {new Date(detailOrder.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              
              {/* 呼出番号と受取時間のバナー */}
              <div className="bg-[#fff9dc] p-4 rounded-lg border border-[#e80113] my-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4 mb-3 md:mb-0">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* ステータス更新パネル */}
                <div>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-[#e80113] text-white py-3 px-4">
                      <CardTitle className="text-sm">ステータス更新</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <RadioGroup
                        value={detailOrder.status}
                        onValueChange={(value) => handleStatusChange(detailOrder.id, value)}
                        className="space-y-3"
                      >
                        <div className={`flex items-center space-x-2 p-2 rounded ${detailOrder.status === 'new' ? 'bg-yellow-50 border border-yellow-200' : ''}`}>
                          <RadioGroupItem value="new" id={`detail-new-${detailOrder.id}`} />
                          <Label htmlFor={`detail-new-${detailOrder.id}`} className="flex items-center cursor-pointer">
                            <Clock className="w-4 h-4 mr-2 text-[#e80113]" />
                            受付済み
                          </Label>
                        </div>
                        
                        <div className={`flex items-center space-x-2 p-2 rounded ${detailOrder.status === 'preparing' ? 'bg-blue-50 border border-blue-200' : ''}`}>
                          <RadioGroupItem value="preparing" id={`detail-preparing-${detailOrder.id}`} />
                          <Label htmlFor={`detail-preparing-${detailOrder.id}`} className="flex items-center cursor-pointer">
                            <BowlSteamSpinner size="xs" className="mr-2 text-blue-600" />
                            準備中
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
                        
                        <div className={`flex items-center space-x-2 p-2 rounded ${detailOrder.status === 'refunded' ? 'bg-gray-50 border border-gray-200' : ''}`}>
                          <RadioGroupItem value="refunded" id={`detail-refunded-${detailOrder.id}`} disabled />
                          <Label htmlFor={`detail-refunded-${detailOrder.id}`} className="flex items-center cursor-not-allowed text-gray-500">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            返金済み
                            <span className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">返金処理後のみ</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>
              
                {/* 注文内容テーブル */}
                <div className="md:col-span-2">
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
              
              <div className="pt-2 flex justify-between mt-4">
                {detailOrder.status === 'completed' && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowRefundDialog(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    返金処理
                  </Button>
                )}
                <Button onClick={() => setDetailOrder(null)} className={detailOrder.status === 'completed' ? 'ml-auto' : ''}>閉じる</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PayPay返金ダイアログ */}
      {detailOrder && (
        <PayPayRefundDialog
          isOpen={showRefundDialog}
          onClose={() => setShowRefundDialog(false)}
          orderId={detailOrder.id}
          amount={detailOrder.total}
        />
      )}
    </div>
  );
}
