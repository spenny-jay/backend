import { randomUUID } from "crypto";
import { docClient } from "./AWSClients";
import { PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcrypt";

const TABLE_NAME = "users";

class UserRepository {
  constructor() {}

  /**
   * Will add a new user the users table upon validation
   * @param userReq
   * @returns boolean whether the function successfully added a user
   */
  public async signUp(username: string, password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, 8);
      const userId = randomUUID();
      const command = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: {
          username: { S: username },
          password: { S: hashedPassword },
          userId: { S: userId },
        },
      });

      await docClient.send(command);
      console.log("Signed up user: " + username);
      return userId;
    } catch (e) {
      console.log("Error encountered when signing up user: " + username);
      return null;
    }
  }

  /**
   * Will retrieve a user according to the user's username
   * @param username
   * @param password
   * @returns user data for the given username
   */
  public async logIn(username: string, password: string): Promise<string> {
    const command = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        username: { S: username },
      },
      ProjectionExpression: "password, userId",
    });

    const response = await docClient.send(command);
    if (!response.Item || !response.Item.password || !response.Item.userId) {
      console.log(
        "Invalid username and password combination for user: " + username
      );
      return null;
    }

    const hashedPassword = response.Item.password.S;
    const userId = response.Item.userId.S;
    const isPasswordRight = bcrypt.compareSync(password, hashedPassword);

    if (isPasswordRight) {
      console.log(
        `Valid password, logging in user: ${username} with id: ${userId}`
      );
      return userId;
    }

    console.log("Invalid password for user: " + username);
    return null;
  }

  /**
   * Checks to see whether the username is present in the table.
   * Utilized to see whether a username is unique when signing up
   * @param username
   * @returns boolean if the provided username is unique or not
   */
  public async containsUser(username: string): Promise<Boolean> {
    const command = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        username: { S: username },
      },
      ProjectionExpression: "username",
    });

    try {
      const response = await docClient.send(command);
      return response.Item?.username.S === username;
    } catch (e) {
      console.log(
        `Error when checking for duplicate username: ${username}.  ${e}`
      );
      throw e;
    }
  }
}

const userRepo = new UserRepository();
export default userRepo;
