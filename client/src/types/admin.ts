/**
 * 管理画面で使用する型定義
 */

import type { OrderStatus } from "@/utils/orderStatus";

// 注文アイテムの型
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  customizations?: string[];
}

// 注文の型
export interface Order {
  id: string;
  userId: string;
  callNumber: number;
  status: OrderStatus;
  total: number;
  timeSlot: {
    id: string;
    time: string;
  };
  createdAt: string;
  items: OrderItem[];
}

// 注文数カウントの型
export interface OrderCounts {
  pending: number;
  paid: number;
  ready: number;
  completed: number;
  cancelled: number;
  refunded: number;
  total: number;
  urgent: number;
}

// フィルターオプションの型
export interface FilterOptions {
  status: string;
  sortNewest: boolean;
  searchQuery: string;
  showOnlyUrgent: boolean;
}

// 注文アイテムコンポーネントのプロパティ
export interface OrderItemProps {
  order: Order;
  handleStatusChange: (orderId: string, status: string) => void;
  updateOrderStatusMutation: any; // UseMutationResult型
  setDetailOrder: (order: Order | null) => void;
  getCustomizationLabel: (customization: string) => string;
}

// ステータスアイコンの型
export type StatusIconMap = Record<OrderStatus, JSX.Element | null>;