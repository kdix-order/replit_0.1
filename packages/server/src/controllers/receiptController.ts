/**
 * controllers/receiptController.ts
 * 
 * レシート関連のHTTPリクエスト処理を担当するコントローラー
 * レシート画像の生成とダウンロード機能を提供します。
 */

import { Request, Response } from "express";
import { receiptService } from "../services/receiptService";
import { orderRepository } from "../repositories/orderRepository";

/**
 * レシートコントローラークラス
 * レシート画像生成関連のHTTPリクエスト処理を提供します
 */
export class ReceiptController {
  /**
   * 注文IDに基づいてレシート画像を生成して返します
   * @param req リクエスト（パラメータ: orderId）
   * @param res レスポンス（JPEG画像）
   */
  async generateReceiptImage(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({ message: "Order ID is required" });
        return;
      }

      // 注文データを取得（ユーザーの所有チェック込み）
      const order = await orderRepository.getOrder(orderId);

      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      var timeSlot = await orderRepository.getTimeSlot(order.timeSlotId);
      if (!timeSlot) {
        res.status(404).json({ message: "Time slot not found for this order" });
        return;
      }

      // レシート画像を生成
      const imageBuffer = await receiptService.generateReceiptImage({ ...order, timeSlot });

      // HTTPヘッダーを設定
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', imageBuffer.length);
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${order.callNumber}.jpg"`);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1時間キャッシュ

      // 画像データを送信
      res.send(imageBuffer);

      console.log(`Receipt image generated for order ${orderId}, call number ${order.callNumber}`);

    } catch (error) {
      console.error('Receipt generation error:', error);

      if (error instanceof Error) {
        res.status(500).json({
          message: "Failed to generate receipt image",
          error: error.message
        });
      } else {
        res.status(500).json({
          message: "Failed to generate receipt image",
          error: "Unknown error occurred"
        });
      }
    }
  }
}

export const receiptController = new ReceiptController();