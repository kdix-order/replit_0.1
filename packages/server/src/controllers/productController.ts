/**
 * controllers/productController.ts
 * 
 * 商品関連のHTTPリクエスト処理を担当するコントローラー
 * サービス層を利用してビジネスロジックを実行し、HTTPレスポンスを返します。
 */

import { Request, Response } from "express";
import { productService } from "../services/productService";
import { asyncHandler } from "../middlewares/error";

/**
 * 商品コントローラークラス
 * 商品関連のHTTPリクエスト処理を提供します
 */
export class ProductController {
  /**
   * 全ての商品を取得します
   */
  getProducts = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const products = await productService.getProducts();
    res.json(products);
  });
  
  /**
   * 特定の商品を取得します
   */
  getProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await productService.getProduct(id);
      res.json(product);
    } catch (error) {
      if (error instanceof Error && error.message === "Product not found") {
        res.status(404).json({ message: "商品が見つかりません" });
      } else {
        throw error;
      }
    }
  });
}

export const productController = new ProductController();
