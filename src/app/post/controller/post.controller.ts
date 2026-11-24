import { Response } from "express";
import { AuthRequest } from "../../../pkg/middleware/auth.middleware";
import { sendSuccess } from "../../../pkg/utils/response";
import { postService } from "../service/post.service";
import { paginationDto } from "../../user/dto/user.dto";

class PostController {
  create = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await postService.create(req.userId!, req.body), 201);

  getMyPosts = async (req: AuthRequest, res: Response) => {
    const { page, limit } = paginationDto.parse(req.query);
    sendSuccess(res, await postService.getMyPosts(req.userId!, page, limit));
  };

  getOne = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await postService.getOne(req.userId!, String(req.params.id)));

  update = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await postService.update(req.userId!, String(req.params.id), req.body));

  delete = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await postService.delete(req.userId!, String(req.params.id)));
}

export const postController = new PostController();