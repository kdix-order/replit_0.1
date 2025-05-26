/**
 * health.ts
 * ヘルスチェックエンドポイントを提供するルーター
 * 
 * このルーターは、アプリケーションの稼働状態を確認するための
 * シンプルなエンドポイントを提供します。
 * インテグレーションテストの基本的な検証にも使用されます。
 */

import express from "express";

const router = express.Router();

/**
 * GET /health
 * アプリケーションの稼働状態を確認するためのエンドポイント
 * 
 * 戻り値:
 * - status: "ok" - アプリケーションが正常に動作していることを示す
 * - timestamp: 現在のタイムスタンプ
 */
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export default router;
