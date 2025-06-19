/**
 * services/paymentService.ts
 * 
 * PayPay決済関連のビジネスロジックを担当するサービス
 * PayPay APIとの連携、支払い状況の管理を行います。
 */

import { createPayment, getPaymentDetails } from "../paypay";
import { storage } from "@/storage";
import { Order } from "../../../shared/schema";
import { smaregiService } from "./smaregiService";

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

    // レシートを印刷
    try {
      await this.printReceipt(order);
    } catch (error) {
      console.error('Receipt printing failed:', error);
      // レシート印刷の失敗は致命的エラーではないため、処理を続行
    }

    return {
      order,
      redirectUrl: `/pickup/${order.id}`
    };
  }

  /**
   * Smaregi APIを使用してレシートを印刷します
   * OAuth2.0フローでアクセストークンを動的に取得し、レート制限対策としてキャッシュを活用します
   * @param order 注文データ
   * @throws レシート印刷に失敗した場合
   */
  async printReceipt(order: Order): Promise<void> {
    const contractId = process.env.SMAREGI_CONTRACT_ID;
    const storeId = process.env.SMAREGI_STORE_ID;
    const terminalId = process.env.SMAREGI_TERMINAL_ID;
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';

    if (!contractId || !storeId || !terminalId) {
      console.warn('Smaregi credentials not configured, skipping receipt printing');
      return;
    }

    try {
      // レシート画像のURLを構築（既存のレシート生成エンドポイントを使用）
      const receiptImageUrl = `${serverUrl}/api/receipts/${order.id}`;

      // SmaregiServiceを使用してレシートを印刷（アクセストークンは自動的に取得・キャッシュされる）
      await smaregiService.printReceipt(contractId, storeId, terminalId, receiptImageUrl);

      console.log(`Receipt print request sent successfully for order #${order.callNumber}`);
      console.log(`Receipt image URL: ${receiptImageUrl}`);
    } catch (error) {
      console.error('Failed to print receipt via Smaregi API:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();