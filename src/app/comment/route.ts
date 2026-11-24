import { Router } from "express";
import { authenticate } from "../../pkg/middleware/auth.middleware";
import { validate } from "../../pkg/middleware/validate.middleware";
import { idParamDto } from "../user/dto/user.dto";
import { commentController } from "./controller/comment.controller";
import { createCommentDto, postIdParamDto, updateCommentDto } from "./dto/comment.dto";

const commentRouter = Router();

commentRouter.post(
  "/posts/:postId/comments",
  authenticate,
  validate(postIdParamDto, "params"),
  validate(createCommentDto),
  commentController.create
);
commentRouter.get(
  "/posts/:postId/comments",
  authenticate,
  validate(postIdParamDto, "params"),
  commentController.getPostComments
);

commentRouter.get("/comments/:id", authenticate, validate(idParamDto, "params"), commentController.getOne);
commentRouter.patch(
  "/comments/:id",
  authenticate,
  validate(idParamDto, "params"),
  validate(updateCommentDto),
  commentController.update
);
commentRouter.delete("/comments/:id", authenticate, validate(idParamDto, "params"), commentController.delete);

export default commentRouter;