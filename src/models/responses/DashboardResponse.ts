import { PlayerModel } from "./PlayerModel";

export type DashboardResponse = {
  dashboardName: string;
  dashboardId: string;
  playerStats: PlayerModel[];
  startYear: number;
  endYear: number;
  statCategory: string;
};
