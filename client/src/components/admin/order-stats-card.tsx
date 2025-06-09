import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, Package, CheckCircle, XCircle } from "lucide-react";
import { useMemo } from "react";

interface OrderStats {
  pending: number;
  paid: number;
  ready: number;
  completed: number;
  cancelled: number;
  refunded: number;
  total: number;
  urgent: number;
}

interface OrderStatsCardProps {
  orders: any[];
  orderCounts: OrderStats;
}

export function OrderStatsCard({ orders, orderCounts }: OrderStatsCardProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayOrders = orders.filter(order => new Date(order.createdAt) >= todayStart);
    
    const avgWaitTime = orders
      .filter(o => o.status === 'paid' || o.status === 'ready')
      .reduce((acc, order) => {
        const wait = (now.getTime() - new Date(order.createdAt).getTime()) / 1000 / 60;
        return acc + wait;
      }, 0) / (orderCounts.paid + orderCounts.ready || 1);
    
    const completionRate = orderCounts.total > 0 
      ? ((orderCounts.completed / orderCounts.total) * 100).toFixed(1)
      : "0";
    
    return {
      todayTotal: todayOrders.length,
      avgWaitTime: Math.round(avgWaitTime),
      completionRate,
      revenue: todayOrders.reduce((sum, order) => sum + order.total, 0)
    };
  }, [orders, orderCounts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">本日の注文数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayTotal}件</div>
          <p className="text-xs text-gray-500 mt-1">
            処理中: {orderCounts.paid + orderCounts.ready}件
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">平均待ち時間</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            <Clock className="w-5 h-5 mr-1" />
            {stats.avgWaitTime}分
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {orderCounts.urgent > 0 && <span className="text-red-600">緊急: {orderCounts.urgent}件</span>}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">完了率</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            {stats.completionRate}%
            {parseFloat(stats.completionRate) > 80 ? (
              <TrendingUp className="w-5 h-5 ml-1 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 ml-1 text-red-600" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            完了: {orderCounts.completed}件
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">本日の売上</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">¥{stats.revenue.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">
            {orderCounts.refunded > 0 && <span className="text-red-600">返金: {orderCounts.refunded}件</span>}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}