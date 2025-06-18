/**
 * routes/receiptRoutes.ts
 * 
 * レシート関連のルーティング定義
 * レシート画像生成エンドポイントを提供します。
 */

import { Router } from "express";
import { receiptController } from "../controllers/receiptController";

const router = Router();

/**
 * GET /receipts/:orderId
 * 指定された注文IDのレシート画像を生成して返します
 * 認証が必要で、ユーザーは自分の注文のレシートのみアクセス可能です
 */
router.get("/:orderId", receiptController.generateReceiptImage.bind(receiptController));

export default router;