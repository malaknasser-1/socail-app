import { Response } from "express";

export const sendSuccess = (res: Response, data: unknown, status = 200): void => {
  res.status(status).json({ success: true, data });
};
