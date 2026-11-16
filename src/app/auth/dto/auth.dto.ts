import { z } from "zod";

const email = z.string().trim().toLowerCase().email();
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number");
const otp = z.string().length(6, "OTP must be 6 digits");

export const registerDto = z.object({ name: z.string().trim().min(2).max(50), email, password });
export const verifyEmailDto = z.object({ email, otp });
export const emailDto = z.object({ email });
export const loginDto = z.object({ email, password: z.string().min(1) });
export const refreshDto = z.object({ refreshToken: z.string().min(1) });
export const resetPasswordDto = z.object({ email, otp, newPassword: password });
export const googleDto = z.object({ idToken: z.string().min(1) });

export type RegisterDto = z.infer<typeof registerDto>;
export type VerifyEmailDto = z.infer<typeof verifyEmailDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
