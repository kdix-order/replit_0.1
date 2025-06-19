/**
 * routes/authRoutes.ts
 * 
 * 認証関連のルーティング定義
 * コントローラーを呼び出してHTTPリクエストを処理します。
 */

import { Router } from "express";
import { authController } from "../controllers/auth/AuthController";
import { isAuthenticated } from "../middlewares/auth";
import { Request, Response, NextFunction } from "express";

const router = Router();

const authMiddleware = isAuthenticated as (req: Request, res: Response, next: NextFunction) => void;

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authMiddleware, authController.getProfile);
router.get("/me", authMiddleware, authController.getProfile);

router.get("/google", authController.googleAuth);
router.get("/google/callback", ...authController.googleAuthCallback);

router.post("/admin-demo-login", authController.adminDemoLogin);
router.post("/customer-demo-login", authController.customerDemoLogin);

export default router;
