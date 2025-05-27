/**
 * repositories/cartRepository.ts
 * 
 * カート関連のデータアクセスを担当するリポジトリ
 * IStorageインターフェースをラップして、カートドメイン特化のメソッドを提供します。
 */

import type { IStorage } from "../../storage/istorage";
import { 
  CartItem,
  CartItemWithProduct,
  InsertCartItem
} from "../models";
import { storage } from "../../storage/index";

/**
 * カートリポジトリクラス
 * データストレージへのアクセスを抽象化し、カート関連の操作を提供します
 */
export class CartRepository {
  private storage: IStorage;
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * ユーザーのカートアイテムを取得します
   * @param userId ユーザーID
   * @returns カートアイテムのリスト（商品情報付き）
   */
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    return this.storage.getCartItems(userId);
  }

  /**
   * 特定のカートアイテムを取得します
   * @param userId ユーザーID
   * @param productId 商品ID
   * @returns カートアイテム、存在しない場合はundefined
   */
  async getCartItem(userId: string, productId: string): Promise<CartItem | undefined> {
    return this.storage.getCartItem(userId, productId);
  }

  /**
   * カートに商品を追加します
   * @param item 追加するカートアイテム
   * @returns 追加されたカートアイテム
   */
  async addToCart(item: InsertCartItem): Promise<CartItem> {
    return this.storage.addToCart(item);
  }

  /**
   * カートアイテムの数量を更新します
   * @param id カートアイテムID
   * @param quantity 新しい数量
   * @returns 更新されたカートアイテム、存在しない場合はundefined
   */
  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    return this.storage.updateCartItemQuantity(id, quantity);
  }

  /**
   * カートアイテムを削除します
   * @param id カートアイテムID
   */
  async deleteCartItem(id: string): Promise<void> {
    return this.storage.deleteCartItem(id);
  }

  /**
   * ユーザーのカートを空にします
   * @param userId ユーザーID
   */
  async clearCart(userId: string): Promise<void> {
    return this.storage.clearCart(userId);
  }
}

export const cartRepository = new CartRepository(storage);
