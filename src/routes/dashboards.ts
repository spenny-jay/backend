import { Router, Request, Response } from "express";

const dashboardRouter = Router();

// get all dashboards that match a userId
// return list of dashboard id's and names
dashboardRouter.get("/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;
});

// post a new dashboard for a user
// return the dashboard id
dashboardRouter.post(async (req: Request, res: Response) => {
  const userId = req.body.userId;
});

// delete an existing dashboard for a user
dashboardRouter.delete("/:dashboardId", async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const dashboardId = req.params.dashboardId;
});

export default dashboardRouter;
