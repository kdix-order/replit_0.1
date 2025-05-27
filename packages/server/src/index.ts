/**
 * src/index.ts
 * 
 * アプリケーションのエントリーポイント
 * サーバーの起動とポート設定を行います。
 */

import app from "./app";
import { setupVite, serveStatic, log } from "../vite";
import { createServer } from "http";

const PORT = process.env.PORT || 3000;

(async () => {
  const server = createServer(app);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(PORT, () => {
    log(`サーバーが起動しました: http://localhost:${PORT}`);
  });
})();
