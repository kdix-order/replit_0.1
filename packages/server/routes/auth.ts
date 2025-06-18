/***********************************
 * 認証関連のエンドポイント
 ***********************************/

import express from "express";
import passport from "passport";
import { generateToken } from "@/utils/auth";
import { storage } from "@/storage";
import { isAuthenticated } from "../src/middlewares/auth";

const router = express.Router();

// Google OAuth認証の開始エンドポイント
router.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/?auth_error=true",
    failureMessage: "認証に失敗しました。許可されたメールアドレスでログインしてください。"
  }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user.id);

    // Redirect to frontend with token
    res.redirect(`/?token=${token}`);
  }
);

// Admin demo login endpoint
router.post("/api/auth/admin-demo-login", async (req, res) => {
  try {
    // Create or get admin demo user
    let user = await storage.getUserByEmail("admin-demo@example.com");

    if (!user) {
      user = await storage.createUser({
        username: "管理者デモユーザー",
        password: "admin-demo-password",
        email: "admin-demo@example.com",
        isAdmin: true, // Set to true so they can access admin panel
      });
    }

    const token = generateToken(user.id);
    res.json({ token, user: { ...user, password: undefined } });
  } catch (error) {
    console.error("Admin demo login error:", error);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
});

// Customer demo login endpoint
router.post("/api/auth/customer-demo-login", async (req, res) => {
  try {
    // Create or get customer demo user
    let user = await storage.getUserByEmail("customer-demo@example.com");

    if (!user) {
      user = await storage.createUser({
        username: "お客様デモユーザー",
        password: "customer-demo-password",
        email: "customer-demo@example.com",
        isAdmin: false, // Set to false for regular customer access
      });
    }

    const token = generateToken(user.id);
    res.json({ token, user: { ...user, password: undefined } });
  } catch (error) {
    console.error("Demo login error:", error);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
});

router.get("/api/auth/me", isAuthenticated, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send password to client
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;