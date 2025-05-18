// index.ts
import express10 from "express";

// routes.ts
import { createServer } from "http";
import dotenv2 from "dotenv";

// ../shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false)
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true
});
var products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  // Price in yen
  image: text("image").notNull()
});
var insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  image: true
});
var cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  size: text("size").notNull().default("\u666E\u901A"),
  customizations: jsonb("customizations").default([])
});
var insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
  size: true,
  customizations: true
});
var timeSlots = pgTable("time_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  time: text("time").notNull(),
  // Format: HH:MM
  capacity: integer("capacity").notNull(),
  available: integer("available").notNull()
});
var insertTimeSlotSchema = createInsertSchema(timeSlots).pick({
  time: true,
  capacity: true,
  available: true
});
var orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  callNumber: serial("call_number").notNull(),
  status: text("status").notNull().default("new"),
  // new, paid, preparing, completed
  total: integer("total").notNull(),
  // Total price in yen
  timeSlotId: uuid("time_slot_id").notNull().references(() => timeSlots.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  items: jsonb("items").notNull()
  // Array of order items
});
var insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  total: true,
  timeSlotId: true,
  items: true
});
var feedback = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  sentiment: text("sentiment", { enum: ["positive", "negative"] }).notNull(),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertFeedbackSchema = createInsertSchema(feedback).pick({
  userId: true,
  orderId: true,
  sentiment: true,
  rating: true,
  comment: true
});
var storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  acceptingOrders: boolean("accepting_orders").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertStoreSettingsSchema = createInsertSchema(storeSettings).pick({
  acceptingOrders: true
});

// storage/pg-storage.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import dotenv from "dotenv";
var PgStorage = class {
  constructor() {
    dotenv.config();
    this.db = drizzle(process.env.DATABASE_URL);
  }
  async addToCart(item) {
    const [result] = await this.db.insert(cartItems).values(item).returning();
    return result;
  }
  async clearCart(userId) {
    await this.db.delete(cartItems).where(eq(cartItems.userId, userId));
  }
  async createFeedback(feedback2) {
    const [result] = await this.db.insert(feedback).values(feedback2).returning();
    return result;
  }
  async createOrder(order) {
    const [result] = await this.db.insert(orders).values(order).returning();
    return result;
  }
  async createUser(user) {
    const [result] = await this.db.insert(users).values(user).returning();
    return result;
  }
  async deleteCartItem(id) {
    await this.db.delete(cartItems).where(eq(cartItems.id, id));
  }
  async getAllFeedback() {
    return await this.db.select().from(feedback);
  }
  async getCartItem(userId, productId) {
    const items = await this.db.select().from(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    return items[0];
  }
  async getCartItems(userId) {
    const results = await this.db.select({
      cartItem: cartItems,
      product: products
    }).from(cartItems).leftJoin(products, eq(cartItems.productId, products.id)).where(eq(cartItems.userId, userId));
    return results.map((row) => ({
      ...row.cartItem,
      product: row.product
    }));
  }
  async getFeedbackByOrderId(orderId) {
    const rows = await this.db.select().from(feedback).where(eq(feedback.orderId, orderId));
    return rows[0];
  }
  async getFeedbackByUserId(userId) {
    const rows = await this.db.select().from(feedback).where(eq(feedback.userId, userId));
    return rows;
  }
  async getOrder(id) {
    const rows = await this.db.select().from(orders).where(eq(orders.id, id));
    return rows[0];
  }
  async getOrders() {
    const results = await this.db.select({
      order: orders,
      timeSlot: timeSlots
    }).from(orders).leftJoin(timeSlots, eq(orders.timeSlotId, timeSlots.id));
    return results.map((row) => ({
      ...row.order,
      timeSlot: row.timeSlot
    }));
  }
  async getOrdersByUser(userId) {
    const results = await this.db.select({
      order: orders,
      timeSlot: timeSlots
    }).from(orders).leftJoin(timeSlots, eq(orders.timeSlotId, timeSlots.id)).where(eq(orders.userId, userId));
    return results.map((row) => ({
      ...row.order,
      timeSlot: row.timeSlot
    }));
  }
  async getProduct(id) {
    const rows = await this.db.select().from(products).where(eq(products.id, id));
    return rows[0];
  }
  async getProducts() {
    return await this.db.select().from(products);
  }
  async getStoreSettings() {
    const rows = await this.db.select().from(storeSettings);
    return rows[0];
  }
  async getTimeSlot(id) {
    const rows = await this.db.select().from(timeSlots).where(eq(timeSlots.id, id));
    return rows[0];
  }
  async getTimeSlots() {
    return await this.db.select().from(timeSlots).then((rows) => rows.map((row) => ({
      ...row,
      isFull: row.available <= 0
    })));
  }
  async getUser(id) {
    const rows = await this.db.select().from(users).where(eq(users.id, id));
    return rows[0];
  }
  async getUserByEmail(email) {
    const rows = await this.db.select().from(users).where(eq(users.email, email));
    return rows[0];
  }
  async getUserByUsername(username) {
    const rows = await this.db.select().from(users).where(eq(users.username, username));
    return rows[0];
  }
  async updateCartItemQuantity(id, quantity) {
    const [updated] = await this.db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updated;
  }
  async updateOrderStatus(id, status) {
    const [updated] = await this.db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updated;
  }
  async updateStoreSettings(acceptingOrders) {
    const [updated] = await this.db.update(storeSettings).set({ acceptingOrders }).returning();
    return updated;
  }
  async updateTimeSlotAvailability(id, available) {
    const [updated] = await this.db.update(timeSlots).set({ available }).where(eq(timeSlots.id, id)).returning();
    return updated;
  }
  async addProduct(insertProduct) {
    const [result] = await this.db.insert(products).values(insertProduct).returning();
    return result;
  }
  async addTimeSlot(insertTimeSlot) {
    const [result] = await this.db.insert(timeSlots).values(insertTimeSlot).returning();
    return result;
  }
};
var storage = new PgStorage();

// middlewares/auth.ts
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import memoryStore from "memorystore";
import session from "express-session";
var JWT_SECRET = () => process.env.JWT_SECRET || "campus-order-jwt-secret";
var GOOGLE_CLIENT_ID = () => process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
var GOOGLE_CLIENT_SECRET = () => process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";
var isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET());
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error("\u8A8D\u8A3C\u30A8\u30E9\u30FC:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
var isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Forbidden - Admin permission required" });
    }
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ message: "Internal server error during admin verification" });
  }
};
var configurePassport = (app2) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
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
        clientID: GOOGLE_CLIENT_ID(),
        clientSecret: GOOGLE_CLIENT_SECRET(),
        callbackURL: "/api/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            console.error("Google\u8A8D\u8A3C: \u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u304C\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F");
            return done(new Error("\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u304C\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F"), void 0);
          }
          console.log(`Google\u8A8D\u8A3C: \u30ED\u30B0\u30A4\u30F3\u8A66\u884C - ${email}`);
          const ADMIN_EMAIL = "yutonaka911@gmail.com";
          const ALLOWED_DOMAINS = ["kindai.ac.jp", "itp.kindai.ac.jp"];
          const isAdmin2 = email === ADMIN_EMAIL;
          const isAllowedDomain = ALLOWED_DOMAINS.some((domain) => email.endsWith(`@${domain}`));
          if (!isAdmin2 && !isAllowedDomain) {
            console.warn(`Google\u8A8D\u8A3C: \u8A31\u53EF\u3055\u308C\u3066\u3044\u306A\u3044\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u304B\u3089\u306E\u30ED\u30B0\u30A4\u30F3\u8A66\u884C: ${email}`);
            return done(null, false, {
              message: "\u3053\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3067\u306F\u30ED\u30B0\u30A4\u30F3\u3067\u304D\u307E\u305B\u3093\u3002@kindai.ac.jp\u307E\u305F\u306F@itp.kindai.ac.jp\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u3054\u4F7F\u7528\u304F\u3060\u3055\u3044\u3002"
            });
          }
          let user = await storage.getUserByEmail(email);
          if (!user) {
            console.log(`Google\u8A8D\u8A3C: \u65B0\u898F\u30E6\u30FC\u30B6\u30FC\u4F5C\u6210: ${profile.displayName} (${email})`);
            user = await storage.createUser({
              username: profile.displayName || email.split("@")[0],
              password: `google-oauth-${Date.now()}`,
              // OAuth用のランダムパスワード
              email,
              isAdmin: isAdmin2
              // 管理者特権メールアドレスの場合は管理者権限を付与
            });
          } else {
            console.log(`Google\u8A8D\u8A3C: \u65E2\u5B58\u30E6\u30FC\u30B6\u30FC\u3067\u30ED\u30B0\u30A4\u30F3: ${user.username} (${email})`);
            if (isAdmin2 && !user.isAdmin) {
              console.log(`Google\u8A8D\u8A3C: \u7BA1\u7406\u8005\u6A29\u9650\u3092\u4ED8\u4E0E: ${email}`);
            }
          }
          return done(null, user);
        } catch (error) {
          console.error("Google\u8A8D\u8A3C\u30A8\u30E9\u30FC:", error);
          return done(error);
        }
      }
    )
  );
  const MemoryStore = memoryStore(session);
  app2.use(
    session({
      secret: JWT_SECRET(),
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 864e5
        // prune expired entries every 24h
      })
    })
  );
  app2.use(passport.initialize());
  app2.use(passport.session());
};

// routes/admin.ts
import express from "express";

// utils/auth.ts
import jwt2 from "jsonwebtoken";
var JWT_SECRET2 = () => process.env.JWT_SECRET || "campus-order-jwt-secret";
var generateToken = (userId) => {
  return jwt2.sign({ userId }, JWT_SECRET2(), { expiresIn: "24h" });
};
async function isAdminUser(req) {
  if (!req.user) return false;
  const user = await storage.getUser(req.user.id);
  if (!user) return false;
  return user.isAdmin === true;
}

// routes/admin.ts
var router = express.Router();
router.get("/api/admin/orders", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const orders2 = await storage.getOrders();
    res.json(orders2);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.patch("/api/admin/orders/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }
    const id = req.params.id;
    if (!req.body || req.body.status === void 0) {
      return res.status(400).json({ message: "Status is required" });
    }
    const { status } = req.body;
    if (!["new", "preparing", "completed"].includes(status)) {
      return res.status(400).json({ message: "\u7121\u52B9\u306A\u30B9\u30C6\u30FC\u30BF\u30B9\u3067\u3059\u3002\u6709\u52B9\u306A\u5024: 'new', 'preparing', 'completed'" });
    }
    const existingOrder = await storage.getOrder(id);
    if (!existingOrder) {
      return res.status(404).json({ message: `\u6CE8\u6587ID: ${id} \u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F` });
    }
    const updatedOrder = await storage.updateOrderStatus(id, status);
    if (!updatedOrder) {
      return res.status(500).json({ message: "\u30B9\u30C6\u30FC\u30BF\u30B9\u66F4\u65B0\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
    const timeSlot = await storage.getTimeSlot(updatedOrder.timeSlotId);
    console.log(`Order ${id} status updated to "${status}" successfully`);
    res.json({ ...updatedOrder, timeSlot });
  } catch (error) {
    console.error("Order status update error:", error);
    res.status(500).json({
      message: "\u30B9\u30C6\u30FC\u30BF\u30B9\u66F4\u65B0\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router.get("/api/store-settings", async (req, res) => {
  try {
    const settings = await storage.getStoreSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve store settings" });
  }
});
router.get("/api/admin/store-settings", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const settings = await storage.getStoreSettings();
    res.json(settings);
  } catch (error) {
    console.error("Store settings fetch error:", error);
    res.status(500).json({
      message: "\u5E97\u8217\u8A2D\u5B9A\u306E\u53D6\u5F97\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router.patch("/api/admin/store-settings", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { acceptingOrders } = req.body;
    if (typeof acceptingOrders !== "boolean") {
      return res.status(400).json({
        message: "acceptingOrders\u306F\u30D6\u30FC\u30EB\u5024\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
    }
    console.log(`Updating store settings: acceptingOrders=${acceptingOrders}`);
    const settings = await storage.updateStoreSettings(acceptingOrders);
    res.json(settings);
  } catch (error) {
    console.error("Store settings update error:", error);
    res.status(500).json({
      message: "\u5E97\u8217\u8A2D\u5B9A\u306E\u66F4\u65B0\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router.get("/api/admin/feedback", isAuthenticated, async (req, res) => {
  try {
    if (!await isAdminUser(req)) {
      return res.status(403).json({ message: "Forbidden - Admin permissions required" });
    }
    const allFeedback = await storage.getAllFeedback();
    const enrichedFeedback = await Promise.all(
      allFeedback.map(async (feedback2) => {
        let orderDetails = null;
        let userName = "Unknown user";
        if (feedback2.orderId) {
          const order = await storage.getOrder(feedback2.orderId);
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
        const user = await storage.getUser(feedback2.userId);
        if (user) {
          userName = user.username || user.email;
        }
        return {
          ...feedback2,
          orderDetails,
          userName
        };
      })
    );
    res.json(enrichedFeedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
});
var admin_default = router;

// routes/auth.ts
import express2 from "express";
import passport2 from "passport";
var router2 = express2.Router();
router2.get(
  "/api/auth/google",
  passport2.authenticate("google", { scope: ["profile", "email"] })
);
router2.get(
  "/api/auth/google/callback",
  passport2.authenticate("google", {
    failureRedirect: "/?auth_error=true",
    failureMessage: "\u8A8D\u8A3C\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u8A31\u53EF\u3055\u308C\u305F\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user.id);
    res.redirect(`/?token=${token}`);
  }
);
router2.post("/api/auth/admin-demo-login", async (req, res) => {
  try {
    let user = await storage.getUserByEmail("admin-demo@example.com");
    if (!user) {
      user = await storage.createUser({
        username: "\u7BA1\u7406\u8005\u30C7\u30E2\u30E6\u30FC\u30B6\u30FC",
        password: "admin-demo-password",
        email: "admin-demo@example.com",
        isAdmin: true
        // Set to true so they can access admin panel
      });
    }
    const token = generateToken(user.id);
    res.json({ token, user: { ...user, password: void 0 } });
  } catch (error) {
    console.error("Admin demo login error:", error);
    res.status(500).json({ message: "\u30B5\u30FC\u30D0\u30FC\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F" });
  }
});
router2.post("/api/auth/customer-demo-login", async (req, res) => {
  try {
    let user = await storage.getUserByEmail("customer-demo@example.com");
    if (!user) {
      user = await storage.createUser({
        username: "\u304A\u5BA2\u69D8\u30C7\u30E2\u30E6\u30FC\u30B6\u30FC",
        password: "customer-demo-password",
        email: "customer-demo@example.com",
        isAdmin: false
        // Set to false for regular customer access
      });
    }
    const token = generateToken(user.id);
    res.json({ token, user: { ...user, password: void 0 } });
  } catch (error) {
    console.error("Demo login error:", error);
    res.status(500).json({ message: "\u30B5\u30FC\u30D0\u30FC\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F" });
  }
});
router2.get("/api/auth/me", isAuthenticated, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
var auth_default = router2;

// routes/cart.ts
import express3 from "express";
import { z } from "zod";
var router3 = express3.Router();
router3.get("/api/cart", isAuthenticated, async (req, res) => {
  try {
    const cartItems2 = await storage.getCartItems(req.user.id);
    res.json(cartItems2);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router3.post("/api/cart", isAuthenticated, async (req, res) => {
  try {
    const schema = insertCartItemSchema.extend({
      productId: z.string(),
      quantity: z.number().min(1),
      size: z.string().default("\u4E26"),
      customizations: z.array(z.string()).default([])
    });
    const validatedData = schema.parse({
      ...req.body,
      userId: req.user.id
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
router3.patch("/api/cart/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
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
router3.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    await storage.deleteCartItem(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
var cart_default = router3;

// routes/feedback.ts
import express4 from "express";
import { z as z2 } from "zod";
var router4 = express4.Router();
router4.post("/api/feedback", isAuthenticated, async (req, res) => {
  try {
    const { orderId, sentiment, rating, comment } = req.body;
    const schema = insertFeedbackSchema.extend({
      orderId: z2.string().optional(),
      sentiment: z2.enum(["positive", "negative"]),
      rating: z2.number().min(1).max(5).optional(),
      comment: z2.string().optional()
    });
    const validatedData = schema.parse({
      ...req.body,
      userId: req.user.id
    });
    if (orderId) {
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const existingFeedback = await storage.getFeedbackByOrderId(orderId);
      if (existingFeedback) {
        return res.status(400).json({ message: "Feedback already submitted for this order" });
      }
    }
    const feedback2 = await storage.createFeedback(validatedData);
    res.status(201).json(feedback2);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Server error" });
  }
});
router4.get("/api/feedback", isAuthenticated, async (req, res) => {
  try {
    const feedback2 = await storage.getFeedbackByUserId(req.user.id);
    res.json(feedback2);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router4.get("/api/feedback/order/:id", isAuthenticated, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.userId !== req.user.id && !await isAdminUser(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const feedback2 = await storage.getFeedbackByOrderId(orderId);
    if (!feedback2) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(feedback2);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
var feedback_default = router4;

// routes/orders.ts
import express5 from "express";
var router5 = express5.Router();
router5.post("/api/orders", isAuthenticated, async (req, res) => {
  try {
    const { timeSlotId, paymentMethod } = req.body;
    if (!timeSlotId) {
      return res.status(400).json({ message: "Invalid time slot" });
    }
    if (!paymentMethod || paymentMethod !== "paypay") {
      return res.status(400).json({ message: "Invalid payment method" });
    }
    const cartItems2 = await storage.getCartItems(req.user.id);
    if (cartItems2.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    const timeSlot = await storage.getTimeSlot(timeSlotId);
    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found" });
    }
    if (timeSlot.available <= 0) {
      return res.status(400).json({ message: "Time slot is full" });
    }
    const total = cartItems2.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);
    const order = await storage.createOrder({
      userId: req.user.id,
      status: "new",
      total,
      timeSlotId,
      items: cartItems2.map((item) => ({
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
      callNumber: order.callNumber % 99 + 201,
      timeSlot
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router5.get("/api/orders", isAuthenticated, async (req, res) => {
  try {
    const orders2 = await storage.getOrdersByUser(req.user.id);
    res.json(orders2.map((o) => ({ ...o, callNumber: o.callNumber % 99 + 201 })));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router5.get("/api/orders/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userOrders = await storage.getOrdersByUser(req.user.id);
    const order = userOrders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const timeSlot = await storage.getTimeSlot(order.timeSlotId);
    res.json({
      ...order,
      callNumber: order.callNumber % 99 + 201,
      timeSlot
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    res.status(500).json({
      message: "\u6CE8\u6587\u60C5\u5831\u306E\u53D6\u5F97\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var orders_default = router5;

// routes/payments.ts
import express6 from "express";

// paypay.ts
import PAYPAYOPA from "@paypayopa/paypayopa-sdk-node";
import { randomUUID } from "crypto";
var FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
function initializePayPay() {
  if (!process.env.PAYPAY_API_KEY || !process.env.PAYPAY_API_SECRET || !process.env.PAYPAY_MERCHANT_ID) {
    console.warn("PayPay\u74B0\u5883\u5909\u6570\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u30C7\u30E2\u30E2\u30FC\u30C9\u3067\u52D5\u4F5C\u3057\u307E\u3059\u3002");
    return null;
  }
  PAYPAYOPA.Configure({
    clientId: process.env.PAYPAY_API_KEY,
    clientSecret: process.env.PAYPAY_API_SECRET,
    merchantId: process.env.PAYPAY_MERCHANT_ID,
    productionMode: false
    // サンドボックス環境。本番環境の場合はtrueに変更
  });
  return PAYPAYOPA;
}
async function createPayment(orderId, amount, orderDescription, origin) {
  const payPayInstance = initializePayPay();
  if (!payPayInstance) {
    console.log(`\u30C7\u30E2\u30E2\u30FC\u30C9: \u6CE8\u6587ID ${orderId} \u306E\u652F\u6255\u3044QR\u30B3\u30FC\u30C9\u3092\u751F\u6210`);
    return {
      status: "SUCCESS",
      data: {
        paymentId: `demo-${randomUUID()}`,
        // 一意のIDを生成
        merchantPaymentId: orderId,
        deepLink: "https://example.com/demo-paypay",
        // デモ用ディープリンク
        // PayPay公式SDKのサンプルQRコード画像
        url: "https://raw.githubusercontent.com/PayPay/paypayopa-sdk-node/master/resources/default_qrcode.png"
      }
    };
  }
  try {
    const payload = {
      merchantPaymentId: orderId,
      amount: {
        amount,
        currency: "JPY"
      },
      orderDescription,
      redirectUrl: `${origin || FRONTEND_URL}/api/payments/paypay/completed/${orderId}`,
      // 決済完了後のリダイレクト先
      redirectType: "WEB_LINK",
      codeType: "ORDER_QR"
    };
    return await payPayInstance.QRCodeCreate(payload);
  } catch (error) {
    console.error("PayPay QR\u30B3\u30FC\u30C9\u4F5C\u6210\u30A8\u30E9\u30FC:", error);
    throw error;
  }
}
async function getPaymentDetails(merchantPaymentId) {
  const payPayInstance = initializePayPay();
  if (!payPayInstance) {
    console.log(`\u30C7\u30E2\u30E2\u30FC\u30C9: \u6CE8\u6587ID ${merchantPaymentId} \u306E\u652F\u6255\u3044\u72B6\u614B\u3092\u53D6\u5F97`);
    return {
      status: "SUCCESS",
      data: {
        status: "COMPLETED",
        // 常に決済完了状態を返す
        paymentId: `demo-${randomUUID()}`,
        refunds: [],
        // 返金データ（デモでは空）
        merchantPaymentId
      }
    };
  }
  try {
    return await payPayInstance.GetCodePaymentDetails([merchantPaymentId]);
  } catch (error) {
    console.error("PayPay \u652F\u6255\u3044\u8A73\u7D30\u53D6\u5F97\u30A8\u30E9\u30FC:", error);
    throw error;
  }
}

// routes/payments.ts
import { storage as storage2 } from "server/storage";
var router6 = express6.Router();
router6.post("/api/payments/paypay/create", isAuthenticated, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "\u5FC5\u9808\u30D1\u30E9\u30E1\u30FC\u30BF\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059" });
    }
    const order = await storage2.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "\u6CE8\u6587\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
    }
    const description = `\u5473\u5E97\u713C\u30DE\u30F3\u6CE8\u6587 #${order.callNumber}`;
    const response = await createPayment(orderId, order.total, description, req.header("Origin"));
    res.json(response);
  } catch (error) {
    console.error("PayPay QR\u30B3\u30FC\u30C9\u751F\u6210\u30A8\u30E9\u30FC:", error);
    res.status(500).json({
      message: "\u652F\u6255\u3044\u51E6\u7406\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router6.get("/api/payments/paypay/completed/:merchantPaymentId", async (req, res) => {
  try {
    const { merchantPaymentId } = req.params;
    if (!merchantPaymentId) {
      return res.status(400).json({ message: "merchantPaymentId\u304C\u5FC5\u8981\u3067\u3059" });
    }
    const response = await getPaymentDetails(merchantPaymentId);
    if (response.BODY.data.status === "COMPLETED") {
      const order = await storage2.updateOrderStatus(merchantPaymentId, "paid");
      if (!order) {
        return res.status(404).json({ message: "\u6CE8\u6587\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
      }
      await storage2.clearCart(order.userId);
      res.redirect(`/pickup/${order.id}`);
    } else {
      res.redirect("/failure");
    }
  } catch (error) {
    console.error("PayPay\u30EA\u30C0\u30A4\u30EC\u30AF\u30C8\u30A8\u30E9\u30FC:", error);
    res.status(500).json({
      message: "\u30EA\u30C0\u30A4\u30EC\u30AF\u30C8\u51E6\u7406\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router6.get("/api/payments/paypay/status/:merchantPaymentId", isAuthenticated, async (req, res) => {
  try {
    const { merchantPaymentId } = req.params;
    const response = await getPaymentDetails(merchantPaymentId);
    res.json(response);
  } catch (error) {
    console.error("PayPay \u652F\u6255\u3044\u72B6\u614B\u78BA\u8A8D\u30A8\u30E9\u30FC:", error);
    res.status(500).json({
      message: "\u652F\u6255\u3044\u72B6\u614B\u78BA\u8A8D\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var payments_default = router6;

// routes/products.ts
import express7 from "express";
var router7 = express7.Router();
router7.get("/api/products", async (req, res) => {
  try {
    const products2 = await storage.getProducts();
    res.json(products2);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
var products_default = router7;

// routes/timeslots.ts
import express8 from "express";
var router8 = express8.Router();
router8.get("/api/timeslots", async (req, res) => {
  try {
    const timeSlots2 = await storage.getTimeSlots();
    res.json(timeSlots2);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
var timeslots_default = router8;

// routes.ts
dotenv2.config();
async function registerRoutes(app2) {
  configurePassport(app2);
  app2.use("/", admin_default);
  app2.use("/", auth_default);
  app2.use("/", cart_default);
  app2.use("/", feedback_default);
  app2.use("/", orders_default);
  app2.use("/", payments_default);
  app2.use("/", products_default);
  app2.use("/", timeslots_default);
  const httpServer = createServer(app2);
  return httpServer;
}

// vite.ts
import express9 from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = path.resolve(__dirname, "../../dist/public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express9.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
async function setupVite(app2, _server) {
  app2.use("*", (req, res) => {
    const clientDevUrl = "http://localhost:5173" + req.originalUrl;
    log(`Proxying request to client dev server: ${clientDevUrl}`);
    res.redirect(clientDevUrl);
  });
}

// index.ts
var app = express10();
app.use(express10.json());
app.use(express10.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 3e3;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
