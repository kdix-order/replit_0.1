/**
 * repositories/adminRepository.ts
 * 
 * 管理者機能関連のデータアクセスを担当するリポジトリ
 * IStorageインターフェースをラップして、管理者ドメイン特化のメソッドを提供します。
 */

import type { IStorage } from "../../storage/istorage";
import { Order, Feedback } from "../models";
import { StoreSettings, FeedbackWithDetails } from "../models/admin";
import { storage } from "../../storage";

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

  /**
   * 全てのフィードバックを取得します
   * @returns フィードバックリスト
   */
  async getAllFeedback(): Promise<Feedback[]> {
    return this.storage.getAllFeedback();
  }

  /**
   * フィードバックに詳細情報を付加します
   * @param feedback フィードバックデータ
   * @returns 詳細情報付きフィードバックデータ
   */
  async enrichFeedbackWithDetails(feedback: Feedback): Promise<FeedbackWithDetails> {
    let orderDetails = null;
    let userName = 'Unknown user';

    if (feedback.orderId) {
      const order = await this.storage.getOrder(feedback.orderId);
      if (order) {
        orderDetails = {
          id: order.id,
          callNumber: order.callNumber,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt ? order.createdAt.toString() : ''
        };
      }
    }

    const user = await this.storage.getUser(feedback.userId);
    if (user) {
      userName = user.username || user.email;
    }

    return {
      ...feedback,
      orderDetails,
      userName
    };
  }
}

export const adminRepository = new AdminRepository(storage);
