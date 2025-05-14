import { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Process refund for an order
 * 
 * @param req - Express request object containing the order ID in params
 * @param res - Express response object
 */
export async function refund(req: Request, res: Response) {
  try {
    const id = req.params.id;
    
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ message: "注文が見つかりません" });
    }
    
    if (order.status === "completed") {
      return res.status(400).json({ message: "完了済みの注文は返金できません" });
    }
    if (order.status === "refunded") {
      return res.status(400).json({ message: "この注文はすでに返金済みです" });
    }
    
    
    const updatedOrder = await storage.updateOrderStatus(id, "refunded");
    
    if (!updatedOrder) {
      return res.status(500).json({ message: "返金処理に失敗しました" });
    }
    
    const timeSlot = await storage.getTimeSlot(updatedOrder.timeSlotId);
    
    console.log(`Order ${id} has been refunded`);
    
    res.json({ 
      ...updatedOrder, 
      timeSlot,
      message: "返金処理が完了しました" 
    });
  } catch (error) {
    console.error("Refund process error:", error);
    res.status(500).json({
      message: "返金処理中にエラーが発生しました",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
