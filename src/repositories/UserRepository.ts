import { UserRequest } from "../models/requests/UserRequest";
import { bcrypt } from "bcrypt";

export async function addUser(userReq: UserRequest): Promise<Boolean> {
  console.log("Added user: " + userReq.username);
  return true;
}

export async function getUser(userReq: UserRequest) {
  console.log("Retrieved user: " + userReq.username);
  return true;
}
