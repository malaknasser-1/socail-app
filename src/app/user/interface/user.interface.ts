import { Types } from "mongoose";
import { AuthProvider } from "../enum/auth-provider.enum";

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  provider: AuthProvider;
  googleId?: string;
  isEmailVerified: boolean;
  bio?: string;
  avatar?: string;
  isPrivate: boolean;
  createdAt?: Date;
}
