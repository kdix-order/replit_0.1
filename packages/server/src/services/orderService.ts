/**
 * services/orderService.ts
 * 
 * 注文関連のビジネスロジックを担当するサービス
 * リポジトリ層を利用してデータアクセスを行い、ビジネスルールを適用します。
 */

import { orderRepository } from "../repositories/orderRepository";
import { cartRepository } from "../repositories/cartRepository";
import { 
  Order, 
  OrderWithTimeSlot,
  CartItemWithProduct
} from "../../../shared/schema";
import { transformCallNumber } from "@/utils/callNumber";

/**
 * 注文サービスクラス
 * 注文関連のビジネスロジックを提供します
 */
export class OrderService {
  /**
   * 新しい注文を作成します
   * @param userId ユーザーID
   * @param timeSlotId タイムスロットID
   * @returns 作成された注文
   * @throws タイムスロットが存在しない、または満席の場合
   */
  async createOrder(userId: string, timeSlotId: string): Promise<Order> {
    const cartItems = await cartRepository.getCartItems(userId);
    
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }
    
    const timeSlot = await orderRepository.getTimeSlot(timeSlotId);
    
    if (!timeSlot) {
      throw new Error("Time slot not found");
    }
    
    if (timeSlot.available <= 0) {
      throw new Error("Time slot is full");
    }
    
    const total = this.calculateTotal(cartItems);
    
    const order = await orderRepository.createOrder({
      userId,
      status: "new",
      total,
      timeSlotId,
      items: this.formatOrderItems(cartItems)
    });
    
    await cartRepository.clearCart(userId);
    
    return order;
  }
  
  /**
   * 合計金額を計算します
   * @param cartItems カートアイテム
   * @returns 合計金額
   */
  private calculateTotal(cartItems: CartItemWithProduct[]): number {
    return cartItems.reduce((sum, item) => {
      return sum + (item.quantity * item.product.price);
    }, 0);
  }
  
  /**
   * カートアイテムを注文アイテム形式に変換します
   * @param cartItems カートアイテム
   * @returns 注文アイテム
   */
  private formatOrderItems(cartItems: CartItemWithProduct[]): any[] {
    return cartItems.map(item => ({
      id: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      customizations: item.customizations
    }));
  }
  
  /**
   * ユーザーの全注文を取得します
   * @param userId ユーザーID
   * @returns 注文リスト
   */
  async getOrdersByUser(userId: string): Promise<OrderWithTimeSlot[]> {
    return orderRepository.getOrdersByUser(userId);
  }
  
  /**
   * 特定の注文を取得します
   * @param orderId 注文ID
   * @param userId ユーザーID
   * @returns 注文データ
   * @throws 注文が存在しない場合
   */
  async getOrderById(orderId: string, userId: string): Promise<OrderWithTimeSlot> {
    const userOrders = await orderRepository.getOrdersByUser(userId);
    const order = userOrders.find(o => o.id === orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    return order;
  }
  
  /**
   * 注文のステータスを更新します
   * @param orderId 注文ID
   * @param status 新しいステータス
   * @returns 更新された注文
   * @throws 注文が存在しない場合
   */
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const updatedOrder = await orderRepository.updateOrderStatus(orderId, status);
    
    if (!updatedOrder) {
      throw new Error("Order not found");
    }
    
    return updatedOrder;
  }
  
  /**
   * 表示用の注文番号を生成します
   * @param dbCallNumber データベースの連番
   * @returns 表示用の注文番号（201-300の範囲）
   */
  formatCallNumber(dbCallNumber: number): number {
    return transformCallNumber(dbCallNumber);
  }
}

export const orderService = new OrderService();
