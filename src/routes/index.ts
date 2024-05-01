import { Router } from "express";
import playerRouter from "./players.js";
import userRouter from "./user.js";
import { auth } from "../auth.js";

const router = Router();
router.use("/api/players", auth, playerRouter);
router.use("/api/users/", userRouter);

export default router;
