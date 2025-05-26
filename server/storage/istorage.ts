import type {
    CartItem,
    CartItemWithProduct, Feedback,
    InsertCartItem, InsertFeedback, InsertOrder,
    InsertTimeSlot, InsertUser, Order, OrderWithTimeSlot,
    Product, StoreSetting, TimeSlot,
    TimeSlotWithAvailability,
    User
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
    addTimeSlot(insertTimeSlot: InsertTimeSlot): Promise<TimeSlot>;

    // Order methods
    createOrder(order: InsertOrder): Promise<Order>;
    getOrders(): Promise<OrderWithTimeSlot[]>;
    getOrdersByUser(userId: string): Promise<OrderWithTimeSlot[]>;
    getOrder(id: string): Promise<Order | undefined>;
    updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

    // Feedback methods
    createFeedback(feedback: InsertFeedback): Promise<Feedback>;
    getFeedbackByOrderId(orderId: string): Promise<Feedback | undefined>;
    getFeedbackByUserId(userId: string): Promise<Feedback[]>;
    getAllFeedback(): Promise<Feedback[]>;

    // Store settings methods
    getStoreSettings(): Promise<StoreSetting>;
    updateStoreSettings(acceptingOrders: boolean): Promise<StoreSetting>;
}
