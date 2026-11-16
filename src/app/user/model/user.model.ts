import { Schema, model } from "mongoose";
import { IUser } from "../interface/user.interface";
import { AuthProvider } from "../enum/auth-provider.enum";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    provider: { type: String, enum: Object.values(AuthProvider), default: AuthProvider.LOCAL },
    googleId: String,
    isEmailVerified: { type: Boolean, default: false },
    bio: { type: String, maxlength: 200, default: "" },
    avatar: String,
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ name: 1 });

export const UserModel = model<IUser>("User", userSchema);
