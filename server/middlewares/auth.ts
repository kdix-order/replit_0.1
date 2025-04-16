import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import memoryStore from "memorystore";
import session from "express-session";

const JWT_SECRET = () => process.env.JWT_SECRET || "campus-order-jwt-secret";

// Google OAuth認証用クライアントID・シークレット（デモ用デフォルト値）
const GOOGLE_CLIENT_ID = () => process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const GOOGLE_CLIENT_SECRET = () => process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";

// ドメイン制限設定（Google認証で許可するメールドメイン）
const ALLOWED_DOMAIN = () => process.env.ALLOWED_DOMAIN || "xxx.ac.jp";

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET()) as { userId: number };
    // 必ずuser情報をセットする
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error("認証エラー:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to check if user is admin
export const isAdmin = async (req: Request, res: Response, next: any) => {
  // isAuthenticatedミドルウェアが先に実行されるため、req.userは必ず存在する
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Forbidden - Admin permission required" });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ message: "Internal server error during admin verification" });
  }
};

// Configure Passport.js
export const configurePassport = (app: Express) => {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID(),
        clientSecret: GOOGLE_CLIENT_SECRET(),
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // プロフィール情報からメールアドレスを取得
          const email = profile.emails?.[0]?.value;

          if (!email) {
            console.error("Google認証: メールアドレスが取得できませんでした");
            return done(new Error("メールアドレスが取得できませんでした"), undefined);
          }

          console.log(`Google認証: ログイン試行 - ${email}`);

          // 管理者特権アカウント
          const ADMIN_EMAIL = 'yutonaka911@gmail.com';
          const ALLOWED_DOMAINS = ['kindai.ac.jp', 'itp.kindai.ac.jp'];

          // メールアドレスの検証
          const isAdmin = email === ADMIN_EMAIL;
          const isAllowedDomain = ALLOWED_DOMAINS.some(domain => email.endsWith(`@${domain}`));

          // 許可されていないメールアドレスの場合
          if (!isAdmin && !isAllowedDomain) {
            console.warn(`Google認証: 許可されていないメールアドレスからのログイン試行: ${email}`);
            return done(null, false, {
              message: "このメールアドレスではログインできません。@kindai.ac.jpまたは@itp.kindai.ac.jpのメールアドレスをご使用ください。"
            });
          }

          // ユーザーが既に存在するか確認
          let user = await storage.getUserByEmail(email);

          if (!user) {
            // 新規ユーザー作成
            console.log(`Google認証: 新規ユーザー作成: ${profile.displayName} (${email})`);
            user = await storage.createUser({
              username: profile.displayName || email.split('@')[0],
              password: `google-oauth-${Date.now()}`, // OAuth用のランダムパスワード
              email,
              isAdmin: isAdmin, // 管理者特権メールアドレスの場合は管理者権限を付与
            });
          } else {
            console.log(`Google認証: 既存ユーザーでログイン: ${user.username} (${email})`);

            // 既存ユーザーでも管理者フラグを更新（特権アカウントが後から設定された場合に対応）
            if (isAdmin && !user.isAdmin) {
              // TODO: 管理者権限の更新処理を実装（現在の実装ではユーザー更新メソッドがないためコメントアウト）
              // await storage.updateUser(user.id, { ...user, isAdmin: true });
              console.log(`Google認証: 管理者権限を付与: ${email}`);
            }
          }

          return done(null, user);
        } catch (error) {
          console.error("Google認証エラー:", error);
          return done(error);
        }
      }
    )
  );

  // Set up session
  const MemoryStore = memoryStore(session);
  app.use(
    session({
      secret: JWT_SECRET(),
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
};

// Helper function to create a JWT token
export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET(), { expiresIn: "24h" });
};
