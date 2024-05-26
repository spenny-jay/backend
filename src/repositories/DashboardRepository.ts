import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { docClient } from "./AWSClients";

const DASHBOARD_TABLE = "dashboards";
// schema
// { dashboardId: string, name: string, players: List<string>}
class DashboardRepository {
  constructor() {}

  public async getUserDashboards(userId: string): Promise<string[]> {
    const command = new GetItemCommand({
      TableName: DASHBOARD_TABLE,
      Key: {
        userId: { S: userId },
      },
      ProjectionExpression: "username",
    });

    const res = await docClient.send(command);
    if (!res.Item) {
      console.log("Failure in dashboards table");
      return null;
    }
    console.log(res);
  }
}

export default DashboardRepository;
