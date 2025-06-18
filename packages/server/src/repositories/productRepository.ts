/**
 * repositories/productRepository.ts
 * 
 * 商品関連のデータアクセスを担当するリポジトリ
 * IStorageインターフェースをラップして、商品ドメイン特化のメソッドを提供します。
 */

import type { IStorage } from "@/storage/istorage";
import { Product } from "../models";
import { storage } from "@/storage/index";

/**
 * 商品リポジトリクラス
 * データストレージへのアクセスを抽象化し、商品関連の操作を提供します
 */
export class ProductRepository {
  private storage: IStorage;
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }
  
  /**
   * 全ての商品を取得します
   * @returns 商品リスト
   */
  async getProducts(): Promise<Product[]> {
    return this.storage.getProducts();
  }
  
  /**
   * 特定の商品IDの商品を取得します
   * @param id 商品ID
   * @returns 商品データ、存在しない場合はundefined
   */
  async getProduct(id: string): Promise<Product | undefined> {
    return this.storage.getProduct(id);
  }
}

export const productRepository = new ProductRepository(storage);
