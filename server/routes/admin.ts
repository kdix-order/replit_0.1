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
    res.json(orders);
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
    res.json({ ...updatedOrder, timeSlot });
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

// 返金処理エンドポイント
router.post("/api/admin/orders/:id/refund", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    
    // 注文の存在確認
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ message: "注文が見つかりません" });
    }
    
    // すでに完了した注文は返金できない
    if (order.status === "completed") {
      return res.status(400).json({ message: "完了済みの注文は返金できません" });
    }
    
    // 返金処理（実際のPayPay APIとの連携は省略）
    // 本番環境では実際にPayPay APIを使用して返金処理を行うべき
    
    // 注文ステータスを「返金済み」に更新
    const updatedOrder = await storage.updateOrderStatus(id, "refunded");
    
    if (!updatedOrder) {
      return res.status(500).json({ message: "返金処理に失敗しました" });
    }
    
    // タイムスロット情報を取得
    const timeSlot = await storage.getTimeSlot(updatedOrder.timeSlotId);
    
    console.log(`Order ${id} has been refunded`);
    
    // 返金処理成功
    res.json({ 
      ...updatedOrder, 
      timeSlot,
      message: "返金処理が完了しました" 
    });
  } catch (error) {
    console.error("Refund process error:", error);
    res.status(500).json({
      message: "返金処理中にエラーが発生しました",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});


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