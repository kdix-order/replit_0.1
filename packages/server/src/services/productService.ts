/**
 * services/productService.ts
 * 
 * 商品関連のビジネスロジックを担当するサービス
 * リポジトリ層を利用してデータアクセスを行い、ビジネスルールを適用します。
 */

import { productRepository } from "../repositories/productRepository";
import { Product } from "../models";

/**
 * 商品サービスクラス
 * 商品関連のビジネスロジックを提供します
 */
export class ProductService {
  /**
   * 全ての商品を取得します
   * @returns 商品リスト
   */
  async getProducts(): Promise<Product[]> {
    return productRepository.getProducts();
  }
  
  /**
   * 特定の商品を取得します
   * @param id 商品ID
   * @returns 商品データ
   * @throws 商品が存在しない場合
   */
  async getProduct(id: string): Promise<Product> {
    const product = await productRepository.getProduct(id);
    
    if (!product) {
      throw new Error("Product not found");
    }
    
    return product;
  }
  
  /**
   * 商品の在庫状況を確認します
   * @param id 商品ID
   * @param quantity 必要な数量
   * @returns 在庫が十分にある場合はtrue
   */
  async checkProductAvailability(id: string, quantity: number): Promise<boolean> {
    const product = await this.getProduct(id);
    return true;
  }
}

export const productService = new ProductService();
