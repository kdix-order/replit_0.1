/**
 * routes/orderRoutes.ts
 * 
 * 注文関連のルーティング定義
 * コントローラーを呼び出してHTTPリクエストを処理します。
 */

import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { isAuthenticated } from "../../middlewares/auth";

const router = Router();

router.post("/", isAuthenticated, orderController.createOrder.bind(orderController));

router.get("/", isAuthenticated, orderController.getUserOrders.bind(orderController));

router.get("/:id", isAuthenticated, orderController.getOrder.bind(orderController));

export default router;
