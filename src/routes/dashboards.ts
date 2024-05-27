import { Router, Request, Response } from "express";
import dashboardRepo from "../repositories/DashboardRepository.js";
import playerRepo from "../repositories/PlayerRepository.js";
import { DashboardNameModel } from "../models/responses/DashboardNameModel.js";
import { DashboardRequest } from "../models/requests/DashboardRequest.js";
import { DashboardModel } from "../models/responses/DashboardModel.js";
import { PlayerModel } from "../models/responses/PlayerModel.js";
import { DashboardResponse } from "../models/responses/DashboardResponse.js";

const dashboardRouter = Router();

/**
 * Gets metadata (id and name) for all the dashboards for a particular user
 * @param userId: specifies whose dashboards to pull
 * @return list of the user's dashboard ids and names
 */
dashboardRouter.get("/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId || "";
  try {
    const userDashboardNames: DashboardNameModel[] =
      await dashboardRepo.getUserDashboards(userId);

    if (userDashboardNames === null) {
      res.status(500).send({
        message: `Error when retrieving dashboards for user: ${userId}`,
      });
    }
    console.log(userDashboardNames);
    res.status(200).send({ dashboardNames: userDashboardNames });
  } catch (e) {
    res.status(500).send({
      message: `Error when retrieving dashboards for user: ${userId}`,
    });
  }
});

/**
 * Retrieves a particular dashboard and its player data for a given dashboard id
 * @param dashbaordId
 */
dashboardRouter.get(
  "/dashboard/:dashboardId",
  async (req: Request, res: Response) => {
    const dashboardId = req.params.dashboardId || "";
    try {
      const dashboardData: DashboardModel = await dashboardRepo.getDashboard(
        dashboardId
      );

      const playerIds = dashboardData.playerIds;
      const playerList: PlayerModel[] = await playerRepo.getPlayers(playerIds);

      const dashboardResponse: DashboardResponse = {
        dashboardName: dashboardData.dashboardName,
        dashboardId: dashboardData.dashboardId,
        startYear: dashboardData.startYear,
        endYear: dashboardData.endYear,
        statCategory: dashboardData.statCategory,
        playerList: playerList,
      };

      res.status(200).send(dashboardResponse);
    } catch (e) {
      res.status(500).send({
        message: `Error processing dashboard id: ${dashboardId}`,
      });
    }
  }
);

/**
 * Uploads a new dashboard
 * @body DashboardRequest
 * @return dashboardId of the saved dashbaord if the post request was successful
 */
dashboardRouter.post("/", async (req: Request, res: Response) => {
  const dashboardReq: DashboardRequest = req.body;
  try {
    const dashboardId = await dashboardRepo.saveDashboard(dashboardReq);
    if (!dashboardId) {
      return res
        .status(500)
        .send(
          `Failure interacting with the dashboards table with user id: ${dashboardReq.userId} and dashboard id ${dashboardReq.dashboardId}`
        );
    }
    return res.status(200).send({ dashboardId: dashboardId });
  } catch (e) {
    res.status(500).send({
      message: `Error uploading dashboard with id: ${dashboardReq.userId} and dashboard id ${dashboardReq.dashboardId}`,
    });
  }
});

/**
 * Deletes a dashboard by its id
 * @param dashboardId: dashboard's id to delete
 */
dashboardRouter.delete("/:dashboardId", async (req: Request, res: Response) => {
  const dashboardId = req.params.dashboardId;
  try {
    await dashboardRepo.deleteDashboard(dashboardId);
    res.status(200).send({ dashboardId: dashboardId });
  } catch (e) {
    res.status(500).send({
      message: `Error deleting dashboard with id: ${dashboardId}`,
    });
  }
});

export default dashboardRouter;
