import { Router } from "express";
import authRouter from "./app/auth/route";
import userRouter from "./app/user/route";
import postRouter from "./app/post/route";
import commentRouter from "./app/comment/route";

const router = Router();
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/", commentRouter);

export default router;
