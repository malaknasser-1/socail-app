import { Router } from "express";
import { authenticate } from "../../pkg/middleware/auth.middleware";
import { validate } from "../../pkg/middleware/validate.middleware";
import { idParamDto } from "../user/dto/user.dto";
import { postController } from "./controller/post.controller";
import { createPostDto, updatePostDto } from "./dto/post.dto";

const postRouter = Router();
postRouter.use(authenticate);

postRouter.post("/", validate(createPostDto), postController.create);
postRouter.get("/", postController.getMyPosts);
postRouter.get("/:id", validate(idParamDto, "params"), postController.getOne);
postRouter.patch("/:id", validate(idParamDto, "params"), validate(updatePostDto), postController.update);
postRouter.delete("/:id", validate(idParamDto, "params"), postController.delete);

export default postRouter;