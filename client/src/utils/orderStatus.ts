/**
 * 注文ステータス遷移のクライアント側ユーティリティ
 */

import type { OrderStatus } from "@shared/schema";

/**
 * 有効なステータス遷移を定義
 */
const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["ready", "refunded"],
  ready: ["completed", "paid", "refunded"],
  completed: ["ready"],
  cancelled: [],
  refunded: []
};

/**
 * 現在のステータスから遷移可能なステータスの配列を取得
 */
export function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return VALID_STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * ステータスが最終ステータス（変更不可）かどうかをチェック
 */
export function isFinalStatus(status: OrderStatus): boolean {
  return ["cancelled", "refunded"].includes(status);
}

/**
 * ステータス変更が誤操作の戻しかどうかをチェック
 */
export function isUndoTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  return (currentStatus === "ready" && newStatus === "paid") || 
         (currentStatus === "completed" && newStatus === "ready");
}

/**
 * ステータスの日本語ラベルを取得
 */
export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: "支払い待ち",
    paid: "支払い済み",
    ready: "受取可能",
    completed: "完了",
    cancelled: "キャンセル",
    refunded: "返金済み"
  };
  return labels[status] || status;
}

/**
 * ステータスごとのアイコンカラーを取得
 */
export function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: "text-gray-600",
    paid: "text-yellow-600",
    ready: "text-green-600",
    completed: "text-green-600",
    cancelled: "text-red-600",
    refunded: "text-red-600"
  };
  return colors[status] || "text-gray-600";
}

/**
 * ステータスごとの背景色クラスを取得
 */
export function getStatusBgClass(status: OrderStatus): string {
  const bgClasses: Record<OrderStatus, string> = {
    pending: "bg-gray-50 border border-gray-200",
    paid: "bg-yellow-50 border border-yellow-200",
    ready: "bg-green-50 border border-green-200",
    completed: "bg-green-50 border border-green-200",
    cancelled: "bg-red-50 border border-red-200",
    refunded: "bg-red-50 border border-red-200"
  };
  return bgClasses[status] || "bg-gray-50 border border-gray-200";
}

/**
 * ステータスラベルの詳細情報を取得（テキスト、クラス名、アイコン）
 */
export function getStatusLabelInfo(status: OrderStatus): {
  text: string;
  className: string;
  icon?: JSX.Element | null;
} {
  const labels: Record<OrderStatus, { text: string; className: string }> = {
    pending: { text: "支払い待ち", className: "bg-gray-100 text-gray-800" },
    paid: { text: "支払い済み", className: "bg-[#fee10b] text-black" },
    ready: { text: "受取可能", className: "bg-green-100 text-green-800" },
    completed: { text: "完了", className: "bg-green-100 text-green-800" },
    cancelled: { text: "キャンセル", className: "bg-red-100 text-red-800" },
    refunded: { text: "返金済み", className: "bg-red-100 text-red-800" }
  };
  
  return {
    text: labels[status]?.text || status,
    className: labels[status]?.className || "bg-gray-100 text-gray-800",
    icon: null // アイコンは使用する側で設定
  };
}