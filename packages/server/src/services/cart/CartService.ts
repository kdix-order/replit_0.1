/**
 * services/cart/CartService.ts
 * 
 * カート関連のビジネスロジックを担当するサービス
 * リポジトリ層を利用してデータアクセスを行い、ビジネスルールを適用します。
 */

import { cartRepository } from "../../repositories/cartRepository";
import { productService } from "../productService";
import { 
  CartItem, 
  CartItemWithProduct, 
  InsertCartItem 
} from "../../models";

/**
 * カートサービスクラス
 * カート関連のビジネスロジックを提供します
 */
export class CartService {
  /**
   * ユーザーのカートアイテムを取得します
   * @param userId ユーザーID
   * @returns カートアイテムのリスト（商品情報付き）
   */
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    return cartRepository.getCartItems(userId);
  }

  /**
   * カートに商品を追加します
   * @param item 追加するカートアイテム
   * @returns 追加されたカートアイテム
   * @throws 商品が存在しない場合、または在庫が不足している場合
   */
  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const isAvailable = await productService.checkProductAvailability(
      item.productId, 
      item.quantity
    );
    
    if (!isAvailable) {
      throw new Error("Product is not available in the requested quantity");
    }
    
    const existingItem = await cartRepository.getCartItem(item.userId, item.productId);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + item.quantity;
      const updatedItem = await cartRepository.updateCartItemQuantity(existingItem.id, newQuantity);
      if (!updatedItem) {
        throw new Error("Failed to update cart item");
      }
      return updatedItem;
    }
    
    return cartRepository.addToCart(item);
  }

  /**
   * カートアイテムの数量を更新します
   * @param id カートアイテムID
   * @param quantity 新しい数量
   * @returns 更新されたカートアイテムまたは操作結果
   * @throws 数量が無効な場合
   */
  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | { success: boolean; message: string }> {
    if (quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }
    
    if (quantity === 0) {
      await cartRepository.deleteCartItem(id);
      return { success: true, message: "Item removed from cart" };
    }
    
    const updatedItem = await cartRepository.updateCartItemQuantity(id, quantity);
    
    if (!updatedItem) {
      throw new Error("Cart item not found");
    }
    
    return updatedItem;
  }

  /**
   * カートアイテムを削除します
   * @param id カートアイテムID
   */
  async deleteCartItem(id: string): Promise<void> {
    return cartRepository.deleteCartItem(id);
  }

  /**
   * ユーザーのカートを空にします
   * @param userId ユーザーID
   */
  async clearCart(userId: string): Promise<void> {
    return cartRepository.clearCart(userId);
  }
}

export const cartService = new CartService();
