export type DashboardRequest = {
  dashboardName: string;
  dashboardId: string;
  userId: string;
  playerIds: string[];
  startYear: number;
  endYear: number;
  statCategory: string;
};
