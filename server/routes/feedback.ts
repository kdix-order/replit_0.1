/***********************************
 * フィードバック関連のエンドポイント
 ***********************************/

import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import { insertFeedbackSchema } from "@shared/schema";
import { z } from "zod";
import { createStorage } from "../storage";
import { isAdminUser } from "../utils/auth";

const storage = createStorage();

const router = express.Router();

// フィードバックの送信
router.post("/api/feedback", isAuthenticated, async (req, res) => {
  try {
    const { orderId, sentiment, rating, comment } = req.body;

    // Validate input
    const schema = insertFeedbackSchema.extend({
      orderId: z.string().optional(),
      sentiment: z.enum(["positive", "negative"]),
      rating: z.number().min(1).max(5).optional(),
      comment: z.string().optional(),
    });

    const validatedData = schema.parse({
      ...req.body,
      userId: req.user!.id,
    });

    // Check if order exists if orderId is provided
    if (orderId) {
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if user owns the order
      if (order.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Check if feedback already exists for this order
      const existingFeedback = await storage.getFeedbackByOrderId(orderId);
      if (existingFeedback) {
        return res.status(400).json({ message: "Feedback already submitted for this order" });
      }
    }

    // Create feedback - createdAt is automatically set through the schema default
    const feedback = await storage.createFeedback(validatedData);

    res.status(201).json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's feedback
router.get("/api/feedback", isAuthenticated, async (req, res) => {
  try {
    const feedback = await storage.getFeedbackByUserId(req.user!.id);
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get feedback for a specific order
router.get("/api/feedback/order/:id", isAuthenticated, async (req, res) => {
  try {
    const orderId = req.params.id;

    // Check if order exists
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order
    if (order.userId !== req.user!.id && !await isAdminUser(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const feedback = await storage.getFeedbackByOrderId(orderId);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
