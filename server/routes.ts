/**
 * routes.ts
 * アプリケーションのAPIエンドポイントとルーティングを定義するファイル
 *
 * 主な機能:
 * - 認証サービス (JWT, Google OAuth)
 * - 製品一覧のエンドポイント
 * - カート操作のエンドポイント
 * - 注文処理のエンドポイント
 * - 管理者向けエンドポイント
 * - フィードバック機能のエンドポイント
 */

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage/mem-storage";
import { z } from "zod";
import { insertUserSchema, insertCartItemSchema, insertOrderSchema, insertFeedbackSchema } from "@shared/schema";
import passport from "passport";
import { createPayment, getPaymentDetails } from './paypay';
import dotenv from 'dotenv';
import { configurePassport, isAuthenticated, isAdmin, generateToken } from "./middlewares/auth";

// 環境変数の読み込み
dotenv.config();

// Add custom types for Express Request
declare global {
  namespace Express {
    interface User {
      id: number;
    }
    interface Request {
      user?: User;
    }
  }
}

/**
 * すべてのAPIルートを登録する関数
 *
 * この関数では以下の機能を提供するAPIエンドポイントを登録します：
 * - 認証関連（ログイン、ユーザー情報取得）
 * - 商品一覧の取得
 * - カート操作（追加、更新、削除）
 * - 注文の作成と取得
 * - 管理者機能（注文管理、店舗設定）
 * - フィードバック機能
 *
 * @param app - Expressアプリケーションインスタンス
 * @returns HTTPサーバーインスタンス
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Passportの設定（Google OAuth認証用）
  configurePassport(app);

  /***********************************
   * 認証関連のエンドポイント
   ***********************************/

  // Google OAuth認証の開始エンドポイント
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/?auth_error=true",
      failureMessage: "認証に失敗しました。許可されたメールアドレスでログインしてください。"
    }),
    (req, res) => {
      const user = req.user as any;
      const token = generateToken(user.id);

      // Redirect to frontend with token
      res.redirect(`/?token=${token}`);
    }
  );

  // Admin demo login endpoint
  app.post("/api/auth/admin-demo-login", async (req, res) => {
    try {
      // Create or get admin demo user
      let user = await storage.getUserByEmail("admin-demo@example.com");

      if (!user) {
        user = await storage.createUser({
          username: "管理者デモユーザー",
          password: "admin-demo-password",
          email: "admin-demo@example.com",
          isAdmin: true, // Set to true so they can access admin panel
        });
      }

      const token = generateToken(user.id);
      res.json({ token, user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Admin demo login error:", error);
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  // Customer demo login endpoint
  app.post("/api/auth/customer-demo-login", async (req, res) => {
    try {
      // Create or get customer demo user
      let user = await storage.getUserByEmail("customer-demo@example.com");

      if (!user) {
        user = await storage.createUser({
          username: "お客様デモユーザー",
          password: "customer-demo-password",
          email: "customer-demo@example.com",
          isAdmin: false, // Set to false for regular customer access
        });
      }

      const token = generateToken(user.id);
      res.json({ token, user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  /***********************************
   * 商品関連のエンドポイント
   ***********************************/

  // 全商品の取得
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  /***********************************
   * カート関連のエンドポイント
   ***********************************/

  // ユーザーのカートアイテム取得
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const schema = insertCartItemSchema.extend({
        productId: z.number().min(1),
        quantity: z.number().min(1),
        size: z.string().default("並"),
        customizations: z.array(z.string()).default([])
      });

      const validatedData = schema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;

      if (typeof quantity !== "number" || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      if (quantity === 0) {
        await storage.deleteCartItem(id);
        return res.status(204).send();
      }

      const updatedItem = await storage.updateCartItemQuantity(id, quantity);

      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCartItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  /***********************************
   * 受け取り時間枠関連のエンドポイント
   ***********************************/

  // 利用可能な時間枠一覧を取得
  app.get("/api/timeslots", async (req, res) => {
    try {
      const timeSlots = await storage.getTimeSlots();
      res.json(timeSlots);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  /***********************************
   * 注文関連のエンドポイント
   ***********************************/

  // 新規注文の作成
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const { timeSlotId, paymentMethod } = req.body;

      // Validate input
      if (!timeSlotId || typeof timeSlotId !== "number") {
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

      // Get next call number
      const callNumber = await storage.getNextCallNumber();

      // Create order
      const order = await storage.createOrder({
        userId: req.user.id,
        callNumber,
        status: "new",
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

      // Clear cart
      await storage.clearCart(req.user.id);

      console.log(`Order confirmed: Call number ${callNumber}`);

      res.status(201).json({
        ...order,
        timeSlot
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrdersByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // 特定の注文を呼び出し番号で取得するAPI
  app.get("/api/orders/:callNumber", isAuthenticated, async (req, res) => {
    try {
      const { callNumber } = req.params;
      const callNumberInt = parseInt(callNumber, 10);

      if (isNaN(callNumberInt)) {
        return res.status(400).json({ message: "Invalid call number" });
      }

      // 全注文を取得して呼び出し番号でフィルタリング
      const userOrders = await storage.getOrdersByUser(req.user.id);
      const order = userOrders.find(o => o.callNumber === callNumberInt);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // 注文に対応するタイムスロット情報を取得
      const timeSlot = await storage.getTimeSlot(order.timeSlotId);

      // レスポンスとしてタイムスロット情報も含める
      res.json({ ...order, timeSlot });
    } catch (error) {
      console.error("Order fetch error:", error);
      res.status(500).json({
        message: "注文情報の取得中にエラーが発生しました",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // (最初のフィードバックルートセクションは削除)

  /***********************************
   * 管理者向けエンドポイント
   ***********************************/

  // 全注文一覧（管理者用）
  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/admin/orders/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Input validation
      if (!req.params.id || isNaN(parseInt(req.params.id))) {
        return res.status(400).json({ message: "Invalid order ID format" });
      }

      const id = parseInt(req.params.id);

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
  app.get("/api/store-settings", async (req, res) => {
    try {
      const settings = await storage.getStoreSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve store settings" });
    }
  });

  // 店舗設定の取得 (管理者用)
  app.get("/api/admin/store-settings", isAuthenticated, isAdmin, async (req, res) => {
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
  app.patch("/api/admin/store-settings", isAuthenticated, isAdmin, async (req, res) => {
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

  /***********************************
   * フィードバック関連のエンドポイント
   ***********************************/

  // フィードバックの送信
  app.post("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const { orderId, sentiment, rating, comment } = req.body;

      // Validate input
      const schema = insertFeedbackSchema.extend({
        orderId: z.number().optional(),
        sentiment: z.enum(["positive", "negative"]),
        rating: z.number().min(1).max(5).optional(),
        comment: z.string().optional(),
      });

      const validatedData = schema.parse({
        ...req.body,
        userId: req.user.id,
      });

      // Check if order exists if orderId is provided
      if (orderId) {
        const order = await storage.getOrder(orderId);
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }

        // Check if user owns the order
        if (order.userId !== req.user.id) {
          return res.status(403).json({ message: "Forbidden" });
        }

        // Check if feedback already exists for this order
        const existingFeedback = await storage.getFeedbackByOrderId(orderId);
        if (existingFeedback) {
          return res.status(400).json({ message: "Feedback already submitted for this order" });
        }
      }

      // Create feedback - createdAt is automatically set through the schema default
      const feedback = await storage.createFeedback(validatedData);

      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get user's feedback
  app.get("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const feedback = await storage.getFeedbackByUserId(req.user.id);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get feedback for a specific order
  app.get("/api/feedback/order/:id", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);

      // Check if order exists
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if user owns the order
      if (order.userId !== req.user.id && !await isAdminUser(req)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const feedback = await storage.getFeedbackByOrderId(orderId);

      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }

      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // 管理者向け - すべてのフィードバックを取得
  app.get('/api/admin/feedback', isAuthenticated, async (req: Request, res: Response) => {
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

  /***********************************
   * PayPay決済関連のエンドポイント
   ***********************************/

  // PayPay QRコード生成エンドポイント
  app.post("/api/payments/paypay/create", isAuthenticated, async (req, res) => {
    try {
      const { orderId, amount, description } = req.body;

      if (!orderId || !amount || !description) {
        return res.status(400).json({ message: "必須パラメータが不足しています" });
      }

      const response = await createPayment(orderId, amount, description);
      res.json(response);
    } catch (error) {
      console.error('PayPay QRコード生成エラー:', error);
      res.status(500).json({
        message: '支払い処理中にエラーが発生しました',
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // PayPay 支払い状態確認エンドポイント
  app.get("/api/payments/paypay/status/:merchantPaymentId", isAuthenticated, async (req, res) => {
    try {
      const { merchantPaymentId } = req.params;
      const response = await getPaymentDetails(merchantPaymentId);
      res.json(response);
    } catch (error) {
      console.error('PayPay 支払い状態確認エラー:', error);
      res.status(500).json({
        message: '支払い状態確認中にエラーが発生しました',
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Helper function to check if user is admin
  async function isAdminUser(req: Request): Promise<boolean> {
    if (!req.user) return false;

    const user = await storage.getUser(req.user.id);
    if (!user) return false;

    return user.isAdmin === true;
  }

  const httpServer = createServer(app);

  return httpServer;
}
