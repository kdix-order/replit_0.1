/**
 * middlewares/auth.ts
 * 
 * 認証関連のミドルウェア
 * ユーザー認証と権限チェックを提供します。
 */

import { Request, Response, NextFunction } from "express";
import { storage } from "../../storage";
import jwt from "jsonwebtoken";

const JWT_SECRET = () => process.env.JWT_SECRET || "campus-order-jwt-secret";

/**
 * 認証済みリクエスト型定義
 */
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}

/**
 * 認証済みユーザーチェックミドルウェア
 * JWTトークンを検証し、リクエストにユーザー情報を追加します。
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "認証ヘッダーがありません" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "トークンがありません" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET()) as { userId: string };
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error("認証エラー:", error);
    return res.status(401).json({ message: "無効なトークンです" });
  }
};

/**
 * 管理者権限チェックミドルウェア
 * 認証済みユーザーが管理者権限を持っているか確認します。
 */
export const isAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "認証されていません" });
  }

  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "ユーザーが見つかりません" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "管理者権限が必要です" });
    }

    next();
  } catch (error) {
    console.error("管理者権限チェックエラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};
