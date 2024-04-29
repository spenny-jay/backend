import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NameModel } from "./models/NameModel";
import { PlayerModel } from "./models/PlayerModel";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function getPlayer(
  id: string,
  startYear: number = 0,
  endYear: number = 9999
): Promise<Array<PlayerModel>> {
  const command = new GetCommand({
    TableName: "qb_stats",
    Key: {
      Id: id,
    },
  });

  try {
    const response = await docClient.send(command);
    const filteredStats: PlayerModel[] = response.Item.Stats.filter(
      (stat) => startYear <= stat.Year && endYear >= stat.Year
    );

    let prevYear = 0;
    var combinedStats: PlayerModel[] = [];
    filteredStats.forEach((stat, i) => {
      if (prevYear === stat.Year) {
        let prevStats = combinedStats[i - 1];
        prevStats.ATT = stat.ATT + prevStats.ATT;
        prevStats.CMP = stat.CMP + prevStats.CMP;
        prevStats.Team.push(stat.Team);
        prevStats["CMP%"] = Number((prevStats.CMP / prevStats.ATT).toFixed(2));
        prevStats.GP = stat.GP + prevStats.GP;
        prevStats.YDS = stat.YDS + prevStats.YDS;
        prevStats.INT = stat.INT + prevStats.INT;
        prevStats.TD = stat.TD + prevStats.TD;
        prevStats.SACK = stat.SACK + prevStats.SACK;
        prevStats.AVG = Number((prevStats.YDS / prevStats.ATT).toFixed(2));
        prevStats.LNG = Math.max(stat.LNG, prevStats.LNG);
        prevStats.RTG = calculateRTG(prevStats);
      } else {
        stat.Team = [stat["Team"]];
        combinedStats.push(stat);
      }
      prevYear = stat.Year;
    });

    return combinedStats;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

function calculateRTG({ ATT, CMP, TD, INT, YDS }): number {
  const compDivAtt = (CMP / ATT - 0.3) * 5;
  const ydsDivAtt = (YDS / ATT - 3) * 0.25;
  const tdDivAtt = (TD / ATT) * 20 + 2.375;
  const intDivAtt = (INT / ATT) * 25;
  return Number(
    (((compDivAtt + ydsDivAtt + tdDivAtt - intDivAtt) / 6) * 100).toFixed(2)
  );
}

export async function getPlayerNames(
  nameQuery: string
): Promise<Array<NameModel>> {
  nameQuery = nameQuery
    .toLowerCase()
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(" ");
  const command = new ScanCommand({
    ProjectionExpression: "Player, Id",
    TableName: "qb_stats",
    FilterExpression: "contains(Player, :n)",
    ExpressionAttributeValues: {
      ":n": nameQuery,
    },
  });

  const response = await docClient.send(command);
  return response.Items as Array<NameModel>;
}
