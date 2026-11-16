import { Router } from "express";
import { authenticate } from "../../pkg/middleware/auth.middleware";
import { validate } from "../../pkg/middleware/validate.middleware";
import { authController } from "./controller/auth.controller";
import {
  emailDto, googleDto, loginDto, refreshDto, registerDto, resetPasswordDto, verifyEmailDto,
} from "./dto/auth.dto";

const authRouter = Router();

authRouter.post("/register", validate(registerDto), authController.register);
authRouter.post("/verify-email", validate(verifyEmailDto), authController.verifyEmail);
authRouter.post("/resend-verification", validate(emailDto), authController.resendVerification);
authRouter.post("/login", validate(loginDto), authController.login);
authRouter.post("/refresh", validate(refreshDto), authController.refresh);
authRouter.post("/logout", validate(refreshDto), authController.logout);
authRouter.post("/logout-all", authenticate, authController.logoutAll);
authRouter.post("/forgot-password", validate(emailDto), authController.forgotPassword);
authRouter.post("/reset-password", validate(resetPasswordDto), authController.resetPassword);
authRouter.post("/google", validate(googleDto), authController.google);

export default authRouter;
