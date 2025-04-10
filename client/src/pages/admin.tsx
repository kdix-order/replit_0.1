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
import { RefreshCw, Filter, Clock, AlertCircle, PauseCircle, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { useStoreSettings, useUpdateStoreSettings } from "@/hooks/use-store-settings";
import { Switch } from "@/components/ui/switch";
import { OrderStatusTracker } from "@/components/order-status-tracker";

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  customizations?: string[];
};

type Order = {
  id: number;
  userId: number;
  callNumber: number;
  status: "new" | "preparing" | "completed";
  total: number;
  timeSlot: {
    id: number;
    time: string;
  };
  createdAt: string;
  items: OrderItem[];
};

const statusLabels = {
  new: { text: "受付済み", className: "bg-[#fee10b] text-black", icon: <Clock className="w-4 h-4 mr-1" /> },
  preparing: { text: "準備中", className: "bg-blue-100 text-blue-800", icon: <BowlSteamSpinner size="xs" className="mr-1 text-blue-800" /> },
  completed: { text: "完了", className: "bg-green-100 text-green-800", icon: null }
};

export default function Admin() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortNewest, setSortNewest] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  
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
      setLastRefreshTime(new Date());
      // 更新アニメーションを表示
      setShowRefreshAnimation(true);
      setTimeout(() => setShowRefreshAnimation(false), 2000);
    }
  }, [isLoading, isFetching, orders]);

  // Mutation for status update
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
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
      toast({
        title: `ステータスを「${statusText}」に更新しました`,
        description: `注文 #${variables.id} のステータスが正常に更新されました。`,
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
  const handleStatusChange = (orderId: number, status: string) => {
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
    if (!orders) return { new: 0, preparing: 0, completed: 0, total: 0 };
    
    return orders.reduce((acc: { new: number, preparing: number, completed: number, total: number }, order: Order) => {
      acc[order.status as keyof typeof acc]++;
      acc.total++;
      return acc;
    }, { new: 0, preparing: 0, completed: 0, total: 0 });
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
          <div className="flex justify-center items-center space-x-2">
            <span className="text-sm bg-[#e80113] text-white px-3 py-1 rounded-md">
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
          <div className="text-xs text-gray-600">
            <span className={`transition-opacity duration-300 ${showRefreshAnimation ? 'opacity-100 font-bold text-[#e80113]' : 'opacity-70'}`}>
              最終更新: {lastRefreshTime.toLocaleTimeString()} 
              {showRefreshAnimation && <span className="ml-2 font-bold text-green-600">✓ 更新完了!</span>}
            </span>
            <span className="ml-2 text-gray-500">(1分ごとに自動更新されます)</span>
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
              <div className="flex items-center space-x-2">
                <Switch 
                  id="accepting-orders"
                  checked={isAcceptingOrders}
                  onCheckedChange={async (checked) => {
                    try {
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
                    ? <span className="flex items-center text-green-600"><PlayCircle className="w-4 h-4 mr-1" /> 注文受付中</span> 
                    : <span className="flex items-center text-red-600"><PauseCircle className="w-4 h-4 mr-1" /> 注文停止中</span>
                  }
                </Label>
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

      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">全注文数</p>
              <p className="text-2xl font-bold">{orderCounts.total}</p>
            </div>
            <div className="bg-gray-100 rounded-full p-3">
              <Filter className="w-5 h-5 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">受付済み</p>
              <p className="text-2xl font-bold">{orderCounts.new}</p>
            </div>
            <div className="bg-[#fee10b]/20 rounded-full p-3">
              <Clock className="w-5 h-5 text-[#e80113]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">準備中</p>
              <p className="text-2xl font-bold">{orderCounts.preparing}</p>
            </div>
            <div className="bg-blue-50 rounded-full p-3">
              <BowlSteamSpinner size="xs" className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">完了</p>
              <p className="text-2xl font-bold">{orderCounts.completed}</p>
            </div>
            <div className="bg-green-50 rounded-full p-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Orders management section */}
      <Card className="border-2 border-gray-100 shadow-md overflow-hidden mb-8">
        <CardHeader className="bg-[#e80113] text-white py-4 px-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold">注文管理</CardTitle>
            <div className="flex items-center space-x-2">
              <Select 
                value={filterStatus} 
                onValueChange={(value) => setFilterStatus(value)}
              >
                <SelectTrigger className="bg-white text-gray-900 border-0 w-36 h-8">
                  <SelectValue placeholder="全てのステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全てのステータス</SelectItem>
                  <SelectItem value="new">受付済みのみ</SelectItem>
                  <SelectItem value="preparing">準備中のみ</SelectItem>
                  <SelectItem value="completed">完了のみ</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortNewest(!sortNewest)}
                className="bg-white text-gray-900 border-0 h-8"
              >
                {sortNewest ? "新しい順" : "古い順"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {(!filteredOrders || filteredOrders.length === 0) ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-gray-500">該当する注文はありません</p>
              {filterStatus !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className="mt-4"
                >
                  フィルターをクリア
                </Button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <li key={order.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between flex-wrap md:flex-nowrap gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#e80113] text-white">
                            <span className="text-xl font-bold">{order.callNumber}</span>
                          </span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            注文 #{order.id}
                            <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center ${statusLabels[order.status as keyof typeof statusLabels].className}`}>
                              {statusLabels[order.status as keyof typeof statusLabels].icon}
                              {statusLabels[order.status as keyof typeof statusLabels].text}
                            </span>
                          </h3>
                          <p className="text-sm text-gray-500">
                            注文時刻: {new Date(order.createdAt).toLocaleTimeString()} | 
                            受取時間: <span className="font-medium text-[#e80113]">{order.timeSlot.time}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 ml-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                            <span>注文内容</span>
                            <span className="ml-2 text-xs text-gray-500">({order.items.length}品目)</span>
                          </h4>
                          <div className="text-sm bg-gray-50 p-3 rounded-md">
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {order.items.slice(0, 3).map((item: OrderItem, index: number) => (
                                <div key={index} className="flex justify-between">
                                  <span>{item.name} × {item.quantity}</span>
                                  <span>¥{item.price * item.quantity}</span>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="text-xs text-center text-gray-500 mt-1 pt-1 border-t">
                                  他 {order.items.length - 3} 品目...
                                </div>
                              )}
                            </div>
                            <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-bold">
                              <span>合計</span>
                              <span>¥{order.total}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 w-full text-xs text-gray-500 hover:text-[#e80113]"
                            onClick={() => setDetailOrder(order)}
                          >
                            詳細を表示
                          </Button>
                        </div>
                        
                        <div className="flex flex-col space-y-3">
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-900 mb-2">ステータス更新</h4>
                            <RadioGroup 
                              defaultValue={order.status}
                              onValueChange={(value) => {
                                if (value !== order.status) {
                                  handleStatusChange(order.id, value);
                                }
                              }}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="new" 
                                  id={`new-${order.id}`} 
                                  disabled={updateOrderStatusMutation.isPending}
                                />
                                <Label 
                                  htmlFor={`new-${order.id}`}
                                  className={`flex items-center text-sm cursor-pointer ${order.status === 'new' ? 'font-bold' : ''}`}
                                >
                                  <Clock className="w-3.5 h-3.5 mr-1" />
                                  受付済み
                                </Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="preparing" 
                                  id={`preparing-${order.id}`}
                                  disabled={updateOrderStatusMutation.isPending}
                                />
                                <Label 
                                  htmlFor={`preparing-${order.id}`}
                                  className={`flex items-center text-sm cursor-pointer ${order.status === 'preparing' ? 'font-bold' : ''}`}
                                >
                                  <BowlSteamSpinner size="xs" className="mr-1 text-blue-600" />
                                  準備中
                                </Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="completed" 
                                  id={`completed-${order.id}`}
                                  disabled={updateOrderStatusMutation.isPending}
                                />
                                <Label 
                                  htmlFor={`completed-${order.id}`}
                                  className={`flex items-center text-sm cursor-pointer ${order.status === 'completed' ? 'font-bold' : ''}`}
                                >
                                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  完了
                                </Label>
                              </div>
                            </RadioGroup>
                            {updateOrderStatusMutation.isPending && updateOrderStatusMutation.variables?.id === order.id && (
                              <div className="mt-2 flex items-center justify-center text-xs text-[#e80113]">
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-[#e80113]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                更新中...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      {/* Order details dialog */}
      <Dialog open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#e80113] text-white text-sm mr-2">
                {detailOrder?.callNumber}
              </span>
              注文詳細 #{detailOrder?.id}
            </DialogTitle>
            <div className="flex items-center mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${detailOrder?.status && statusLabels[detailOrder.status as keyof typeof statusLabels].className}`}>
                {detailOrder?.status && statusLabels[detailOrder.status as keyof typeof statusLabels].text}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                注文時刻: {detailOrder && new Date(detailOrder.createdAt).toLocaleString()}
              </span>
            </div>
          </DialogHeader>
          
          {detailOrder && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold mb-2">注文詳細情報</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">注文番号:</div>
                      <div className="font-medium">{detailOrder.id}</div>
                      
                      <div className="text-gray-500">呼出番号:</div>
                      <div className="font-medium">{detailOrder.callNumber}</div>
                      
                      <div className="text-gray-500">受取時間:</div>
                      <div className="font-medium text-[#e80113]">{detailOrder.timeSlot.time}</div>
                      
                      <div className="text-gray-500">注文合計:</div>
                      <div className="font-medium">¥{detailOrder.total}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold mb-2">ステータス管理</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {/* 注文ステータストラッカー */}
                    <div className="mb-4">
                      <OrderStatusTracker status={detailOrder.status} />
                    </div>
                    <RadioGroup 
                      defaultValue={detailOrder.status}
                      onValueChange={(value) => {
                        if (value !== detailOrder.status) {
                          handleStatusChange(detailOrder.id, value);
                          setDetailOrder({...detailOrder, status: value as "new" | "preparing" | "completed"});
                        }
                      }}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id={`detail-new-${detailOrder.id}`} />
                        <Label htmlFor={`detail-new-${detailOrder.id}`} className="flex items-center cursor-pointer">
                          <Clock className="w-4 h-4 mr-2" />
                          受付済み
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="preparing" id={`detail-preparing-${detailOrder.id}`} />
                        <Label htmlFor={`detail-preparing-${detailOrder.id}`} className="flex items-center cursor-pointer">
                          <BowlSteamSpinner size="xs" className="mr-2 text-blue-600" />
                          準備中
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="completed" id={`detail-completed-${detailOrder.id}`} />
                        <Label htmlFor={`detail-completed-${detailOrder.id}`} className="flex items-center cursor-pointer">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          完了
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold mb-2">注文内容</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left pb-2">商品名</th>
                        <th className="text-center pb-2">数量</th>
                        <th className="text-right pb-2">金額</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detailOrder.items.map((item: OrderItem, index: number) => (
                        <tr key={index} className="hover:bg-gray-100">
                          <td className="py-2">
                            <div className="font-medium">{item.name}</div>
                            {item.size && (
                              <div className="text-xs text-gray-500">サイズ: {item.size}</div>
                            )}
                            {item.customizations && item.customizations.length > 0 && (
                              <div className="text-xs text-gray-500">
                                カスタマイズ: {item.customizations.map(c => getCustomizationLabel(c)).join('、')}
                              </div>
                            )}
                          </td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-right">¥{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold">
                        <td className="pt-3 text-left" colSpan={2}>合計</td>
                        <td className="pt-3 text-right">¥{detailOrder.total}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <div className="pt-2 flex justify-end">
                <Button onClick={() => setDetailOrder(null)}>閉じる</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
