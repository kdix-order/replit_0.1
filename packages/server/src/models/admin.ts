/**
 * models/admin.ts
 * 
 * 管理者機能関連の型定義
 * 管理者機能で使用する拡張型を定義します。
 */

import { Feedback, Order, StoreSetting } from "./index";

/**
 * 詳細情報付きフィードバック型
 * フィードバックに注文情報とユーザー名を付加した型
 */
export interface FeedbackWithDetails extends Feedback {
  orderDetails: {
    id: string;
    callNumber: number;
    status: string;
    total: number;
    createdAt: string;
  } | null;
  userName: string;
}

/**
 * 詳細情報付き注文型
 * 注文に時間枠情報を付加した型
 */
export interface OrderWithDetails extends Order {
  timeSlot?: {
    id: string;
    time: string;
    capacity: number;
    available: number;
  };
}

/**
 * 店舗設定型
 * StoreSetting型のエイリアス
 */
export type StoreSettings = StoreSetting;
