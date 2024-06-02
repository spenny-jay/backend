export type DashboardRequest = {
  dashboardName: string;
  dashboardId: string;
  playerIds: string[];
  startYear: number;
  endYear: number;
  statCategory: string;
};
