import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertCartItemSchema, insertOrderSchema, insertFeedbackSchema } from "@shared/schema";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import session from "express-session";
import memoryStore from "memorystore";

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

// JWT Secret (should be in env variables in production)
const JWT_SECRET = process.env.JWT_SECRET || "campus-order-jwt-secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || "xxx.ac.jp";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await storage.getUser(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

// Configure Passport.js
const configurePassport = (app: Express) => {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if email domain is allowed
          const email = profile.emails?.[0]?.value || "";
          if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
            return done(null, false, { message: "Only university emails are allowed" });
          }

          // Check if user exists
          let user = await storage.getUserByEmail(email);

          if (!user) {
            // Create new user
            user = await storage.createUser({
              username: profile.displayName || "user",
              password: "google-oauth", // Not used for OAuth users
              email,
              isAdmin: false,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Set up session
  const MemoryStore = memoryStore(session);
  app.use(
    session({
      secret: JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
};

// Helper function to create a JWT token
const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure Passport
  configurePassport(app);

  // Auth routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
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

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Cart routes
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

  // Time slots routes
  app.get("/api/timeslots", async (req, res) => {
    try {
      const timeSlots = await storage.getTimeSlots();
      res.json(timeSlots);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Order routes
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
  
  // (最初のフィードバックルートセクションは削除)

  // Admin routes
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
  
  // 店舗設定の取得
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

  // Feedback routes
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
      
      // Create feedback
      const feedback = await storage.createFeedback({
        ...validatedData,
        createdAt: new Date()
      });
      
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
