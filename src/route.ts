import { Router } from "express";
import authRouter from "./app/auth/route";
import userRouter from "./app/user/route";

const router = Router();
router.use("/auth", authRouter);
router.use("/users", userRouter);

export default router;
