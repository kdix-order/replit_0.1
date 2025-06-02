/***********************************
 * 管理者向けエンドポイント
 ***********************************/

import express, { type Request, type Response } from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth";
import { storage } from "../storage";
import { isAdminUser } from "../utils/auth";

const router = express.Router();

// 全注文一覧（管理者用）
router.get("/api/admin/orders", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const orders = await storage.getOrders();
    // Transform callNumber for admin view: (callNumber % 99) + 201
    const transformedOrders = orders.map(order => ({
      ...order,
      callNumber: (order.callNumber % 99) + 201
    }));
    res.json(transformedOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/api/admin/orders/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Input validation
    if (!req.params.id) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const id = req.params.id;

    // Require status in request body
    if (!req.body || req.body.status === undefined) {
      return res.status(400).json({ message: "Status is required" });
    }

    const { status } = req.body;

    // Validate status value
    if (!["new", "preparing", "completed"].includes(status)) {
      return res.status(400).json({ message: "無効なステータスです。有効な値: 'new', 'preparing', 'completed'" });
    }

    // Check if order exists first
    const existingOrder = await storage.getOrder(id);
    if (!existingOrder) {
      return res.status(404).json({ message: `注文ID: ${id} は見つかりませんでした` });
    }

    // Update the order status
    const updatedOrder = await storage.updateOrderStatus(id, status);

    if (!updatedOrder) {
      return res.status(500).json({ message: "ステータス更新に失敗しました" });
    }

    // Fetch the updated order with time slot information
    const timeSlot = await storage.getTimeSlot(updatedOrder.timeSlotId);

    // Log the successful status update
    console.log(`Order ${id} status updated to "${status}" successfully`);

    // Return the updated order with time slot information
    // Transform callNumber for admin view: (callNumber % 99) + 201
    res.json({ 
      ...updatedOrder, 
      callNumber: (updatedOrder.callNumber % 99) + 201,
      timeSlot 
    });
  } catch (error) {
    console.error("Order status update error:", error);
    res.status(500).json({
      message: "ステータス更新中にエラーが発生しました",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// 店舗設定の取得 (一般ユーザー向け - 権限チェックなし)
router.get("/api/store-settings", async (req, res) => {
  try {
    const settings = await storage.getStoreSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve store settings" });
  }
});

// 店舗設定の取得 (管理者用)
router.get("/api/admin/store-settings", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const settings = await storage.getStoreSettings();
    res.json(settings);
  } catch (error) {
    console.error("Store settings fetch error:", error);
    res.status(500).json({
      message: "店舗設定の取得中にエラーが発生しました",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// 店舗設定の更新（注文受付の停止・再開）
router.patch("/api/admin/store-settings", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { acceptingOrders } = req.body;

    if (typeof acceptingOrders !== 'boolean') {
      return res.status(400).json({
        message: "acceptingOrdersはブール値である必要があります"
      });
    }

    console.log(`Updating store settings: acceptingOrders=${acceptingOrders}`);

    const settings = await storage.updateStoreSettings(acceptingOrders);
    res.json(settings);
  } catch (error) {
    console.error("Store settings update error:", error);
    res.status(500).json({
      message: "店舗設定の更新中にエラーが発生しました",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// 管理者向け - すべてのフィードバックを取得
router.get('/api/admin/feedback', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // 管理者権限チェック
    if (!await isAdminUser(req)) {
      return res.status(403).json({ message: "Forbidden - Admin permissions required" });
    }

    // すべてのフィードバックを取得
    const allFeedback = await storage.getAllFeedback();

    // 注文情報とユーザー情報を付加
    const enrichedFeedback = await Promise.all(
      allFeedback.map(async (feedback) => {
        let orderDetails = null;
        let userName = 'Unknown user';

        if (feedback.orderId) {
          const order = await storage.getOrder(feedback.orderId);
          if (order) {
            orderDetails = {
              id: order.id,
              callNumber: order.callNumber,
              status: order.status,
              total: order.total,
              createdAt: order.createdAt
            };
          }
        }

        const user = await storage.getUser(feedback.userId);
        if (user) {
          userName = user.username || user.email;
        }

        return {
          ...feedback,
          orderDetails,
          userName
        };
      })
    );

    res.json(enrichedFeedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;