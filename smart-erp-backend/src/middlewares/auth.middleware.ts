import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expects "Bearer <token>"

  if (!token) {
    res.status(401).json({ message: "Access Denied: No Token Provided" });
    return;
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or Expired Token" });
  }
};
