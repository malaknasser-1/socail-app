import { Router } from "express";
import { authenticate } from "../../pkg/middleware/auth.middleware";
import { validate } from "../../pkg/middleware/validate.middleware";
import { userController } from "./controller/user.controller";
import { idParamDto, settingsDto, updateProfileDto } from "./dto/user.dto";

const userRouter = Router();
userRouter.use(authenticate);


userRouter.get("/me", userController.getMe);
userRouter.patch("/me", validate(updateProfileDto), userController.updateMe);
userRouter.patch("/me/settings", validate(settingsDto), userController.updateSettings);

userRouter.get("/search", userController.search);
userRouter.get("/suggestions", userController.suggestions);

userRouter.get("/requests", userController.listRequests);
userRouter.patch("/requests/:id/accept", validate(idParamDto, "params"), userController.acceptRequest);
userRouter.delete("/requests/:id", validate(idParamDto, "params"), userController.rejectRequest);

userRouter.get("/:id", validate(idParamDto, "params"), userController.getProfile);
userRouter.post("/:id/follow", validate(idParamDto, "params"), userController.follow);
userRouter.delete("/:id/follow", validate(idParamDto, "params"), userController.unfollow);
userRouter.get("/:id/followers", validate(idParamDto, "params"), userController.getFollowers);
userRouter.get("/:id/following", validate(idParamDto, "params"), userController.getFollowing);

export default userRouter;
