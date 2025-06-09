/***********************************
 * 注文関連のエンドポイント
 ***********************************/

import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import { storage } from "../storage";

const router = express.Router();

// 新規注文の作成
router.post("/api/orders", isAuthenticated, async (req, res) => {
  try {
    const { timeSlotId, paymentMethod } = req.body;

    // Validate input
    if (!timeSlotId) {
      return res.status(400).json({ message: "Invalid time slot" });
    }

    if (!paymentMethod || paymentMethod !== "paypay") {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // Get cart items
    const cartItems = await storage.getCartItems(req.user.id);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check time slot availability
    const timeSlot = await storage.getTimeSlot(timeSlotId);

    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found" });
    }

    if (timeSlot.available <= 0) {
      return res.status(400).json({ message: "Time slot is full" });
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.quantity * item.product.price);
    }, 0);

    // Create order
    const order = await storage.createOrder({
      userId: req.user.id,
      status: "pending",
      total,
      timeSlotId,
      items: cartItems.map(item => ({
        id: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        customizations: item.customizations
      }))
    });

    console.log(`Order confirmed: Call number ${order.callNumber}`);

    res.status(201).json({
      ...order,
      callNumber: (order.callNumber % 99) + 201,
      timeSlot
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/orders", isAuthenticated, async (req, res) => {
  try {
    const orders = await storage.getOrdersByUser(req.user.id);
    res.json(orders.map(o => ({ ...o, callNumber: (o.callNumber % 99) + 201 })));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 特定の注文をIdで取得するAPI
// callNumberは表示用の番号で、実際のDBのIDはUUIDなので、
router.get("/api/orders/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // 全注文を取得してIdでフィルタリング
    const userOrders = await storage.getOrdersByUser(req.user.id);
    const order = userOrders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 注文に対応するタイムスロット情報を取得
    const timeSlot = await storage.getTimeSlot(order.timeSlotId);

    // レスポンスとしてタイムスロット情報も含める
    res.json({
      ...order,
      callNumber: (order.callNumber % 99) + 201,
      timeSlot
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    res.status(500).json({
      message: "注文情報の取得中にエラーが発生しました",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;