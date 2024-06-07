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
dashboardRouter.get("/", async (req: Request, res: Response) => {
  const userId = req.user;
  try {
    const userDashboardNames: DashboardNameModel[] =
      await dashboardRepo.getUserDashboards(userId);

    if (userDashboardNames === null) {
      res.status(500).send({
        message: `Error when retrieving dashboards for user: ${userId}`,
      });
    }

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
    const dashboardId = req.params.dashboardId;
    try {
      const dashboardData: DashboardModel = await dashboardRepo.getDashboard(
        dashboardId
      );
      const playerIds = dashboardData.playerIds;
      const playerList: PlayerModel[] =
        playerIds.length === 0 ? [] : await playerRepo.getPlayers(playerIds);

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
 * Saves an existing dashboard
 * @body DashboardRequest
 * @return dashboardId of the saved dashbaord if the post request was successful
 */
dashboardRouter.post("/:dashboardId", async (req: Request, res: Response) => {
  const dashboardReq: DashboardRequest = req.body;
  const userId = req.user;
  const dashboardId = req.params.dashboardId;
  try {
    const saved = await dashboardRepo.saveDashboard(
      dashboardReq,
      userId,
      dashboardId
    );
    if (!saved) {
      return res.status(500).send({
        message: `Failure interacting with the dashboards table with user id: ${userId} and dashboard id ${dashboardId}`,
      });
    }

    return res.status(200).send({ dashboardId: dashboardId });
  } catch (e) {
    res.status(500).send({
      message: `Error uploading dashboard with for user id: ${userId} and dashboard ${dashboardId}`,
    });
  }
});

/**
 * Creates a new dashboard
 * @body DashboardRequest
 */
dashboardRouter.post("/", async (req: Request, res: Response) => {
  const dashboardReq: DashboardRequest = req.body;
  const userId = req.user;
  try {
    const dashboardId = await dashboardRepo.saveDashboard(dashboardReq, userId);
    if (!dashboardId) {
      return res.status(500).send({
        message: `Failure interacting with the dashboards table with user id: ${userId} and dashboard ${dashboardReq.dashboardName}`,
      });
    }

    return res.status(200).send({ dashboardId: dashboardId });
  } catch (e) {
    res.status(500).send({
      message: `Error uploading dashboard with for user id: ${userId} and dashboard name ${dashboardReq.dashboardName}`,
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
