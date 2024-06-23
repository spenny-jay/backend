import { Router } from "express";
import playerRouter from "./players.js";
import userRouter from "./user.js";
import { auth } from "../auth.js";
import dashboardRouter from "./dashboards.js";

const router = Router();

router.use("/api/players", auth, playerRouter);

router.use("/api/users", userRouter);

router.use("/api/dashboards", auth, dashboardRouter);

export default router;
