/**
 * routes/index.ts
 * 
 * ルーティングのエントリーポイント
 * 各ドメイン別のルーターをまとめて提供します。
 */

import { Router } from "express";
import orderRoutes from "./orderRoutes";
import paymentRoutes from "./paymentRoutes";
import productRoutes from "./productRoutes";
import cartRoutes from "./cartRoutes";
import authRoutes from "./authRoutes";
import adminRoutes from "./adminRoutes";
import receiptRoutes from "./receiptRoutes";
import timeslotRoutes from "./timeslotRoutes";

const router = Router();

router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/products", productRoutes);
router.use("/receipts", receiptRoutes);
router.use("/timeslots", timeslotRoutes);

router.post("/idp", (req, res) => {
    console.log("IDP request received:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

export default router;
