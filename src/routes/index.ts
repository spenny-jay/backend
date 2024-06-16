import { Router } from "express";
import playerRouter from "./players.js";
import userRouter from "./user.js";
import { auth } from "../auth.js";
import dashboardRouter from "./dashboards.js";

const router = Router();
/**
 * @swagger
 *
 * '/api/players/player/{playerId}':
 *  get:
 *      tags:
 *      - Player
 *      summary: Gets an individual player by id
 *      parameters:
 *      - name: playerId
 *        in: path
 *        description: The id of the player
 *        required: true
 *      responses:
 *          200:
 *              description: Successfully pulled player by id
 *          404:
 *              description: Player not found
 *
 * '/api/players/{query}':
 *  get:
 *      tags:
 *      - Player
 *      summary: Gets an individual player by id
 *      parameters:
 *      - name: query
 *        in: path
 *        description: Name substring
 *        required: true
 *      responses:
 *          200:
 *              description: Successfully pulled player names that match the query
 *          400:
 *              description: Error accessing storage layer for players
 */
router.use("/api/players", auth, playerRouter);

/**
 *
 * @swagger
 *
 * '/api/users/login/':
 *  post:
 *      tags:
 *      - User
 *      summary: Logs in an existing user
 *      requestbody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *              schema:
 *                  type: object
 *                  properties:
 *                      username:
 *                          type: string
 *                      password:
 *                          type: string
 *
 *
 *      responses:
 *          200:
 *              description: Successfully logged in player
 *          400:
 *              description: Invalid username or password
 *          500:
 *              description: Error encountered on storage layer
 *
 * '/api/users/signup/':
 *  post:
 *      tags:
 *      - User
 *      summary: Signs up a new user
 *      requestbody:
 *        required: true
 *
 *      responses:
 *          200:
 *              description: Successfully logged in player
 *          400:
 *              description: Invalid username or password
 *          500:
 *              description: Error encountered on storage layer
 */
router.use("/api/users", userRouter);

router.use("/api/dashboards", auth, dashboardRouter);

export default router;
