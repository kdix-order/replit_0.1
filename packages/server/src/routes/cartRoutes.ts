/**
 * routes/cartRoutes.ts
 * 
 * カート関連のルーティング定義
 * コントローラーを呼び出してHTTPリクエストを処理します。
 */

import { Router } from "express";
import { cartController } from "../controllers/cart/CartController";
import { isAuthenticated } from "../middlewares/auth";
import { Request, Response, NextFunction } from "express";

const router = Router();

const authMiddleware = isAuthenticated as (req: Request, res: Response, next: NextFunction) => void;

router.get("/", authMiddleware, cartController.getCartItems);

router.post("/", authMiddleware, cartController.addToCart);

router.patch("/:id", authMiddleware, cartController.updateCartItemQuantity);

router.delete("/:id", authMiddleware, cartController.deleteCartItem);

router.delete("/clear", authMiddleware, cartController.clearCart);

router.get("/total", authMiddleware, cartController.calculateCartTotal);

export default router;
