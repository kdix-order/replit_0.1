import type {
    CartItem,
    CartItemWithProduct, Feedback,
    InsertCartItem, InsertFeedback, InsertOrder,
    InsertUser, Order, OrderWithTimeSlot,
    Product, StoreSetting, TimeSlot,
    TimeSlotWithAvailability,
    User
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
    getAllFeedback(): Promise<Feedback[]>;

    // Store settings methods
    getStoreSettings(): Promise<StoreSetting>;
    updateStoreSettings(acceptingOrders: boolean): Promise<StoreSetting>;
}
