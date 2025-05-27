/**
 * controllers/auth/AuthController.ts
 * 
 * 認証関連のHTTPリクエスト処理を担当するコントローラー
 * サービス層を利用してビジネスロジックを実行し、HTTPレスポンスを返します。
 */

import { Request, Response } from "express";
import { authService } from "../../services/auth/AuthService";
import { asyncHandler } from "../../middlewares/error";
import { z } from "zod";
import { AuthenticatedRequest } from "../../middlewares/auth";
import passport from "passport";

/**
 * 認証コントローラークラス
 * 認証関連のHTTPリクエスト処理を提供します
 */
export class AuthController {
  /**
   * ユーザー登録を処理します
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const schema = z.object({
        username: z.string().min(3).max(50),
        email: z.string().email(),
        password: z.string().min(6),
        isAdmin: z.boolean().optional().default(false),
      });

      const validatedData = schema.parse(req.body);
      const result = await authService.register(validatedData);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        throw error;
      }
    }
  });

  /**
   * ユーザーログインを処理します
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string(),
      });

      const { email, password } = schema.parse(req.body);
      const result = await authService.login(email, password);

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else if (error instanceof Error) {
        res.status(401).json({ message: error.message });
      } else {
        throw error;
      }
    }
  });

  /**
   * Google OAuth認証を開始します
   */
  googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });

  /**
   * Google OAuth認証のコールバックを処理します
   */
  googleAuthCallback = [
    passport.authenticate("google", {
      failureRedirect: "/?auth_error=true",
      failureMessage: "認証に失敗しました。許可されたメールアドレスでログインしてください。"
    }),
    (req: Request, res: Response) => {
      const user = req.user as any;
      const token = authService.generateToken(user.id);
      res.redirect(`/?token=${token}`);
    }
  ];

  /**
   * 管理者デモログインを処理します
   */
  adminDemoLogin = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await authService.demoLogin(true);
      res.json(result);
    } catch (error) {
      console.error("Admin demo login error:", error);
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  /**
   * 顧客デモログインを処理します
   */
  customerDemoLogin = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await authService.demoLogin(false);
      res.json(result);
    } catch (error) {
      console.error("Customer demo login error:", error);
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  /**
   * ユーザープロフィールを取得します
   */
  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = await authService.getUserProfile(req.user.id);
      res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "サーバーエラー" });
      }
    }
  });
}

export const authController = new AuthController();
