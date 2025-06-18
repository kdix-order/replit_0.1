/***********************************
 * PayPay決済関連のエンドポイント
 ***********************************/

import express from "express";
import { isAuthenticated } from "@/middlewares/auth";
import { paymentController } from "@/controllers/paymentController";

const router = express.Router();

// PayPay QRコード生成エンドポイント
router.post("/api/payments/paypay/create", isAuthenticated, (req, res) => paymentController.createPayPayPayment(req as any, res));

// PayPay画面からのリダイレクト用エンドポイント
// ブラウザで開かれるので、認証は無効化
router.get("/api/payments/paypay/completed/:merchantPaymentId", (req, res) => paymentController.handlePaymentCompleted(req, res));

// PayPay 支払い状態確認エンドポイント
router.get("/api/payments/paypay/status/:merchantPaymentId", isAuthenticated, (req, res) => paymentController.getPaymentStatus(req as any, res));

export default router;
