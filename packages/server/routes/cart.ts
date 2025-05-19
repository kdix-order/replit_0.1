/***********************************
 * カート関連のエンドポイント
 ***********************************/

import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import { storage } from "../storage";
import { insertCartItemSchema } from "../../shared/schema";
import { z } from "zod";

const router = express.Router();

// ユーザーのカートアイテム取得
router.get("/api/cart", isAuthenticated, async (req, res) => {
  try {
    const cartItems = await storage.getCartItems(req.user.id);
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/api/cart", isAuthenticated, async (req, res) => {
  try {
    const schema = insertCartItemSchema.extend({
      productId: z.string(),
      quantity: z.number().min(1),
      size: z.string().default("並"),
      customizations: z.array(z.string()).default([])
    });

    const validatedData = schema.parse({
      ...req.body,
      userId: req.user.id,
    });

    const cartItem = await storage.addToCart(validatedData);
    res.status(201).json(cartItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/api/cart/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity < 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    if (quantity === 0) {
      await storage.deleteCartItem(id);
      return res.status(204).send();
    }

    const updatedItem = await storage.updateCartItemQuantity(id, quantity);

    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    await storage.deleteCartItem(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
