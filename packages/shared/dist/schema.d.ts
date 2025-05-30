import { z } from "zod";
export declare const users: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "users";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "users";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        username: import("drizzle-orm/pg-core").PgColumn<{
            name: "username";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        password: import("drizzle-orm/pg-core").PgColumn<{
            name: "password";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        email: import("drizzle-orm/pg-core").PgColumn<{
            name: "email";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        isAdmin: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_admin";
            tableName: "users";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertUserSchema: z.ZodObject<Pick<{
    id: z.ZodOptional<z.ZodString>;
    username: z.ZodString;
    password: z.ZodString;
    email: z.ZodString;
    isAdmin: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
}, "username" | "password" | "email" | "isAdmin">, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    email: string;
    isAdmin?: boolean | null | undefined;
}, {
    username: string;
    password: string;
    email: string;
    isAdmin?: boolean | null | undefined;
}>;
export declare const products: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "products";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "products";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "products";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "products";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        price: import("drizzle-orm/pg-core").PgColumn<{
            name: "price";
            tableName: "products";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        image: import("drizzle-orm/pg-core").PgColumn<{
            name: "image";
            tableName: "products";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertProductSchema: z.ZodObject<Pick<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
    image: z.ZodString;
}, "name" | "description" | "price" | "image">, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    price: number;
    image: string;
}, {
    name: string;
    description: string;
    price: number;
    image: string;
}>;
export declare const cartItems: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "cart_items";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "cart_items";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "cart_items";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        productId: import("drizzle-orm/pg-core").PgColumn<{
            name: "product_id";
            tableName: "cart_items";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        quantity: import("drizzle-orm/pg-core").PgColumn<{
            name: "quantity";
            tableName: "cart_items";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        size: import("drizzle-orm/pg-core").PgColumn<{
            name: "size";
            tableName: "cart_items";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        customizations: import("drizzle-orm/pg-core").PgColumn<{
            name: "customizations";
            tableName: "cart_items";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertCartItemSchema: z.ZodObject<{
    userId: z.ZodString;
    productId: z.ZodString;
    quantity: z.ZodNumber;
    size: z.ZodString;
    customizations: z.ZodType<any>;
}>;
export declare const timeSlots: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "time_slots";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "time_slots";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        time: import("drizzle-orm/pg-core").PgColumn<{
            name: "time";
            tableName: "time_slots";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        capacity: import("drizzle-orm/pg-core").PgColumn<{
            name: "capacity";
            tableName: "time_slots";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        available: import("drizzle-orm/pg-core").PgColumn<{
            name: "available";
            tableName: "time_slots";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertTimeSlotSchema: z.ZodObject<Pick<{
    id: z.ZodOptional<z.ZodString>;
    time: z.ZodString;
    capacity: z.ZodNumber;
    available: z.ZodNumber;
}, "time" | "capacity" | "available">, "strip", z.ZodTypeAny, {
    time: string;
    capacity: number;
    available: number;
}, {
    time: string;
    capacity: number;
    available: number;
}>;
export declare const orders: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "orders";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "orders";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "orders";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        callNumber: import("drizzle-orm/pg-core").PgColumn<{
            name: "call_number";
            tableName: "orders";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "orders";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        total: import("drizzle-orm/pg-core").PgColumn<{
            name: "total";
            tableName: "orders";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        timeSlotId: import("drizzle-orm/pg-core").PgColumn<{
            name: "time_slot_id";
            tableName: "orders";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "orders";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        items: import("drizzle-orm/pg-core").PgColumn<{
            name: "items";
            tableName: "orders";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertOrderSchema: z.ZodObject<{
    userId: z.ZodString;
    status: z.ZodString;
    total: z.ZodNumber;
    timeSlotId: z.ZodString;
    items: z.ZodType<any>;
}>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type CartItemWithProduct = CartItem & {
    product: Product;
};
export type TimeSlotWithAvailability = TimeSlot & {
    isFull: boolean;
};
export type OrderWithTimeSlot = Order & {
    timeSlot: TimeSlot;
};
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
export declare const feedback: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "feedback";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        orderId: import("drizzle-orm/pg-core").PgColumn<{
            name: "order_id";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        sentiment: import("drizzle-orm/pg-core").PgColumn<{
            name: "sentiment";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgText";
            data: "positive" | "negative";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["positive", "negative"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        rating: import("drizzle-orm/pg-core").PgColumn<{
            name: "rating";
            tableName: "feedback";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        comment: import("drizzle-orm/pg-core").PgColumn<{
            name: "comment";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "feedback";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertFeedbackSchema: z.ZodObject<Pick<{
    id: z.ZodOptional<z.ZodString>;
    userId: z.ZodString;
    orderId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sentiment: z.ZodEnum<["positive", "negative"]>;
    rating: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    comment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "userId" | "orderId" | "sentiment" | "rating" | "comment">, "strip", z.ZodTypeAny, {
    userId: string;
    sentiment: "positive" | "negative";
    orderId?: string | null | undefined;
    rating?: number | null | undefined;
    comment?: string | null | undefined;
}, {
    userId: string;
    sentiment: "positive" | "negative";
    orderId?: string | null | undefined;
    rating?: number | null | undefined;
    comment?: string | null | undefined;
}>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export declare const SIZES: readonly ["ガールズサイズ", "並", "ご飯大", "おかず大", "大大"];
export type Size = typeof SIZES[number];
export declare const CUSTOMIZATION_OPTIONS: readonly [{
    readonly id: "no_egg";
    readonly label: "玉子抜き";
}, {
    readonly id: "no_onion";
    readonly label: "玉ねぎ抜き";
}, {
    readonly id: "extra_sauce";
    readonly label: "ソース増量";
}, {
    readonly id: "less_sauce";
    readonly label: "ソース少なめ";
}, {
    readonly id: "extra_spicy";
    readonly label: "辛さ増し";
}, {
    readonly id: "less_spicy";
    readonly label: "辛さ控えめ";
}];
export type CustomizationOption = {
    id: string;
    label: string;
};
export declare const storeSettings: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "store_settings";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "store_settings";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        acceptingOrders: import("drizzle-orm/pg-core").PgColumn<{
            name: "accepting_orders";
            tableName: "store_settings";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "store_settings";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertStoreSettingsSchema: z.ZodObject<Pick<{
    id: z.ZodOptional<z.ZodNumber>;
    acceptingOrders: z.ZodOptional<z.ZodBoolean>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "acceptingOrders">, "strip", z.ZodTypeAny, {
    acceptingOrders?: boolean | undefined;
}, {
    acceptingOrders?: boolean | undefined;
}>;
export type StoreSetting = typeof storeSettings.$inferSelect;
export type InsertStoreSetting = z.infer<typeof insertStoreSettingsSchema>;
