import type {
  CartItem,
  CartItemWithProduct,
  InsertCartItem, InsertOrder, InsertProduct, InsertTimeSlot,
  InsertUser, Order, OrderWithTimeSlot,
  Product, StoreSetting, TimeSlot,
  TimeSlotWithAvailability,
  User
} from "../../shared/schema";
import { IStorage } from "./istorage";
import { randomUUID } from "crypto";

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private cartItems: Map<string, CartItem>;
  private timeSlots: Map<string, TimeSlot>;
  private orders: Map<string, Order>;
  private storeSettings!: StoreSetting;

  private callNumberCounter: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.timeSlots = new Map();
    this.orders = new Map();

    // 呼出番号カウンターの初期化 - 201から始まる三桁の番号システム
    // マクドナルドのような呼出番号システム（201〜300で循環）
    // 【編集方法】: 別の範囲を使用したい場合は、この値とgetNextCallNumber()メソッドの
    // リセット条件を合わせて変更してください
    this.callNumberCounter = 201; // 呼出番号の開始値（201）
    
    
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
    // 現在時刻から5分後を最短時間として設定し、10分間隔で時間枠を生成
    const now = new Date();
    // 5分後の時間を計算（ミリ秒単位）
    const fiveMinutesLater = now.getTime() + 5 * 60000;
    // 10分単位に切り上げる（次の10分間隔の時間にする）
    const roundedTime = Math.ceil(fiveMinutesLater / (10 * 60000)) * (10 * 60000);
    
    // 12個の時間枠を生成（2時間分）
    for (let i = 0; i < 12; i++) {
      const slotTime = new Date(roundedTime + i * 10 * 60000);
      const hours = slotTime.getHours();
      const minutes = slotTime.getMinutes();
      const time = `${hours}:${minutes.toString().padStart(2, '0')}`;
      
      // すべての時間枠は最大10名まで
      const capacity = 10;
      // 初期値として8-10人分の空きがあるようにする
      const available = Math.floor(Math.random() * 3) + 8;
      
      this.addTimeSlot({
        time,
        capacity,
        available
      });
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
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

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  private addProduct(insertProduct: InsertProduct): Product {
    const id = randomUUID();
    const product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  // Cart methods
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
    
    return Promise.all(items.map(async item => {
      const product = await this.getProduct(item.productId);
      return { ...item, product: product! };
    }));
  }

  async getCartItem(userId: string, productId: string): Promise<CartItem | undefined> {
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
      const id = randomUUID();
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

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteCartItem(id: string): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(userId: string): Promise<void> {
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

  async getTimeSlot(id: string): Promise<TimeSlot | undefined> {
    return this.timeSlots.get(id);
  }

  async updateTimeSlotAvailability(id: string, available: number): Promise<TimeSlot | undefined> {
    const timeSlot = this.timeSlots.get(id);
    if (!timeSlot) return undefined;
    
    const updatedSlot = { ...timeSlot, available };
    this.timeSlots.set(id, updatedSlot);
    return updatedSlot;
  }

  private addTimeSlot(insertTimeSlot: InsertTimeSlot): TimeSlot {
    const id = randomUUID();
    const timeSlot = { ...insertTimeSlot, id };
    this.timeSlots.set(id, timeSlot);
    return timeSlot;
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order = { 
      ...insertOrder, 
      id,
      status: insertOrder.status || 'new',
      createdAt: new Date(),
      callNumber: await this.getNextCallNumber()
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

  async getOrdersByUser(userId: string): Promise<OrderWithTimeSlot[]> {
    const userOrders = Array.from(this.orders.values())
      .filter(order => order.userId === userId);
    
    return Promise.all(userOrders.map(async order => {
      const timeSlot = await this.getTimeSlot(order.timeSlotId);
      return { ...order, timeSlot: timeSlot! };
    }));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  /**
   * 次の呼出番号を取得するメソッド
   * 
   * 呼出番号は201-300の範囲で循環します。
   * これはマクドナルドのような呼出番号システムで、
   * 番号が多すぎると混乱を招くのを防ぐためです。
   * 
   * 【編集方法】
   * - 番号の範囲を変更したい場合は、以下の条件と初期値を変更してください
   * - initializeData()メソッド内のthis.callNumberCounter初期値も同様に変更する必要があります
   * 
   * @returns 次の利用可能な呼出番号（201-300の範囲）
   */
  async getNextCallNumber(): Promise<number> {
    // 呼出番号の最大値（300）を超えたら最小値（201）にリセット
    // if (this.callNumberCounter > 300) {
    //   this.callNumberCounter = 201; // 呼出番号の最小値
    // }
    // 現在の番号を返し、カウンターをインクリメント
    return this.callNumberCounter++;
  }

}

export const storage = new MemStorage();
