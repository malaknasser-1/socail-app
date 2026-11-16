import mongoose from "mongoose";
import { env } from "../config/env";

export const connectDB = async () => {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};
