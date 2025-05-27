/**
 * repositories/orderRepository.ts
 * 
 * 注文関連のデータアクセスを担当するリポジトリ
 * IStorageインターフェースをラップして、注文ドメイン特化のメソッドを提供します。
 */

import { storage } from "../../storage";
import type { IStorage } from "../../storage/istorage";
import { 
  InsertOrder, 
  Order, 
  OrderWithTimeSlot, 
  TimeSlot 
} from "../models";

/**
 * 注文リポジトリクラス
 * データストレージへのアクセスを抽象化し、注文関連の操作を提供します
 */
export class OrderRepository {
  private storage: IStorage;
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }
  /**
   * 新しい注文を作成します
   * @param order 作成する注文データ
   * @returns 作成された注文
   */
  async createOrder(order: InsertOrder): Promise<Order> {
    return this.storage.createOrder(order);
  }

  /**
   * 特定のユーザーの全注文を取得します
   * @param userId ユーザーID
   * @returns ユーザーの注文リスト
   */
  async getOrdersByUser(userId: string): Promise<OrderWithTimeSlot[]> {
    return this.storage.getOrdersByUser(userId);
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
   * @returns 更新された注文、存在しない場合はundefined
   */
  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    return this.storage.updateOrderStatus(id, status);
  }

  /**
   * 特定のタイムスロットを取得します
   * @param id タイムスロットID
   * @returns タイムスロットデータ、存在しない場合はundefined
   */
  async getTimeSlot(id: string): Promise<TimeSlot | undefined> {
    return this.storage.getTimeSlot(id);
  }

  /**
   * 全ての注文を取得します
   * @returns 全注文リスト
   */
  async getAllOrders(): Promise<OrderWithTimeSlot[]> {
    return this.storage.getOrders();
  }
}

export const orderRepository = new OrderRepository(storage as IStorage);
