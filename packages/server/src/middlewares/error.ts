/**
 * middlewares/error.ts
 * 
 * エラーハンドリングミドルウェア
 * アプリケーション全体で一貫したエラーレスポンスを提供します。
 */

import { Request, Response, NextFunction } from "express";

/**
 * グローバルエラーハンドリングミドルウェア
 * すべてのルートハンドラーで発生した例外を捕捉し、適切なエラーレスポンスを返します。
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("エラーハンドリングミドルウェア:", err);

  const statusCode = err.statusCode || err.status || 500;
  
  const message = err.message || "サーバーエラーが発生しました";
  
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * 非同期ルートハンドラーのエラーをキャッチするためのラッパー関数
 * Express 4.xでは非同期関数内で発生した例外を自動的にキャッチしないため、
 * このラッパーを使用して明示的にエラーをキャッチし、next()に渡します。
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
