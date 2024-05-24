import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, getPresignedURL } from "./AWSClients";
import { NameModel } from "../models/responses/NameModel";
import { PlayerModel } from "../models/responses/PlayerModel";
import { StatsModel } from "../models/responses/StatsModel";

const PLAYERS_TABLE = "qb_stats";
class PlayerRepository {
  constructor() {}

  /**
   * Gets an individual player and filters data on the provided
   * start and end year
   * @param id id of a player

   * @returns List of stats between the provided years for a player
   */
  public async getPlayer(id: string): Promise<PlayerModel> {
    const command = new GetCommand({
      TableName: PLAYERS_TABLE,
      Key: {
        Id: id,
      },
    });
    try {
      const response = await docClient.send(command);

      // if a player was on multiple teams in on year,
      // combine the stats into one year
      let prevYear = 0;
      const combinedStats: StatsModel[] = [];
      response.Item.Stats.forEach((stat, i) => {
        if (prevYear === stat.Year) {
          let prevStats = combinedStats[i - 1];
          prevStats.ATT = stat.ATT + prevStats.ATT;
          prevStats.CMP = stat.CMP + prevStats.CMP;
          prevStats.Team.push(stat.Team);
          prevStats["CMP%"] = Number(
            (prevStats.CMP / prevStats.ATT).toFixed(2)
          );
          prevStats.GP = stat.GP + prevStats.GP;
          prevStats.YDS = stat.YDS + prevStats.YDS;
          prevStats.INT = stat.INT + prevStats.INT;
          prevStats.TD = stat.TD + prevStats.TD;
          prevStats.SACK = stat.SACK + prevStats.SACK;
          prevStats.AVG = Number((prevStats.YDS / prevStats.ATT).toFixed(2));
          prevStats.LNG = Math.max(stat.LNG, prevStats.LNG);
          prevStats.RTG = this.calculateRTG(prevStats);
        } else {
          stat.Team = [stat["Team"]];
          combinedStats.push(stat);
        }
        prevYear = stat.Year;
      });

      const player: PlayerModel = {
        "Current Team": response.Item["Current Team"],
        Id: response.Item.Id,
        ProfileUrl: await getPresignedURL(response.Item.Key),
        Player: response.Item.Player,
        Stats: combinedStats,
      };
      return player;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Helper function to calculate QB rating
   * @param param0 Retrieve the attempts, completions, touchdowns,
   * interceptions, and yards thrown stats from a PlayerModel object
   * @returns
   */
  calculateRTG({ ATT, CMP, TD, INT, YDS }): number {
    const compDivAtt = (CMP / ATT - 0.3) * 5;
    const ydsDivAtt = (YDS / ATT - 3) * 0.25;
    const tdDivAtt = (TD / ATT) * 20 + 2.375;
    const intDivAtt = (INT / ATT) * 25;
    return Number(
      (((compDivAtt + ydsDivAtt + tdDivAtt - intDivAtt) / 6) * 100).toFixed(2)
    );
  }

  /**
   * Given a string, will return a list of names and ids of
   * players whose names contain the string
   * @param nameQuery substring to search for names
   * @returns List of all the player names + ids that match the
   * namequery
   */
  public async getPlayerNames(nameQuery: string): Promise<Array<NameModel>> {
    nameQuery = nameQuery
      .toLowerCase()
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(" ");
    const command = new ScanCommand({
      ProjectionExpression: "Player, Id",
      TableName: PLAYERS_TABLE,
      FilterExpression: "contains(Player, :n)",
      ExpressionAttributeValues: {
        ":n": nameQuery,
      },
    });

    const response = await docClient.send(command);
    return response.Items as Array<NameModel>;
  }
}

export default PlayerRepository;
