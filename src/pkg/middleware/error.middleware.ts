import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  if (err?.code === 11000) {
    res.status(409).json({ success: false, message: "Duplicate value" });
    return;
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
};
