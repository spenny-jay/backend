import { Router, Request, Response } from "express";
import { getPlayer, getPlayerNames } from "../repositories/PlayerRepository.js";
import { NameModel } from "../models/NameModel";
import { PlayerModel } from "../models/PlayerModel";

const playerRouter = Router();

playerRouter.get("/player/:id", async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const startYear: number = req.query.startYear;
  const endYear: number = req.query.endYear;
  try {
    const player: PlayerModel[] = await getPlayer(id, startYear, endYear);

    return res.send(player);
  } catch (e) {
    return res.status(400).send({ msg: `Player ${id} not found` });
  }
});

playerRouter.get("/:name", async (req: Request, res: Response) => {
  const playerName: string = req.params.name;

  try {
    const players: NameModel[] = await getPlayerNames(playerName);
    return res.send(players);
  } catch (e) {
    return res
      .status(400)
      .send({ msg: "Could not find player: " + playerName });
  }
});

export default playerRouter;
