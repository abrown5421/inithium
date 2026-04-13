import { User } from "@inithium/types";
import { RequestHandler } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyAccessToken } from "../jwt/jwt.utils.js";

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }
  try {
    (req as any).user = verifyAccessToken(token);
    next();
  } catch { res.status(401).json({ success: false, error: 'Token invalid or expired' }); }
};

export const requireRole = (...roles: User['role'][]): RequestHandler =>
  (req, res, next) => {
    const user = (req as any).user as JwtPayload;
    if (!roles.includes(user?.role)) {
      res.status(403).json({ success: false, error: 'Forbidden' }); return;
    }
    next();
  };