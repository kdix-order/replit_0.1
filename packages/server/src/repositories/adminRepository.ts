/**
 * repositories/adminRepository.ts
 * 
 * 管理者機能関連のデータアクセスを担当するリポジトリ
 * IStorageインターフェースをラップして、管理者ドメイン特化のメソッドを提供します。
 */

import type { IStorage } from "@/storage/istorage";
import { Order } from "../models";
import { StoreSettings } from "../models/admin";
import { storage } from "@/storage";

/**
 * 管理者リポジトリクラス
 * データストレージへのアクセスを抽象化し、管理者機能関連の操作を提供します
 */
export class AdminRepository {
  private storage: IStorage;
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * 全ての注文を取得します
   * @returns 注文リスト
   */
  async getOrders(): Promise<Order[]> {
    return this.storage.getOrders();
  }

  /**
   * 特定の注文IDの注文を取得します
   * @param id 注文ID
   * @returns 注文データ、存在しない場合はundefined
   */
  async getOrder(id: string): Promise<Order | undefined> {
    return this.storage.getOrder(id);
  }

  /**
   * 注文のステータスを更新します
   * @param id 注文ID
   * @param status 新しいステータス
   * @returns 更新された注文データ、存在しない場合はundefined
   */
  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    return this.storage.updateOrderStatus(id, status);
  }

  /**
   * 店舗設定を取得します
   * @returns 店舗設定データ
   */
  async getStoreSettings(): Promise<StoreSettings> {
    return this.storage.getStoreSettings();
  }

  /**
   * 店舗設定を更新します
   * @param acceptingOrders 注文受付状態
   * @returns 更新された店舗設定データ
   */
  async updateStoreSettings(acceptingOrders: boolean): Promise<StoreSettings> {
    return this.storage.updateStoreSettings(acceptingOrders);
  }
}

export const adminRepository = new AdminRepository(storage);
