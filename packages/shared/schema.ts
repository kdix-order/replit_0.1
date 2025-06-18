import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// TODO: onDeleteの動作が適当なので、監査などの都合で残しておきたい場合は他の動作を指定する

// User model
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true,
});

// Product model
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in yen
  image: text("image").notNull(),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  image: true,
});

// Cart item model
export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  size: text("size").notNull().default("普通"),
  customizations: jsonb("customizations").default([]),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
  size: true,
  customizations: true,
}) as unknown as z.ZodObject<{
  userId: z.ZodString;
  productId: z.ZodString;
  quantity: z.ZodNumber;
  size: z.ZodString;
  customizations: z.ZodType<any>;
}>;

// Time slot model
export const timeSlots = pgTable("time_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  time: text("time").notNull(), // Format: HH:MM
  capacity: integer("capacity").notNull(),
  available: integer("available").notNull(),
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).pick({
  time: true,
  capacity: true,
  available: true,
});

// Order model
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  callNumber: serial("call_number").notNull(),
  status: text("status").notNull().default("new"), // new, paid, preparing, completed
  total: integer("total").notNull(), // Total price in yen
  timeSlotId: uuid("time_slot_id").notNull().references(() => timeSlots.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  items: jsonb("items").notNull(), // Array of order items
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  total: true,
  timeSlotId: true,
  items: true,
}) as unknown as z.ZodObject<{
  userId: z.ZodString;
  status: z.ZodString;
  total: z.ZodNumber;
  timeSlotId: z.ZodString;
  items: z.ZodType<any>;
}>;

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;

export type Order = typeof orders.$inferSelect;
// itemsがnull許容されているため、型定義を調整
export type InsertOrder = z.infer<typeof insertOrderSchema> & { items: any };

// Additional types for API responses
export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type TimeSlotWithAvailability = TimeSlot & {
  isFull: boolean;
};

export type OrderWithTimeSlot = Order & {
  timeSlot: TimeSlot;
};

// Auth types
export type GoogleUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export const feedback = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  sentiment: text("sentiment", { enum: ["positive", "negative"] }).notNull(),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  userId: true,
  orderId: true,
  sentiment: true,
  rating: true,
  comment: true,
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

// Product customization options
export const SIZES = ["ガールズサイズ", "並", "ご飯大", "おかず大", "大大"] as const;
export type Size = typeof SIZES[number];

export const CUSTOMIZATION_OPTIONS = [
  { id: "no_egg", label: "玉子抜き" },
  { id: "no_onion", label: "玉ねぎ抜き" },
  { id: "extra_sauce", label: "ソース増量" },
  { id: "less_sauce", label: "ソース少なめ" },
  { id: "extra_spicy", label: "辛さ増し" },
  { id: "less_spicy", label: "辛さ控えめ" }
] as const;

export type CustomizationOption = {
  id: string;
  label: string;
};

// 店舗設定モデル
export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  acceptingOrders: boolean("accepting_orders").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStoreSettingsSchema = createInsertSchema(storeSettings).pick({
  acceptingOrders: true,
});

export type StoreSetting = typeof storeSettings.$inferSelect;
export type InsertStoreSetting = z.infer<typeof insertStoreSettingsSchema>;
