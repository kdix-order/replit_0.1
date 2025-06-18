/**
 * services/admin/AdminService.ts
 * 
 * 管理者機能関連のビジネスロジックを担当するサービス
 * リポジトリ層を利用してデータアクセスを行い、ビジネスルールを適用します。
 */

import { adminRepository } from "../../repositories/adminRepository";
import { Order } from "../../models";
import { StoreSettings } from "../../models/admin";

/**
 * 管理者サービスクラス
 * 管理者機能関連のビジネスロジックを提供します
 */
export class AdminService {
  /**
   * 全ての注文を取得します
   * @returns 注文リスト
   */
  async getOrders(): Promise<Order[]> {
    return adminRepository.getOrders();
  }

  /**
   * 注文のステータスを更新します
   * @param id 注文ID
   * @param status 新しいステータス
   * @returns 更新された注文データ
   * @throws 注文が存在しない場合、または無効なステータスの場合
   */
  async updateOrderStatus(id: string, status: string): Promise<Order> {
    if (!["new", "preparing", "completed"].includes(status)) {
      throw new Error("無効なステータスです。有効な値: 'new', 'preparing', 'completed'");
    }
    
    const existingOrder = await adminRepository.getOrder(id);
    if (!existingOrder) {
      throw new Error(`注文ID: ${id} は見つかりませんでした`);
    }
    
    const updatedOrder = await adminRepository.updateOrderStatus(id, status);
    
    if (!updatedOrder) {
      throw new Error("ステータス更新に失敗しました");
    }
    
    return updatedOrder;
  }

  /**
   * 店舗設定を取得します
   * @returns 店舗設定データ
   */
  async getStoreSettings(): Promise<StoreSettings> {
    return adminRepository.getStoreSettings();
  }

  /**
   * 店舗設定を更新します
   * @param acceptingOrders 注文受付状態
   * @returns 更新された店舗設定データ
   * @throws 無効なパラメータの場合
   */
  async updateStoreSettings(acceptingOrders: boolean): Promise<StoreSettings> {
    if (typeof acceptingOrders !== 'boolean') {
      throw new Error("acceptingOrdersはブール値である必要があります");
    }
    
    return adminRepository.updateStoreSettings(acceptingOrders);
  }
}

export const adminService = new AdminService();
