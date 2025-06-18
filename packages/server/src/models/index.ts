/**
 * models/index.ts
 * 
 * モデル層のエントリーポイント
 * shared/schemaからの型定義とZodスキーマを再エクスポートし、
 * 必要に応じて追加のビジネスモデルを定義します。
 */

import {
  User,
  InsertUser,
  Product,
  Order,
  OrderWithTimeSlot,
  CartItem,
  CartItemWithProduct,
  InsertCartItem,
  Feedback,
  StoreSetting,
  TimeSlot,
  AuthResponse as SharedAuthResponse,
  InsertOrder
} from "../../../shared/schema";

export interface AuthResponse extends SharedAuthResponse {}

export type { 
  User,
  InsertUser,
  Product,
  Order,
  CartItem,
  CartItemWithProduct,
  InsertCartItem,
  Feedback,
  StoreSetting,
  TimeSlot,
  OrderWithTimeSlot,
  InsertOrder
};

import { z } from "zod";

export const insertCartItemSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  options: z.record(z.any()).optional().default({}),
  addedAt: z.string().optional().default(() => new Date().toISOString())
});
