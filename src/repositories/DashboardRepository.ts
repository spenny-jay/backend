import { GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { docClient } from "./AWSClients";
import { DashboardNameModel } from "../models/responses/DashboardNameModel";
import { UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { DashboardRequest } from "../models/requests/DashboardRequest";
import { DashboardModel } from "../models/responses/DashboardModel";
import { randomUUID } from "crypto";

const TABLE_NAME = "dashboards";
class DashboardRepository {
  constructor() {}

  /**
   * Gets the names and id's of all of the dashboards for a user
   * @param userId
   * @returns List of objects each containing a dashboard name and id
   */
  public async getUserDashboards(
    userId: string
  ): Promise<DashboardNameModel[]> {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :userId",
      ProjectionExpression: "dashboardId, dashboardName",
      ExpressionAttributeValues: {
        ":userId": {
          S: userId,
        },
      },
    });

    try {
      const res = await docClient.send(command);

      const dashboardNames = res.Items.map((dashboard) => {
        return {
          dashboardId: dashboard.dashboardId.S,
          dashboardName: dashboard.dashboardName.S,
        };
      });
      return dashboardNames;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Gets the dashboard data from a particular dashboardId
   * @param dashboardId
   * @returns the dashboard data from a particular dashboardId
   */
  public async getDashboard(dashboardId: string): Promise<DashboardModel> {
    const command = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        dashboardId: { S: dashboardId },
      },
    });

    try {
      const res = await docClient.send(command);
      return {
        dashboardId: res.Item.dashboardId.S,
        dashboardName: res.Item.dashboardName.S,
        playerIds: res.Item.playerIds.L.map((attr) => attr.S),
        startYear: +res.Item.startYear.N,
        endYear: +res.Item.endYear.N,
        statCategory: res.Item.statCategory.S,
      };
    } catch (e) {
      throw e;
    }
  }

  /**
   * Saves a dashboard for an existing user
   * @param dashboardRequest: Object storing dashboard metadata to save
   * (including: id, name, playerIds, startYear, etc.)
   * @returns boolean whether the dashboard was successfully saved
   */
  public async saveDashboard(
    dashboardRequest: DashboardRequest,
    userId: string,
    dashboardId?: string
  ): Promise<string> {
    if (!dashboardId) dashboardId = randomUUID();
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { dashboardId: dashboardId },
      UpdateExpression:
        "SET dashboardName = :name, userId = :userId, startYear = :startYear, endYear = :endYear, statCategory = :statCategory, playerIds = :playerIds",
      ExpressionAttributeValues: {
        ":name": dashboardRequest.dashboardName,
        ":startYear": dashboardRequest.startYear,
        ":endYear": dashboardRequest.endYear,
        ":statCategory": dashboardRequest.statCategory,
        ":playerIds": dashboardRequest.playerIds,
        ":userId": userId,
      },
    });

    try {
      await docClient.send(command);
      return dashboardId;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /**
   * Deletes a given dashboard by its id
   * @param dashboardId dashboard id to delete
   */
  public async deleteDashboard(dashboardId: string) {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        dashboardId: dashboardId,
      },
    });

    try {
      await docClient.send(command);
    } catch (e) {
      throw e;
    }
  }
}

const dashbaordRepo = new DashboardRepository();
export default dashbaordRepo;
