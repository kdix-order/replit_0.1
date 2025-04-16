/***********************************
 * PayPay決済関連のエンドポイント
 ***********************************/

import express from "express";
import { isAuthenticated } from "../middlewares/auth.ts";
import { createPayment, getPaymentDetails } from "../paypay.ts";

const router = express.Router();

// PayPay QRコード生成エンドポイント
router.post("/api/payments/paypay/create", isAuthenticated, async (req, res) => {
  try {
    const { orderId, amount, description } = req.body;

    if (!orderId || !amount || !description) {
      return res.status(400).json({ message: "必須パラメータが不足しています" });
    }

    const response = await createPayment(orderId, amount, description);
    res.json(response);
  } catch (error) {
    console.error('PayPay QRコード生成エラー:', error);
    res.status(500).json({
      message: '支払い処理中にエラーが発生しました',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// PayPay 支払い状態確認エンドポイント
router.get("/api/payments/paypay/status/:merchantPaymentId", isAuthenticated, async (req, res) => {
  try {
    const { merchantPaymentId } = req.params;
    const response = await getPaymentDetails(merchantPaymentId);
    res.json(response);
  } catch (error) {
    console.error('PayPay 支払い状態確認エラー:', error);
    res.status(500).json({
      message: '支払い状態確認中にエラーが発生しました',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;