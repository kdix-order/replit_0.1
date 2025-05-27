/**
 * controllers/cart/CartController.ts
 * 
 * カート関連のHTTPリクエスト処理を担当するコントローラー
 * サービス層を利用してビジネスロジックを実行し、HTTPレスポンスを返します。
 */

import { Request, Response } from "express";
import { cartService } from "../../services/cart/CartService";
import { asyncHandler } from "../../middlewares/error";
import { insertCartItemSchema } from "../../models";
import { z } from "zod";

/**
 * 認証済みリクエスト型定義
 */
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}

/**
 * カートコントローラークラス
 * カート関連のHTTPリクエスト処理を提供します
 */
export class CartController {
  /**
   * ユーザーのカートアイテムを取得します
   */
  getCartItems = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const cartItems = await cartService.getCartItems(req.user.id);
    res.json(cartItems);
  });

  /**
   * カートに商品を追加します
   */
  addToCart = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const schema = insertCartItemSchema.extend({
        productId: z.string(),
        quantity: z.number().min(1),
        size: z.string().default("並"),
        customizations: z.array(z.string()).default([])
      });

      const validatedData = schema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const cartItem = await cartService.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        throw error;
      }
    }
  });

  /**
   * カートアイテムの数量を更新します
   */
  updateCartItemQuantity = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const { quantity } = req.body;

      if (typeof quantity !== "number" || quantity < 0) {
        res.status(400).json({ message: "無効な数量です" });
        return;
      }

      if (quantity === 0) {
        await cartService.deleteCartItem(id);
        res.status(204).send();
        return;
      }

      const updatedItem = await cartService.updateCartItemQuantity(id, quantity);
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof Error && error.message === "Cart item not found") {
        res.status(404).json({ message: "カートアイテムが見つかりません" });
      } else if (error instanceof Error && error.message === "Item removed from cart") {
        res.status(204).send();
      } else {
        throw error;
      }
    }
  });

  /**
   * カートアイテムを削除します
   */
  deleteCartItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = req.params.id;
    await cartService.deleteCartItem(id);
    res.status(204).send();
  });

  /**
   * ユーザーのカートを空にします
   */
  clearCart = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id;
    await cartService.clearCart(userId);
    res.status(204).send();
  });

  /**
   * カートの合計金額を計算します
   */
  calculateCartTotal = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id;
    const cartItems = await cartService.getCartItems(userId);
    
    const total = cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    res.json({ total });
  });
}

export const cartController = new CartController();
