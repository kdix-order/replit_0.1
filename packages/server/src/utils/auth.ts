import jwt from "jsonwebtoken";
import type { Request } from "express";
import { storage } from "../storage/index.ts";

const JWT_SECRET = () => process.env.JWT_SECRET || "campus-order-jwt-secret";

// Helper function to create a JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET(), { expiresIn: "24h" });
};

// Helper function to check if user is admin
export async function isAdminUser(req: Request): Promise<boolean> {
  if (!req.user) return false;

  const user = await storage.getUser(req.user.id);
  if (!user) return false;

  return user.isAdmin === true;
}
