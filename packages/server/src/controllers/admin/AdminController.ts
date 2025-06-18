/**
 * controllers/admin/AdminController.ts
 * 
 * 管理者機能関連のHTTPリクエスト処理を担当するコントローラー
 * サービス層を利用してビジネスロジックを実行し、HTTPレスポンスを返します。
 */

import { Request, Response } from "express";
import { adminService } from "../../services/admin/AdminService";
import { asyncHandler } from "../../middlewares/error";

/**
 * 管理者コントローラークラス
 * 管理者機能関連のHTTPリクエスト処理を提供します
 */
export class AdminController {
  /**
   * 全ての注文を取得します
   */
  getOrders = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const orders = await adminService.getOrders();
    res.json(orders);
  });

  /**
   * 注文のステータスを更新します
   */
  updateOrderStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.params.id) {
        res.status(400).json({ message: "無効な注文IDフォーマット" });
        return;
      }

      const id = req.params.id;

      if (!req.body || req.body.status === undefined) {
        res.status(400).json({ message: "ステータスは必須です" });
        return;
      }

      const { status } = req.body;

      const updatedOrder = await adminService.updateOrderStatus(id, status);

      console.log(`注文 ${id} のステータスが "${status}" に更新されました`);
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("見つかりませんでした")) {
          res.status(404).json({ message: error.message });
        } else if (error.message.includes("無効なステータス")) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({
            message: "ステータス更新中にエラーが発生しました",
            error: error.message
          });
        }
      } else {
        throw error;
      }
    }
  });

  /**
   * 店舗設定を取得します（一般ユーザー向け）
   */
  getStoreSettings = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const settings = await adminService.getStoreSettings();
    res.json(settings);
  });

  /**
   * 店舗設定を取得します（管理者向け）
   */
  getAdminStoreSettings = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    try {
      const settings = await adminService.getStoreSettings();
      res.json(settings);
    } catch (error) {
      console.error("店舗設定の取得中にエラーが発生しました:", error);
      res.status(500).json({
        message: "店舗設定の取得中にエラーが発生しました",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * 店舗設定を更新します
   */
  updateStoreSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { acceptingOrders } = req.body;
      
      const settings = await adminService.updateStoreSettings(acceptingOrders);
      res.json(settings);
    } catch (error) {
      if (error instanceof Error && error.message.includes("ブール値")) {
        res.status(400).json({ message: error.message });
      } else {
        console.error("店舗設定の更新中にエラーが発生しました:", error);
        res.status(500).json({
          message: "店舗設定の更新中にエラーが発生しました",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  });
}

export const adminController = new AdminController();
