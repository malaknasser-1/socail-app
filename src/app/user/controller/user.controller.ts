import { Response } from "express";
import { AuthRequest } from "../../../pkg/middleware/auth.middleware";
import { sendSuccess } from "../../../pkg/utils/response";
import { userService } from "../service/user.service";
import { paginationDto, searchQueryDto } from "../dto/user.dto";

class UserController {
  getMe = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await userService.getMe(req.userId!));

  updateMe = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await userService.updateProfile(req.userId!, req.body));

  updateSettings = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await userService.updateSettings(req.userId!, req.body.isPrivate));

  getProfile = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await userService.getProfile(req.userId!, String(req.params.id)));

  follow = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await userService.follow(req.userId!, String(req.params.id)), 201);

  unfollow = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await userService.unfollow(req.userId!, String(req.params.id)));

  listRequests = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await userService.listRequests(req.userId!));

  acceptRequest = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await userService.acceptRequest(req.userId!, String(req.params.id)));

  rejectRequest = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await userService.rejectRequest(req.userId!, String(req.params.id)));

  getFollowers = async (req: AuthRequest, res: Response) => {
    const { page, limit } = paginationDto.parse(req.query);
    sendSuccess(res, await userService.getFollowers(req.userId!, String(req.params.id), page, limit));
  };

  getFollowing = async (req: AuthRequest, res: Response) => {
    const { page, limit } = paginationDto.parse(req.query);
    sendSuccess(res, await userService.getFollowing(req.userId!, String(req.params.id), page, limit));
  };

  search = async (req: AuthRequest, res: Response) => {
    const { q, page, limit } = searchQueryDto.parse(req.query);
    sendSuccess(res, await userService.search(req.userId!, q, page, limit));
  };

  suggestions = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await userService.suggestions(req.userId!));
}

export const userController = new UserController();
