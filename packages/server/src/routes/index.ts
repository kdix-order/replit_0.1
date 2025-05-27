/**
 * routes/index.ts
 * 
 * ルーティングのエントリーポイント
 * 各ドメイン別のルーターをまとめて提供します。
 */

import { Router } from "express";
import orderRoutes from "./orderRoutes";
import productRoutes from "./productRoutes";
import cartRoutes from "./cartRoutes";
import authRoutes from "./authRoutes";
import adminRoutes from "./adminRoutes";

const router = Router();

router.use("/orders", orderRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

export default router;
