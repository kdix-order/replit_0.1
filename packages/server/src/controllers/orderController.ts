/**
 * controllers/orderController.ts
 * 
 * 注文関連のHTTPリクエスト処理を担当するコントローラー
 * サービス層を利用してビジネスロジックを実行し、HTTPレスポンスを返します。
 */

import { Response } from "express";
import { orderService } from "../services/orderService";
import { orderRepository } from "../repositories/orderRepository";
import { AuthenticatedRequest } from "@/middlewares/auth";

/**
 * 注文コントローラークラス
 * 注文関連のHTTPリクエスト処理を提供します
 */
export class OrderController {
  /**
   * 新しい注文を作成します
   * @param req リクエスト
   * @param res レスポンス
   */
  async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { timeSlotId, paymentMethod } = req.body;
      
      if (!timeSlotId) {
        res.status(400).json({ message: "Invalid time slot" });
        return;
      }
      
      if (!paymentMethod || paymentMethod !== "paypay") {
        res.status(400).json({ message: "Invalid payment method" });
        return;
      }
      
      const order = await orderService.createOrder(req.user!.id, timeSlotId);
      
      const timeSlot = await orderRepository.getTimeSlot(order.timeSlotId);
      
      console.log(`Order confirmed: Call number ${order.callNumber}`);
      
      res.status(201).json({
        ...order,
        callNumber: orderService.formatCallNumber(order.callNumber),
        timeSlot
      });
    } catch (error) {
      console.error("Order creation error:", error);
      
      if (error instanceof Error) {
        const message = error.message;
        
        if (message === "Cart is empty") {
          res.status(400).json({ message });
        } else if (message === "Time slot not found") {
          res.status(404).json({ message });
        } else if (message === "Time slot is full") {
          res.status(400).json({ message });
        } else {
          res.status(500).json({ message: "Server error" });
        }
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  }
  
  /**
   * ユーザーの全注文を取得します
   * @param req リクエスト
   * @param res レスポンス
   */
  async getUserOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orders = await orderService.getOrdersByUser(req.user!.id);
      
      res.json(orders.map(o => ({
        ...o,
        callNumber: orderService.formatCallNumber(o.callNumber)
      })));
    } catch (error) {
      console.error("Orders fetch error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
  
  /**
   * 特定の注文を取得します
   * @param req リクエスト
   * @param res レスポンス
   */
  async getOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const order = await orderService.getOrderById(id, req.user!.id);
      
      const timeSlot = await orderRepository.getTimeSlot(order.timeSlotId);
      
      res.json({
        ...order,
        callNumber: orderService.formatCallNumber(order.callNumber),
        timeSlot
      });
    } catch (error) {
      console.error("Order fetch error:", error);
      
      if (error instanceof Error && error.message === "Order not found") {
        res.status(404).json({ message: "Order not found" });
      } else {
        res.status(500).json({
          message: "注文情報の取得中にエラーが発生しました",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  }
}

export const orderController = new OrderController();
