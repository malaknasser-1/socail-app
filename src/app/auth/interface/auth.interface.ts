import { Types } from "mongoose";
import { OtpPurpose } from "../enum/otp-purpose.enum";

export interface IRefreshToken {
  user: Types.ObjectId;
  jti: string;
  expiresAt: Date;
  revokedAt?: Date;
}

export interface IOtp {
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
}
