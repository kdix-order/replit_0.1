import {
  CartItem,
  cartItems,
  CartItemWithProduct,
  Feedback,
  InsertCartItem,
  InsertFeedback,
  InsertOrder,
  InsertProduct,
  InsertTimeSlot,
  InsertUser,
  Order,
  OrderWithTimeSlot,
  Product,
  StoreSetting,
  TimeSlot,
  TimeSlotWithAvailability,
  User,
  feedback as feedbacks,
  orders,
  users,
  products,
  storeSettings,
  timeSlots,
} from "@shared/schema";
import { IStorage } from "./istorage";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import dotenv from "dotenv";
import { randomUUID } from "crypto";

export class PgStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  /**
   * PgStorageクラスのコンストラクタ
   * 
   * @param startCallNumber - 呼出番号の開始値（デフォルト: 201）
   */
  constructor(startCallNumber: number = 201) {
    dotenv.config();
    this.db = drizzle(process.env.DATABASE_URL!);
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [result] = await this.db
      .insert(cartItems)
      .values(item)
      .returning();
    return result;
  }

  async clearCart(userId: string): Promise<void> {
    await this.db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const [result] = await this.db.insert(feedbacks).values(feedback).returning();
    return result;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [result] = await this.db.insert(orders).values(order).returning();
    return result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await this.db.insert(users).values(user).returning();
    return result;
  }

  async deleteCartItem(id: string): Promise<void> {
    await this.db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await this.db.select().from(feedbacks);
  }

  async getCartItem(userId: string, productId: string): Promise<CartItem | undefined> {
    const items = await this.db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    return items[0];
  }

  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const results = await this.db
      .select({
        cartItem: cartItems,
        product: products,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
    // Adjust mapping if your CartItemWithProduct type expects a merged object
    return results.map((row) => ({
      ...row.cartItem,
      product: row.product!,
    }));
  }

  async getFeedbackByOrderId(orderId: string): Promise<Feedback | undefined> {
    const rows = await this.db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.orderId, orderId));
    return rows[0];
  }

  async getFeedbackByUserId(userId: string): Promise<Feedback[]> {
    const rows = await this.db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.userId, userId));
    return rows;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return rows[0];
  }

  async getOrders(): Promise<OrderWithTimeSlot[]> {
    const results = await this.db
      .select({
        order: orders,
        timeSlot: timeSlots,
      })
      .from(orders)
      .leftJoin(timeSlots, eq(orders.timeSlotId, timeSlots.id));
    return results.map((row) => ({
      ...row.order,
      timeSlot: row.timeSlot!,
    }));
  }

  async getOrdersByUser(userId: string): Promise<OrderWithTimeSlot[]> {
    const results = await this.db
      .select({
        order: orders,
        timeSlot: timeSlots,
      })
      .from(orders)
      .leftJoin(timeSlots, eq(orders.timeSlotId, timeSlots.id))
      .where(eq(orders.userId, userId));
    return results.map((row) => ({
      ...row.order,
      timeSlot: row.timeSlot!,
    }));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return rows[0];
  }

  async getProducts(): Promise<Product[]> {
    return await this.db.select().from(products);
  }

  async getStoreSettings(): Promise<StoreSetting> {
    const rows = await this.db.select().from(storeSettings);
    return rows[0];
  }

  async getTimeSlot(id: string): Promise<TimeSlot | undefined> {
    const rows = await this.db
      .select()
      .from(timeSlots)
      .where(eq(timeSlots.id, id));
    return rows[0];
  }

  async getTimeSlots(): Promise<TimeSlotWithAvailability[]> {
    return await this.db.select().from(timeSlots)
      .then(rows => rows.map(row => ({
        ...row,
        isFull: row.available <= 0
      })));
  }

  async getUser(id: string): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.id, id));
    return rows[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.email, email));
    return rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.username, username));
    return rows[0];
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await this.db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updated] = await this.db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async updateStoreSettings(acceptingOrders: boolean): Promise<StoreSetting> {
    const [updated] = await this.db
      .update(storeSettings)
      .set({ acceptingOrders })
      .returning();
    return updated;
  }

  async updateTimeSlotAvailability(id: string, available: number): Promise<TimeSlot | undefined> {
    const [updated] = await this.db
      .update(timeSlots)
      .set({ available })
      .where(eq(timeSlots.id, id))
      .returning();
    return updated;
  }

  async addProduct(insertProduct: InsertProduct): Promise<Product> {
    const [result] = await this.db
        .insert(products)
        .values(insertProduct)
        .returning();
    return result;
  }

  async addTimeSlot(insertTimeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const [result] = await this.db
        .insert(timeSlots)
        .values(insertTimeSlot)
        .returning();
    return result;
  }

  async getNextCallNumber(): Promise<number> {
    throw new Error("getNextCallNumber not implemented for PgStorage");
  }

  // resetCallNumberメソッドを削除 - テスト分離のためにコンストラクタパラメータを使用
}
