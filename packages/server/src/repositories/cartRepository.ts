/**
 * repositories/cartRepository.ts
 * 
 * カート関連のデータアクセスを担当するリポジトリ
 * IStorageインターフェースをラップして、カートドメイン特化のメソッドを提供します。
 */

import { storage } from "../../storage";
import type { IStorage } from "../../storage/istorage";
import { 
  CartItemWithProduct 
} from "../models";

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
   * ユーザーのカートを空にします
   * @param userId ユーザーID
   */
  async clearCart(userId: string): Promise<void> {
    return this.storage.clearCart(userId);
  }
}

export const cartRepository = new CartRepository(storage as IStorage);
