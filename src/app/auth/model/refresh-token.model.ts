import { Schema, model } from "mongoose";
import { IRefreshToken } from "../interface/auth.interface";

const schema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
  },
  { timestamps: true }
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL: يتمسح تلقائيا بعد الانتهاء

export const RefreshTokenModel = model<IRefreshToken>("RefreshToken", schema);
