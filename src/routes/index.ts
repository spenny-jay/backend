import { Router } from "express";
import playerRouter from "./players.js";

const router = Router();
router.use(playerRouter);

export default router;
