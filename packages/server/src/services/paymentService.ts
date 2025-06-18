/**
 * services/paymentService.ts
 * 
 * PayPay決済関連のビジネスロジックを担当するサービス
 * PayPay APIとの連携、支払い状況の管理を行います。
 */

import { createPayment, getPaymentDetails } from "../paypay";
import { storage } from "@/storage";
import { Order } from "../../../shared/schema";

/**
 * 決済サービスクラス
 * PayPay決済関連のビジネスロジックを提供します
 */
export class PaymentService {
  /**
   * PayPay決済を作成します
   * @param orderId 注文ID
   * @param origin リクエスト元のOrigin
   * @returns PayPay決済情報
   * @throws 注文が存在しない場合
   */
  async createPayPayPayment(orderId: string, origin?: string) {
    const order = await storage.getOrder(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const description = `味店焼マン注文 #${order.callNumber}`;
    return await createPayment(orderId, order.total, description, origin);
  }

  /**
   * PayPay決済の状況を取得します
   * @param merchantPaymentId マーチャント決済ID
   * @returns 決済情報
   */
  async getPaymentStatus(merchantPaymentId: string) {
    return await getPaymentDetails(merchantPaymentId);
  }

  /**
   * PayPay決済完了処理を行います
   * @param merchantPaymentId マーチャント決済ID
   * @returns 処理結果
   * @throws 注文が存在しない、または決済が完了していない場合
   */
  async completePayment(merchantPaymentId: string): Promise<{ order: Order; redirectUrl: string }> {
    const response = await getPaymentDetails(merchantPaymentId);

    if ((response as any).BODY.data.status !== "COMPLETED") {
      throw new Error("Payment not completed");
    }

    // 支払い完了時の処理
    const order = await storage.updateOrderStatus(merchantPaymentId, "paid");
    if (!order) {
      throw new Error("Order not found");
    }

    // Clear cart
    await storage.clearCart(order.userId);

    return {
      order,
      redirectUrl: `/pickup/${order.id}`
    };
  }
}

export const paymentService = new PaymentService();