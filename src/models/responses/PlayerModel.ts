import { StatsModel } from "./StatsModel";

export type PlayerModel = {
  CurrentTeam: string;
  Player: string;
  Id: string;
  ProfileUrl: string;
  Stats: StatsModel[];
};
