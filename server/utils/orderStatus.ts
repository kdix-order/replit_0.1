/**
 * 注文ステータス遷移のバリデーションユーティリティ
 */

import type { OrderStatus } from "@shared/schema";

/**
 * 有効なステータス遷移を定義
 * キー: 現在のステータス
 * 値: 遷移可能なステータスの配列
 */
const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // 支払い待ち → 支払い済み、キャンセルのみ可能
  pending: ["paid", "cancelled"],
  
  // 支払い済み → 受取可能、返金のみ可能（支払い待ちには戻せない）
  paid: ["ready", "refunded"],
  
  // 受取可能 → 完了、支払い済み（誤操作時の戻し）、返金のみ可能
  ready: ["completed", "paid", "refunded"],
  
  // 完了 → 受取可能（誤操作時の戻し）のみ可能
  completed: ["ready"],
  
  // キャンセル → 変更不可（最終ステータス）
  cancelled: [],
  
  // 返金済み → 変更不可（最終ステータス）
  refunded: []
};

/**
 * ステータス遷移が有効かどうかをチェック
 * @param currentStatus 現在のステータス
 * @param newStatus 変更しようとしているステータス
 * @returns 遷移が有効な場合true
 */
export function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
}

/**
 * 現在のステータスから遷移可能なステータスの配列を取得
 * @param currentStatus 現在のステータス
 * @returns 遷移可能なステータスの配列
 */
export function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return VALID_STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * ステータスが最終ステータス（変更不可）かどうかをチェック
 * @param status チェックするステータス
 * @returns 最終ステータスの場合true
 */
export function isFinalStatus(status: OrderStatus): boolean {
  return ["cancelled", "refunded"].includes(status);
}

/**
 * ステータス変更が誤操作の戻しかどうかをチェック
 * @param currentStatus 現在のステータス
 * @param newStatus 変更しようとしているステータス
 * @returns 誤操作の戻しの場合true
 */
export function isUndoTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  return (currentStatus === "ready" && newStatus === "paid") || 
         (currentStatus === "completed" && newStatus === "ready");
}

/**
 * ステータス遷移のエラーメッセージを生成
 * @param currentStatus 現在のステータス
 * @param newStatus 変更しようとしているステータス
 * @returns エラーメッセージ
 */
export function getStatusTransitionError(currentStatus: OrderStatus, newStatus: OrderStatus): string {
  if (isFinalStatus(currentStatus)) {
    return `ステータス「${getStatusLabel(currentStatus)}」の注文は変更できません`;
  }
  
  const validStatuses = getValidNextStatuses(currentStatus);
  if (validStatuses.length === 0) {
    return `ステータス「${getStatusLabel(currentStatus)}」からは変更できません`;
  }
  
  return `ステータス「${getStatusLabel(currentStatus)}」からは「${validStatuses.map(getStatusLabel).join('、')}」にのみ変更可能です`;
}

/**
 * ステータスの日本語ラベルを取得
 * @param status ステータス
 * @returns 日本語ラベル
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