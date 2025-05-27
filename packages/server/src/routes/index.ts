/**
 * routes/index.ts
 * 
 * ルーティングのエントリーポイント
 * 各ドメイン別のルーターをまとめて提供します。
 */

import { Router } from "express";
import orderRoutes from "./orderRoutes";
import productRoutes from "./productRoutes";

const router = Router();

router.use("/orders", orderRoutes);
router.use("/products", productRoutes);

export default router;
