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
import { and, eq, isNotNull, notInArray } from "drizzle-orm";
import dotenv from "dotenv";
import { randomUUID } from "crypto";

export class PgStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
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
    try {
      const rows = await this.db
        .select({
          id: timeSlots.id,
          time: timeSlots.time,
          capacity: timeSlots.capacity,
          available: timeSlots.available
        })
        .from(timeSlots)
        .where(eq(timeSlots.id, id));
      
      if (rows.length === 0) return undefined;
      
      return { ...rows[0], disabled: false };
    } catch (error) {
      console.error('Error fetching time slot:', error);
      return undefined;
    }
  }

  async getTimeSlots(): Promise<TimeSlotWithAvailability[]> {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const rows = await this.db
        .select({
          id: timeSlots.id,
          time: timeSlots.time,
          capacity: timeSlots.capacity,
          available: timeSlots.available
        })
        .from(timeSlots);
      
      return rows.map(row => {
        const timeStart = row.time.split('-')[0];
        const [hour, minute] = timeStart.split(':').map(num => parseInt(num, 10));
        
        const isPast = (hour < currentHour) || (hour === currentHour && minute <= currentMinute);
        
        const result: TimeSlotWithAvailability = {
          id: row.id,
          time: row.time,
          capacity: row.capacity,
          available: row.available,
          isFull: row.available <= 0,
          isPast,
          disabled: false // Add this property in memory only
        };
        
        return result;
      });
    } catch (error) {
      console.error('Error fetching time slots:', error);
      return [];
    }
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
  
  async updateTimeSlotCapacity(id: string, capacity: number): Promise<TimeSlot | undefined> {
    try {
      const slot = await this.getTimeSlot(id);
      if (!slot) return undefined;
      
      const reservedCount = slot.capacity - slot.available;
      
      const newCapacity = Math.max(capacity, reservedCount);
      
      const newAvailable = newCapacity - reservedCount;
      
      const [updated] = await this.db
        .update(timeSlots)
        .set({ 
          capacity: newCapacity,
          available: newAvailable
        })
        .where(eq(timeSlots.id, id))
        .returning();
      
      return updated;
    } catch (error) {
      console.error('Error updating time slot capacity:', error);
      return undefined;
    }
  }

  async disableTimeSlot(id: string): Promise<TimeSlot | undefined> {
    try {
      const rows = await this.db
        .select({
          id: timeSlots.id,
          time: timeSlots.time,
          capacity: timeSlots.capacity,
          available: timeSlots.available
        })
        .from(timeSlots)
        .where(eq(timeSlots.id, id));
      
      const slot = rows[0];
      if (!slot) return undefined;
      
      const existingOrders = await this.db
        .select()
        .from(orders)
        .where(eq(orders.timeSlotId, id));
      
      if (existingOrders.length > 0) {
        console.log(`Time slot ${id} has ${existingOrders.length} existing orders. Marking as disabled but preserving reservations.`);
      }
      
      return { ...slot, disabled: true };
    } catch (error) {
      console.error('Error disabling time slot:', error);
      return undefined;
    }
  }

  async enableTimeSlot(id: string): Promise<TimeSlot | undefined> {
    try {
      const rows = await this.db
        .select({
          id: timeSlots.id,
          time: timeSlots.time,
          capacity: timeSlots.capacity,
          available: timeSlots.available
        })
        .from(timeSlots)
        .where(eq(timeSlots.id, id));
      
      const slot = rows[0];
      if (!slot) return undefined;
      
      return { ...slot, disabled: false };
    } catch (error) {
      console.error('Error enabling time slot:', error);
      return undefined;
    }
  }
  
  async resetTimeSlots(): Promise<void> {
    try {
      // 既存の時間枠を削除
      const existingTimeSlotsWithOrders = await this.db
        .select({
          id: timeSlots.id
        })
        .from(timeSlots)
        .leftJoin(orders, eq(orders.timeSlotId, timeSlots.id))
        .where(isNotNull(orders.id));
      
      const timeSlotIdsWithOrders = new Set(existingTimeSlotsWithOrders.map(slot => slot.id));
      
      // 注文がない時間枠のみを削除する
      await this.db
        .delete(timeSlots)
        .where(
          notInArray(
            timeSlots.id, 
            Array.from(timeSlotIdsWithOrders)
          )
        );
      
      // 新しい時間枠を作成
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      for (let hour = 10; hour < 19; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
          // 既に存在する時間枠はスキップ
          const startHour = hour.toString().padStart(2, '0');
          const startMinute = minute.toString().padStart(2, '0');
          const endHour = (minute === 50) ? (hour + 1).toString().padStart(2, '0') : startHour;
          const endMinute = (minute === 50) ? '00' : (minute + 10).toString().padStart(2, '0');
          const time = `${startHour}:${startMinute}-${endHour}:${endMinute}`;
          
          // 既存の時間枠をチェック
          const existingSlots = await this.db
            .select()
            .from(timeSlots)
            .where(eq(timeSlots.time, time));
          
          if (existingSlots.length === 0) {
            const capacity = 10;
            const available = Math.floor(Math.random() * 3) + 8;
            
            // 過去の時間枠は作成しない
            const isPast = (hour < currentHour) || (hour === currentHour && minute <= currentMinute);
            if (!isPast) {
              await this.db.insert(timeSlots).values({
                id: randomUUID(),
                time,
                capacity,
                available
              });
            }
          }
        }
      }
      
      console.log('Time slots reset successfully');
    } catch (error) {
      console.error('Error resetting time slots:', error);
    }
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
}

export const storage = new PgStorage();
