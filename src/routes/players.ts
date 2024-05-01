import { Router, Request, Response } from "express";
import PlayerRepository from "../repositories/PlayerRepository.js";
import { NameModel } from "../models/responses/NameModel.js";
import { PlayerModel } from "../models/responses/PlayerModel.js";

// set of routes related to retrieving data from
// the qb_stats table
const playerRouter = Router();
const playerRepo = new PlayerRepository();

playerRouter.get("/player/:id", async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const startYear: number = req.query.startYear;
  const endYear: number = req.query.endYear;
  try {
    const player: PlayerModel[] = await playerRepo.getPlayer(
      id,
      startYear,
      endYear
    );

    return res.send(player);
  } catch (e) {
    return res.status(400).send({ msg: `Player ${id} not found` });
  }
});

playerRouter.get("/:name", async (req: Request, res: Response) => {
  const playerName: string = req.params.name;

  try {
    const players: NameModel[] = await playerRepo.getPlayerNames(playerName);
    return res.send(players);
  } catch (e) {
    return res
      .status(400)
      .send({ msg: "Could not find player: " + playerName });
  }
});

export default playerRouter;
