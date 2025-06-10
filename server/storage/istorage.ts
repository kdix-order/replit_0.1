import type {
    CartItem,
    CartItemWithProduct,
    InsertCartItem, InsertOrder,
    InsertUser, Order, OrderWithTimeSlot,
    Product, StoreSetting, TimeSlot,
    TimeSlotWithAvailability,
    User, OrderStatusHistory
} from "@shared/schema";

export interface IStorage {
    // User methods
    getUser(id: string): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;

    // Product methods
    getProducts(): Promise<Product[]>;
    getProduct(id: string): Promise<Product | undefined>;

    // Cart methods
    getCartItems(userId: string): Promise<CartItemWithProduct[]>;
    getCartItem(userId: string, productId: string): Promise<CartItem | undefined>;
    addToCart(item: InsertCartItem): Promise<CartItem>;
    updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined>;
    deleteCartItem(id: string): Promise<void>;
    clearCart(userId: string): Promise<void>;

    // Time slot methods
    getTimeSlots(): Promise<TimeSlotWithAvailability[]>;
    getTimeSlot(id: string): Promise<TimeSlot | undefined>;
    updateTimeSlotAvailability(id: string, available: number): Promise<TimeSlot | undefined>;

    // Order methods
    createOrder(order: InsertOrder): Promise<Order>;
    getOrders(): Promise<OrderWithTimeSlot[]>;
    getOrdersByUser(userId: string): Promise<OrderWithTimeSlot[]>;
    getOrder(id: string): Promise<Order | undefined>;
    updateOrderStatus(id: string, status: string, changedBy: string, reason?: string): Promise<Order | undefined>;
    getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]>;


    // Store settings methods
    getStoreSettings(): Promise<StoreSetting>;
    updateStoreSettings(acceptingOrders: boolean): Promise<StoreSetting>;
}
