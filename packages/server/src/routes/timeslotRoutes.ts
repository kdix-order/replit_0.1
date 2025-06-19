/***********************************
 * 受け取り時間枠関連のエンドポイント
 ***********************************/

import express from "express";
import { storage } from "@/storage";

const router = express.Router();

// 利用可能な時間枠一覧を取得
router.get("/", async (req, res) => {
  try {
    const timeSlots = await storage.getTimeSlots();
    res.json(timeSlots);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;