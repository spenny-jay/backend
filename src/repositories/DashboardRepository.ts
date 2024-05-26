import { GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { docClient } from "./AWSClients";
import { DashboardNameModel } from "../models/responses/DashboardNameModel";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { DashboardRequest } from "../models/requests/DashboardRequest";
import { DashboardModel } from "../models/responses/DashboardModel";

const DASHBOARD_TABLE = "dashboards";
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
      TableName: DASHBOARD_TABLE,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :userId",
      ProjectionExpression: "dashboardId, dashboardName",
      ExpressionAttributeValues: {
        ":userId": {
          S: userId,
        },
      },
    });

    const res = await docClient.send(command);
    if (!res.Items && res.$metadata.httpStatusCode !== 200) {
      console.log("Failure in dashboards table");
      return null;
    }
    console.log(res);
    return res.Items.map((dashboard) => {
      return {
        dashboardId: dashboard.dashboardId.S,
        dashboardName: dashboard.dashboardName.S,
      };
    });
  }

  /**
   * Gets the dashboard data from a particular dashboardId
   * @param dashboardId
   * @returns the dashboard data from a particular dashboardId
   */
  public async getDashboard(dashboardId: string): Promise<DashboardModel> {
    const command = new GetItemCommand({
      TableName: DASHBOARD_TABLE,
      Key: {
        dashboardId: { S: dashboardId },
      },
    });

    const res = await docClient.send(command);
    if (!res.Item && res.$metadata.httpStatusCode !== 200) {
      console.log("Failure in dashboards table");
      return null;
    }

    return {
      dashboardId: res.Item.dashboardId.S,
      dashboardName: res.Item.dashboardName.S,
      playerIds: res.Item.playerIds.SS,
      startYear: +res.Item.startYear.N,
      endYear: +res.Item.endYear.N,
      statCategory: res.Item.statCategory.S,
    };
  }

  /**
   * Saves a dashboard for an existing user
   * @param dashboardRequest: Object storing dashboard metadata to save
   * (including: id, name, playerIds, startYear, etc.)
   * @returns boolean whether the dashboard was successfully saved
   */
  public async saveDashboard(
    dashboardRequest: DashboardRequest
  ): Promise<boolean> {
    const command = new PutCommand({
      TableName: DASHBOARD_TABLE,
      Item: { dashboardId: randomUUID(), ...dashboardRequest },
    });

    const res = await docClient.send(command);
    if (res && res.$metadata.httpStatusCode !== 200) {
      console.log("Error interfacing with the dashboards table");
      return false;
    }
    return true;
  }
}

export default DashboardRepository;
