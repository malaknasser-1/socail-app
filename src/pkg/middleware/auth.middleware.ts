import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next(new AppError("Unauthorized", 401));
  try {
    req.userId = verifyAccessToken(header.split(" ")[1]).sub;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
};
