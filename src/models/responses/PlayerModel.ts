import { StatsModel } from "./StatsModel";

export type PlayerModel = {
  "Current Team": string;
  Player: string;
  Id: string;
  Key: string;
  Stats: StatsModel[];
};
