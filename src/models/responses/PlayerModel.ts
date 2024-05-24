import { StatsModel } from "./StatsModel";

export type PlayerModel = {
  "Current Team": string;
  Player: string;
  Id: string;
  ProfileUrl: string;
  Stats: StatsModel[];
};
