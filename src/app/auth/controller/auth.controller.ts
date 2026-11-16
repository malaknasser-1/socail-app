import { Request, Response } from "express";
import { AuthRequest } from "../../../pkg/middleware/auth.middleware";
import { sendSuccess } from "../../../pkg/utils/response";
import { authService } from "../service/auth.service";

class AuthController {
  register = async (req: Request, res: Response) => sendSuccess(res, await authService.register(req.body), 201);
  verifyEmail = async (req: Request, res: Response) => sendSuccess(res, await authService.verifyEmail(req.body));
  resendVerification = async (req: Request, res: Response) =>
    sendSuccess(res, await authService.resendVerification(req.body.email));
  login = async (req: Request, res: Response) => sendSuccess(res, await authService.login(req.body));
  refresh = async (req: Request, res: Response) => sendSuccess(res, await authService.refresh(req.body.refreshToken));
  logout = async (req: Request, res: Response) => sendSuccess(res, await authService.logout(req.body.refreshToken));
  logoutAll = async (req: AuthRequest, res: Response) => sendSuccess(res, await authService.logoutAll(req.userId!));
  forgotPassword = async (req: Request, res: Response) =>
    sendSuccess(res, await authService.forgotPassword(req.body.email));
  resetPassword = async (req: Request, res: Response) => sendSuccess(res, await authService.resetPassword(req.body));
  google = async (req: Request, res: Response) => sendSuccess(res, await authService.googleLogin(req.body.idToken));
}

export const authController = new AuthController();
