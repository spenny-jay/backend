import { UserRequest } from "../models/requests/UserRequest";
import docClient from "./AWSClients";
import { PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcrypt";

const USERS_TABLE = "users";

class UserRepository {
  constructor() {}

  /**
   * Will add a new user the users table upon validation
   * @param userReq
   * @returns boolean whether the function successfully added a user
   */
  public async signUp(userReq: UserRequest): Promise<void> {
    const username = userReq.username;
    const password = userReq.password;
    try {
      const hashedPassword = await bcrypt.hash(password, 8);
      const command = new PutItemCommand({
        TableName: USERS_TABLE,
        Item: {
          username: { S: username },
          password: { S: hashedPassword },
        },
      });

      await docClient.send(command);
      console.log("Signed up user: " + username);
    } catch (e) {
      console.log("Error encountered when signing up user: " + username);
      throw e;
    }
  }

  /**
   * Will retrieve a user according to the user's username
   * @param username
   * @param password
   * @returns user data for the given username
   */
  public async logIn(username: string, password: string): Promise<Boolean> {
    const command = new GetItemCommand({
      TableName: USERS_TABLE,
      Key: {
        username: { S: username },
      },
      ProjectionExpression: "password",
    });

    const response = await docClient.send(command);
    const hashedPassword = response.Item.password.S;
    const isPasswordRight = bcrypt.compareSync(password, hashedPassword);

    if (isPasswordRight) {
      console.log("Valid password, logging in user: " + username);
      return true;
    }

    console.log("Invalid password for user: " + username);
    return false;
  }

  /**
   * Checks to see whether the username is present in the table.
   * Utilized to see whether a username is unique when signing up
   * @param username
   * @returns boolean if the provided username is unique or not
   */
  public async containsUser(username: string): Promise<Boolean> {
    const command = new GetItemCommand({
      TableName: USERS_TABLE,
      Key: {
        username: { S: username },
      },
      ProjectionExpression: "username",
    });

    const response = await docClient.send(command);
    return response.Item?.username.S === username;
  }
}

export default UserRepository;
