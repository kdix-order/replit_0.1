/**
 * routes/orderRoutes.ts
 * 
 * 注文関連のルーティング定義
 * コントローラーを呼び出してHTTPリクエストを処理します。
 */

import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { isAuthenticated } from "../middlewares/auth";

const router = Router();

// @ts-expect-error
router.post("/", isAuthenticated, orderController.createOrder.bind(orderController));

// @ts-expect-error
router.get("/", isAuthenticated, orderController.getUserOrders.bind(orderController));

// @ts-expect-error
router.get("/:id", isAuthenticated, orderController.getOrder.bind(orderController));

export default router;
