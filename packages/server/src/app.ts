/**
 * app.ts
 * 
 * Expressアプリケーションの設定と初期化を行います。
 * MVCアーキテクチャのエントリーポイントとして機能します。
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { configurePassport } from "../middlewares/auth";
import routes from "./routes/index";
import { errorHandler } from "./middlewares/error";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

configurePassport(app);

app.use("/api", routes);

app.use(errorHandler);

export default app;
