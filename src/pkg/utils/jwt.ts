import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../../lib/config/env";

export const signAccessToken = (userId: string) =>
  jwt.sign({ sub: userId }, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresSeconds });

export const signRefreshToken = (userId: string, jti: string) =>
  jwt.sign({ sub: userId, jti }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresDays * 86400 });

export const verifyAccessToken = (token: string) => jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
export const verifyRefreshToken = (token: string) => jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
