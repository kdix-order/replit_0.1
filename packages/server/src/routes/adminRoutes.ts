/**
 * routes/adminRoutes.ts
 * 
 * 管理者機能関連のルーティング定義
 * コントローラーを呼び出してHTTPリクエストを処理します。
 */

import { Router } from "express";
import { adminController } from "../controllers/admin/AdminController";
import { isAuthenticated, isAdmin } from "../middlewares/auth";
import { Request, Response, NextFunction } from "express";

const router = Router();

const authMiddleware = isAuthenticated as (req: Request, res: Response, next: NextFunction) => void;
const adminMiddleware = isAdmin as (req: Request, res: Response, next: NextFunction) => void;

router.get("/", authMiddleware, adminMiddleware, adminController.getOrders);

router.patch("/:id", authMiddleware, adminMiddleware, adminController.updateOrderStatus);

router.get("/store-settings", adminController.getStoreSettings);

router.get("/admin-store-settings", authMiddleware, adminMiddleware, adminController.getAdminStoreSettings);

router.patch("/admin-store-settings", authMiddleware, adminMiddleware, adminController.updateStoreSettings);

router.get("/feedback", authMiddleware, adminMiddleware, adminController.getAllFeedback);

export default router;
