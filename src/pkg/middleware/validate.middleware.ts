import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const validate =
  (schema: ZodType, source: "body" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    if (source === "body") req.body = result.data;
    next();
  };
