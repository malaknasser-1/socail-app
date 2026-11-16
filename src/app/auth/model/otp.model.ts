import { Schema, model } from "mongoose";
import { IOtp } from "../interface/auth.interface";
import { OtpPurpose } from "../enum/otp-purpose.enum";

const schema = new Schema<IOtp>({
  email: { type: String, required: true, lowercase: true },
  purpose: { type: String, enum: Object.values(OtpPurpose), required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
});
schema.index({ email: 1, purpose: 1 }, { unique: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = model<IOtp>("Otp", schema);
