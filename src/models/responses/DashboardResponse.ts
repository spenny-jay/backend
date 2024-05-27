import { PlayerModel } from "./PlayerModel";

export type DashboardResponse = {
  dashboardName: string;
  dashboardId: string;
  playerList: PlayerModel[];
  startYear: number;
  endYear: number;
  statCategory: string;
};
