/***********************************
 * 商品関連のエンドポイント
 ***********************************/

import express from "express";
import { storage } from "../storage";

const router = express.Router();

// 全商品の取得
router.get("/api/products", async (req, res) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;