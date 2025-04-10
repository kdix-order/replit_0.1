import {
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem, type CartItemWithProduct,
  timeSlots, type TimeSlot, type InsertTimeSlot, type TimeSlotWithAvailability,
  orders, type Order, type InsertOrder, type OrderWithTimeSlot,
  feedback, type Feedback, type InsertFeedback,
  storeSettings, type StoreSetting, type InsertStoreSetting
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  
  // Cart methods
  getCartItems(userId: number): Promise<CartItemWithProduct[]>;
  getCartItem(userId: number, productId: number): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Time slot methods
  getTimeSlots(): Promise<TimeSlotWithAvailability[]>;
  getTimeSlot(id: number): Promise<TimeSlot | undefined>;
  updateTimeSlotAvailability(id: number, available: number): Promise<TimeSlot | undefined>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(): Promise<OrderWithTimeSlot[]>;
  getOrdersByUser(userId: number): Promise<OrderWithTimeSlot[]>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getNextCallNumber(): Promise<number>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackByOrderId(orderId: number): Promise<Feedback | undefined>;
  getFeedbackByUserId(userId: number): Promise<Feedback[]>;
  
  // Store settings methods
  getStoreSettings(): Promise<StoreSetting>;
  updateStoreSettings(acceptingOrders: boolean): Promise<StoreSetting>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private timeSlots: Map<number, TimeSlot>;
  private orders: Map<number, Order>;
  private feedbacks: Map<number, Feedback>;
  private storeSettings!: StoreSetting;
  
  private userIdCounter: number;
  private productIdCounter: number;
  private cartItemIdCounter: number;
  private timeSlotIdCounter: number;
  private orderIdCounter: number;
  private callNumberCounter: number;
  private feedbackIdCounter: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.timeSlots = new Map();
    this.orders = new Map();
    this.feedbacks = new Map();
    
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.timeSlotIdCounter = 1;
    this.orderIdCounter = 1;
    this.callNumberCounter = 100;
    this.feedbackIdCounter = 1;
    
    // 店舗設定の初期化
    this.storeSettings = {
      id: 1,
      acceptingOrders: true,
      updatedAt: new Date()
    };
    
    // Initialize with sample data
    this.initializeData();
  }
  
  // Store settings methods
  async getStoreSettings(): Promise<StoreSetting> {
    return this.storeSettings;
  }
  
  async updateStoreSettings(acceptingOrders: boolean): Promise<StoreSetting> {
    this.storeSettings = {
      ...this.storeSettings,
      acceptingOrders,
      updatedAt: new Date()
    };
    return this.storeSettings;
  }

  private initializeData() {
    // Add sample products
    const sampleProducts: InsertProduct[] = [
      {
        name: 'から丼',
        description: '揚げたてのから揚げをたっぷりと乗せた人気の一品',
        price: 420,
        image: 'https://images.unsplash.com/photo-1580822344078-5b9613767c37?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: 'キムカラ丼',
        description: 'キムチとから揚げの絶妙な組み合わせ。ピリ辛で食欲そそる一品',
        price: 530,
        image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: '鳥塩レモン丼',
        description: 'さっぱりとした塩味と爽やかなレモンの香りが特徴',
        price: 530,
        image: 'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: 'あまから丼',
        description: '甘辛いタレが絡んだ一品。ご飯がすすむ味付け',
        price: 530,
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: '牛カルビ丼',
        description: 'ジューシーな牛カルビをたっぷりと。特製タレで味付け',
        price: 530,
        image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: 'うま煮丼',
        description: '野菜と肉を甘辛く煮込んだうま煮をのせた丼',
        price: 530,
        image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: 'から玉子丼',
        description: 'から揚げと半熟玉子の相性抜群の組み合わせ',
        price: 530,
        image: 'https://images.unsplash.com/photo-1607103058027-4c5238e97a6e?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: '月見カルビ丼',
        description: '当店特製の漬け込み液で味付けした特別なカルビ丼',
        price: 590,
        image: 'https://images.unsplash.com/photo-1602414350227-996eec5d9b25?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: 'デラ丼',
        description: '当店自慢の具材をふんだんに使ったデラックス丼',
        price: 710,
        image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: '天津飯',
        description: 'ふわふわの玉子と特製あんかけのクラシックな一品',
        price: 430,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: 'デラックス天津飯',
        description: '海鮮と具材をたっぷり使った贅沢な天津飯',
        price: 710,
        image: 'https://images.unsplash.com/photo-1617622141533-5df8ef2b19d8?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: 'からあげ2個',
        description: 'トッピング用から揚げ2個',
        price: 90,
        image: 'https://images.unsplash.com/photo-1580822344078-5b9613767c37?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: 'うま煮 2個',
        description: 'トッピング用うま煮2個',
        price: 90,
        image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&w=500&h=300&fit=crop'
      },
      {
        name: 'キムチ',
        description: 'トッピング用キムチ',
        price: 100,
        image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&w=500&h=300&fit=crop'
      }
    ];
    
    sampleProducts.forEach(product => this.addProduct(product));
    
    // Generate time slots
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const slotTime = new Date(now.getTime() + (i + 1) * 10 * 60000);
      const time = `${slotTime.getHours()}:${slotTime.getMinutes().toString().padStart(2, '0')}`;
      const capacity = 10;
      const available = Math.max(0, Math.floor(Math.random() * 10));
      
      this.addTimeSlot({
        time,
        capacity,
        available
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin ?? false 
    };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  private addProduct(insertProduct: InsertProduct): Product {
    const id = this.productIdCounter++;
    const product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
    
    return Promise.all(items.map(async item => {
      const product = await this.getProduct(item.productId);
      return { ...item, product: product! };
    }));
  }

  async getCartItem(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values())
      .find(item => item.userId === userId && item.productId === productId);
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // サイズとカスタマイズが同じ商品が既にカートにあるか確認
    const existingItems = Array.from(this.cartItems.values())
      .filter(item => 
        item.userId === insertItem.userId && 
        item.productId === insertItem.productId
      );
    
    // サイズとカスタマイズが完全に一致するアイテムを検索
    const sameCustomItem = existingItems.find(item => 
      item.size === insertItem.size &&
      JSON.stringify(item.customizations) === JSON.stringify(insertItem.customizations)
    );
    
    if (sameCustomItem) {
      // 全く同じカスタマイズのアイテムがある場合は数量を増やす
      const updatedItem = { 
        ...sameCustomItem, 
        quantity: sameCustomItem.quantity + (insertItem.quantity || 1)
      };
      this.cartItems.set(sameCustomItem.id, updatedItem);
      return updatedItem;
    } else {
      // 新規アイテムとして追加
      const id = this.cartItemIdCounter++;
      const cartItem = { 
        ...insertItem, 
        id,
        quantity: insertItem.quantity || 1,
        size: insertItem.size || '並',
        customizations: insertItem.customizations || []
      };
      this.cartItems.set(id, cartItem);
      return cartItem;
    }
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteCartItem(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<void> {
    const itemsToDelete = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId)
      .map(item => item.id);
    
    itemsToDelete.forEach(id => this.cartItems.delete(id));
  }

  // Time slot methods
  async getTimeSlots(): Promise<TimeSlotWithAvailability[]> {
    return Array.from(this.timeSlots.values()).map(slot => ({
      ...slot,
      isFull: slot.available <= 0
    }));
  }

  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    return this.timeSlots.get(id);
  }

  async updateTimeSlotAvailability(id: number, available: number): Promise<TimeSlot | undefined> {
    const timeSlot = this.timeSlots.get(id);
    if (!timeSlot) return undefined;
    
    const updatedSlot = { ...timeSlot, available };
    this.timeSlots.set(id, updatedSlot);
    return updatedSlot;
  }

  private addTimeSlot(insertTimeSlot: InsertTimeSlot): TimeSlot {
    const id = this.timeSlotIdCounter++;
    const timeSlot = { ...insertTimeSlot, id };
    this.timeSlots.set(id, timeSlot);
    return timeSlot;
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const order = { 
      ...insertOrder, 
      id,
      status: insertOrder.status || 'new',
      createdAt: new Date()
    };
    this.orders.set(id, order);
    
    // Decrease time slot availability
    const timeSlot = await this.getTimeSlot(insertOrder.timeSlotId);
    if (timeSlot && timeSlot.available > 0) {
      await this.updateTimeSlotAvailability(timeSlot.id, timeSlot.available - 1);
    }
    
    return order;
  }

  async getOrders(): Promise<OrderWithTimeSlot[]> {
    const allOrders = Array.from(this.orders.values());
    
    return Promise.all(allOrders.map(async order => {
      const timeSlot = await this.getTimeSlot(order.timeSlotId);
      return { ...order, timeSlot: timeSlot! };
    }));
  }

  async getOrdersByUser(userId: number): Promise<OrderWithTimeSlot[]> {
    const userOrders = Array.from(this.orders.values())
      .filter(order => order.userId === userId);
    
    return Promise.all(userOrders.map(async order => {
      const timeSlot = await this.getTimeSlot(order.timeSlotId);
      return { ...order, timeSlot: timeSlot! };
    }));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getNextCallNumber(): Promise<number> {
    return this.callNumberCounter++;
  }

  // Feedback methods
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.feedbackIdCounter++;
    const feedback = {
      ...insertFeedback,
      id,
      createdAt: new Date(),
      userId: insertFeedback.userId ?? 0,
      sentiment: insertFeedback.sentiment as "positive" | "negative",
      orderId: insertFeedback.orderId ?? null,
      rating: insertFeedback.rating ?? null,
      comment: insertFeedback.comment ?? null
    };
    this.feedbacks.set(id, feedback);
    return feedback;
  }

  async getFeedbackByOrderId(orderId: number): Promise<Feedback | undefined> {
    return Array.from(this.feedbacks.values())
      .find(feedback => feedback.orderId === orderId);
  }

  async getFeedbackByUserId(userId: number): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values())
      .filter(feedback => feedback.userId === userId);
  }
}

export const storage = new MemStorage();
