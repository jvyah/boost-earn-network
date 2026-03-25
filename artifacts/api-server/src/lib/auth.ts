import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env["JWT_SECRET"] || "boost_earn_secret_key_2024";

export function signToken(payload: { userId: number; isAdmin: boolean }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number; isAdmin: boolean } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; isAdmin: boolean };
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  (req as any).userId = payload.userId;
  (req as any).isAdmin = payload.isAdmin;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!(req as any).isAdmin) {
      res.status(403).json({ error: "Admin only" });
      return;
    }
    next();
  });
}
