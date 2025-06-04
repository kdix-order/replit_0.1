/**
 * routes.ts
 * アプリケーションのAPIエンドポイントとルーティングを定義するファイル
 *
 * 主な機能:
 * - 認証サービス (JWT, Google OAuth)
 * - 製品一覧のエンドポイント
 * - カート操作のエンドポイント
 * - 注文処理のエンドポイント
 * - 管理者向けエンドポイント
 */

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import dotenv from 'dotenv';
import { configurePassport } from "./middlewares/auth";
import admin from "./routes/admin";
import auth from "./routes/auth";
import cart from "./routes/cart";
import orders from "./routes/orders";
import payments from "./routes/payments";
import products from "./routes/products";
import timeslots from "./routes/timeslots";

// 環境変数の読み込み
dotenv.config();

/**
 * すべてのAPIルートを登録する関数
 *
 * この関数では以下の機能を提供するAPIエンドポイントを登録します：
 * - 認証関連（ログイン、ユーザー情報取得）
 * - 商品一覧の取得
 * - カート操作（追加、更新、削除）
 * - 注文の作成と取得
 * - 管理者機能（注文管理、店舗設定）
 *
 * @param app - Expressアプリケーションインスタンス
 * @returns HTTPサーバーインスタンス
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Passportの設定（Google OAuth認証用）
  configurePassport(app);

  app.use("/", admin);
  app.use("/", auth);
  app.use("/", cart);
  app.use("/", orders);
  app.use("/", payments);
  app.use("/", products);
  app.use("/", timeslots);

  const httpServer = createServer(app);

  return httpServer;
}
