import { Response } from "express";
import { AuthRequest } from "../../../pkg/middleware/auth.middleware";
import { sendSuccess } from "../../../pkg/utils/response";
import { commentService } from "../service/comment.service";
import { paginationDto } from "../../user/dto/user.dto";

class CommentController {
  create = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await commentService.create(req.userId!, String(req.params.postId), req.body.content), 201);

  getPostComments = async (req: AuthRequest, res: Response) => {
    const { page, limit } = paginationDto.parse(req.query);
    sendSuccess(res, await commentService.getPostComments(req.userId!, String(req.params.postId), page, limit));
  };

  getOne = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await commentService.getOne(req.userId!, String(req.params.id)));

  update = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await commentService.update(req.userId!, String(req.params.id), req.body.content));

  delete = async (req: AuthRequest, res: Response) =>
    sendSuccess(res, await commentService.delete(req.userId!, String(req.params.id)));
}

export const commentController = new CommentController();