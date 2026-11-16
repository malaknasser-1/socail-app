import crypto from "crypto";
import { Types } from "mongoose";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../../lib/config/env";
import { AppError } from "../../../pkg/errors/app-error";
import { comparePassword, generateOtp, hashPassword, sha256 } from "../../../pkg/utils/hash";
import { sendMail } from "../../../pkg/utils/mailer";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../pkg/utils/jwt";
import { userRepository } from "../../user/repository/user.repository";
import { AuthProvider } from "../../user/enum/auth-provider.enum";
import { otpRepository } from "../repository/otp.repository";
import { refreshTokenRepository } from "../repository/refresh-token.repository";
import { OtpPurpose } from "../enum/otp-purpose.enum";
import { LoginDto, RegisterDto, ResetPasswordDto, VerifyEmailDto } from "../dto/auth.dto";

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const googleClient = new OAuth2Client(env.googleClientId);

class AuthService {
  // ---------- helpers ----------
  private async sendOtp(email: string, purpose: OtpPurpose) {
    const code = generateOtp();
    await otpRepository.upsert(email, purpose, sha256(code), new Date(Date.now() + OTP_TTL_MINUTES * 60_000));
    const subject = purpose === OtpPurpose.VERIFY_EMAIL ? "Verify your email" : "Reset your password";
    await sendMail(email, subject, `Your code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`);
  }

  private async consumeOtp(email: string, purpose: OtpPurpose, code: string) {
    const otp = await otpRepository.findOne({ email, purpose });
    if (!otp || otp.expiresAt < new Date()) throw new AppError("Invalid or expired code", 400);
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      await otp.deleteOne();
      throw new AppError("Too many attempts, request a new code", 429);
    }
    if (otp.codeHash !== sha256(code)) {
      otp.attempts += 1;
      await otp.save();
      throw new AppError("Invalid or expired code", 400);
    }
    await otp.deleteOne();
  }

  private async issueTokens(userId: string) {
    const jti = crypto.randomUUID();
    await refreshTokenRepository.create({
      user: new Types.ObjectId(userId),
      jti,
      expiresAt: new Date(Date.now() + env.jwt.refreshExpiresDays * 86_400_000),
    });
    return { accessToken: signAccessToken(userId), refreshToken: signRefreshToken(userId, jti) };
  }

  // ---------- registration ----------
  async register(dto: RegisterDto) {
    if (await userRepository.findByEmail(dto.email)) throw new AppError("Email already in use", 409);
    const user = await userRepository.create({
      name: dto.name,
      email: dto.email,
      password: await hashPassword(dto.password),
      provider: AuthProvider.LOCAL,
    });
    await this.sendOtp(user.email, OtpPurpose.VERIFY_EMAIL);
    return { message: "Registered. Check your email for the verification code." };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    await this.consumeOtp(dto.email, OtpPurpose.VERIFY_EMAIL, dto.otp);
    await userRepository.updateOne({ email: dto.email }, { $set: { isEmailVerified: true } });
    return { message: "Email verified. You can login now." };
  }

  async resendVerification(email: string) {
    const user = await userRepository.findByEmail(email);
    if (user && !user.isEmailVerified) await this.sendOtp(email, OtpPurpose.VERIFY_EMAIL);
    return { message: "If the account exists, a new code was sent." };
  }

  // ---------- login / tokens ----------
  async login(dto: LoginDto) {
    const user = await userRepository.findByEmail(dto.email, true);
    if (!user || !user.password || !(await comparePassword(dto.password, user.password))) {
      throw new AppError("Invalid email or password", 401);
    }
    if (!user.isEmailVerified) throw new AppError("Please verify your email first", 403);
    return this.issueTokens(user.id);
  }

  async refresh(token: string) {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }
    const stored = await refreshTokenRepository.findOne({ jti: payload.jti });
    if (!stored) throw new AppError("Invalid refresh token", 401);

    // توكن اتستخدم قبل كده => احتمال سرقة => نلغي كل جلسات اليوزر
    if (stored.revokedAt) {
      await refreshTokenRepository.revokeAllForUser(String(payload.sub));
      throw new AppError("Token reuse detected. Please login again.", 401);
    }

    stored.revokedAt = new Date(); // rotation
    await stored.save();
    return this.issueTokens(String(payload.sub));
  }

  async logout(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      await refreshTokenRepository.revokeByJti(String(payload.jti));
    } catch {
      /* توكن باظ؟ مفيش حاجة نلغيها */
    }
    return { message: "Logged out" };
  }

  async logoutAll(userId: string) {
    await refreshTokenRepository.revokeAllForUser(userId);
    return { message: "Logged out from all devices" };
  }

  // ---------- password reset ----------
  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (user && user.provider === AuthProvider.LOCAL) await this.sendOtp(email, OtpPurpose.RESET_PASSWORD);
    return { message: "If the account exists, a reset code was sent." }; // رد موحد عشان مفيش user enumeration
  }

  async resetPassword(dto: ResetPasswordDto) {
    await this.consumeOtp(dto.email, OtpPurpose.RESET_PASSWORD, dto.otp);
    const user = await userRepository.findOneAndUpdate(
      { email: dto.email },
      { $set: { password: await hashPassword(dto.newPassword) } }
    );
    if (!user) throw new AppError("User not found", 404);
    await refreshTokenRepository.revokeAllForUser(user.id);
    return { message: "Password updated. Please login again." };
  }

  // ---------- Google OAuth ----------
  async googleLogin(idToken: string) {
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken, audience: env.googleClientId });
      payload = ticket.getPayload();
    } catch {
      throw new AppError("Invalid Google token", 401);
    }
    if (!payload?.email || !payload.email_verified) throw new AppError("Google email not verified", 401);

    let user = await userRepository.findByEmail(payload.email);
    if (!user) {
      user = await userRepository.create({
        name: payload.name ?? payload.email.split("@")[0],
        email: payload.email,
        provider: AuthProvider.GOOGLE,
        googleId: payload.sub,
        isEmailVerified: true,
        avatar: payload.picture,
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub; // ربط الحساب الموجود
      user.isEmailVerified = true;
      await user.save();
    }
    return this.issueTokens(user.id);
  }
}

export const authService = new AuthService();
