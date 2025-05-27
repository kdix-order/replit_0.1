/**
 * routes/productRoutes.ts
 * 
 * 商品関連のルーティング定義
 * コントローラーを呼び出してHTTPリクエストを処理します。
 */

import { Router } from "express";
import { productController } from "../controllers/productController";

const router = Router();

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

export default router;
