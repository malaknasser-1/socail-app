import bcrypt from "bcryptjs";
import crypto from "crypto";

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const comparePassword = (plain: string, hashed: string) => bcrypt.compare(plain, hashed);

export const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
export const generateOtp = () => crypto.randomInt(100000, 1000000).toString();
