/**
 * services/auth/AuthService.ts
 * 
 * 認証関連のビジネスロジックを担当するサービス
 * リポジトリ層を利用してデータアクセスを行い、認証ロジックを適用します。
 */

import { storage } from "../../../storage";
import { User, InsertUser, AuthResponse } from "../../models";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = () => process.env.JWT_SECRET || "campus-order-jwt-secret";

/**
 * 認証サービスクラス
 * ユーザー認証と管理のビジネスロジックを提供します
 */
export class AuthService {
  /**
   * ユーザー登録を行います
   * @param userData ユーザー登録データ
   * @returns 登録されたユーザーと認証トークン
   * @throws メールアドレスまたはユーザー名が既に使用されている場合
   */
  async register(userData: InsertUser): Promise<AuthResponse> {
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new Error("このメールアドレスは既に使用されています");
    }

    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error("このユーザー名は既に使用されています");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });

    const token = this.generateToken(user.id);

    return { user, token };
  }

  /**
   * ユーザーログインを行います
   * @param email メールアドレス
   * @param password パスワード
   * @returns ログインユーザーと認証トークン
   * @throws メールアドレスまたはパスワードが無効な場合
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error("メールアドレスまたはパスワードが無効です");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("メールアドレスまたはパスワードが無効です");
    }

    const token = this.generateToken(user.id);

    return { user, token };
  }

  /**
   * デモユーザーでログインします
   * @param isAdmin 管理者権限を持つかどうか
   * @returns デモユーザーと認証トークン
   */
  async demoLogin(isAdmin: boolean): Promise<AuthResponse> {
    const email = isAdmin ? "admin-demo@example.com" : "customer-demo@example.com";
    const username = isAdmin ? "管理者デモユーザー" : "お客様デモユーザー";
    
    let user = await storage.getUserByEmail(email);

    if (!user) {
      user = await storage.createUser({
        username,
        password: isAdmin ? "admin-demo-password" : "customer-demo-password",
        email,
        isAdmin,
      });
    }

    const token = this.generateToken(user.id);
    
    const { password, ...userWithoutPassword } = user;
    
    return { 
      user: userWithoutPassword as User, 
      token 
    };
  }

  /**
   * ユーザー情報を取得します
   * @param userId ユーザーID
   * @returns ユーザー情報
   * @throws ユーザーが存在しない場合
   */
  async getUserProfile(userId: string): Promise<User> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("ユーザーが見つかりません");
    }
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * JWT認証トークンを生成します
   * @param userId ユーザーID
   * @returns 生成されたJWTトークン
   */
  generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET(), {
      expiresIn: "7d",
    });
  }
}

export const authService = new AuthService();
