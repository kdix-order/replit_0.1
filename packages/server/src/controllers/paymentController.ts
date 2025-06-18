/**
 * controllers/paymentController.ts
 * 
 * PayPay決済関連のHTTPリクエスト処理を担当するコントローラー
 * サービス層を利用してビジネスロジックを実行し、HTTPレスポンスを返します。
 */

import { Request, Response } from "express";
import { paymentService } from "../services/paymentService";
import { AuthenticatedRequest } from "../middlewares/auth";

/**
 * 決済コントローラークラス
 * PayPay決済関連のHTTPリクエスト処理を提供します
 */
export class PaymentController {
  /**
   * PayPay QRコードを生成します
   * @param req リクエスト
   * @param res レスポンス
   */
  async createPayPayPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        res.status(400).json({ message: "必須パラメータが不足しています" });
        return;
      }

      const response = await paymentService.createPayPayPayment(orderId, req.header("Origin"));
      res.json(response);
    } catch (error) {
      console.error('PayPay QRコード生成エラー:', error);
      
      if (error instanceof Error && error.message === "Order not found") {
        res.status(404).json({ message: "注文が見つかりません" });
      } else {
        res.status(500).json({
          message: '支払い処理中にエラーが発生しました',
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  }

  /**
   * PayPay画面からのリダイレクト処理を行います
   * ブラウザで開かれるので、認証は無効化
   * @param req リクエスト
   * @param res レスポンス
   */
  async handlePaymentCompleted(req: Request, res: Response): Promise<void> {
    try {
      const { merchantPaymentId } = req.params;
      
      if (!merchantPaymentId) {
        res.status(400).json({ message: "merchantPaymentIdが必要です" });
        return;
      }

      const result = await paymentService.completePayment(merchantPaymentId);
      res.redirect(result.redirectUrl);
    } catch (error) {
      console.error('PayPayリダイレクトエラー:', error);
      
      if (error instanceof Error) {
        if (error.message === "Payment not completed") {
          res.redirect("/failure");
        } else if (error.message === "Order not found") {
          res.status(404).json({ message: "注文が見つかりません" });
        } else {
          res.status(500).json({
            message: 'リダイレクト処理中にエラーが発生しました',
            error: error.message
          });
        }
      } else {
        res.status(500).json({
          message: 'リダイレクト処理中にエラーが発生しました',
          error: "Unknown error"
        });
      }
    }
  }

  /**
   * PayPay支払い状態を取得します
   * @param req リクエスト
   * @param res レスポンス
   */
  async getPaymentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { merchantPaymentId } = req.params;
      const response = await paymentService.getPaymentStatus(merchantPaymentId);
      res.json(response);
    } catch (error) {
      console.error('PayPay 支払い状態確認エラー:', error);
      res.status(500).json({
        message: '支払い状態確認中にエラーが発生しました',
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}

export const paymentController = new PaymentController();